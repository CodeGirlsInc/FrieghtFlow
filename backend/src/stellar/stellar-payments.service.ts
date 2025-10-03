import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscrowTransaction, EscrowStatus } from './entities/escrow.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../audit-log/entities/audit-log.entity';
import { ConfigService } from '@nestjs/config';
import { Horizon, Keypair, Networks, TransactionBuilder, Operation, Asset, Memo } from '@stellar/stellar-sdk';


interface CreateEscrowPayload {
  amount: number;
  assetCode?: string; // default XLM
  assetIssuer?: string; // for non-native assets
  carrierStellarAddress: string;
  shipperStellarAddress: string;
  shipperUserId?: string;
  carrierPartnerId?: string;
}

@Injectable()
export class StellarPaymentsService {
  private server: Horizon.Server;
  private networkPassphrase: string;
  private escrowSecret: string;
  private escrowPublic: string;

  constructor(
    @InjectRepository(EscrowTransaction)
    private readonly escrowRepo: Repository<EscrowTransaction>,
    private readonly auditLogService: AuditLogService,
    private readonly configService: ConfigService,
  ) {
    const horizon = this.configService.get<string>('STELLAR_HORIZON_URL') || 'https://horizon-testnet.stellar.org';
    const network = (this.configService.get<string>('STELLAR_NETWORK') || 'testnet').toLowerCase();
    this.networkPassphrase = network === 'public' ? Networks.PUBLIC : Networks.TESTNET;
    this.server = new Horizon.Server(horizon);
    const secret = this.configService.get<string>('STELLAR_ESCROW_SECRET');
    if (!secret) {
      throw new Error('STELLAR_ESCROW_SECRET not configured');
    }
    this.escrowSecret = secret;
    const kp = Keypair.fromSecret(secret);
    this.escrowPublic = this.configService.get<string>('STELLAR_ESCROW_PUBLIC') || kp.publicKey();
  }

  private getEscrowKeypair(): Keypair {
    return Keypair.fromSecret(this.escrowSecret);
  }

  private formatAmount(amount: number): string {
    // Stellar supports up to 7 decimal places
    return amount.toFixed(7);
  }

  async createEscrow(payload: CreateEscrowPayload, actorUserId?: string): Promise<EscrowTransaction> {
    if (payload.amount <= 0) throw new BadRequestException('Amount must be positive');
    const depositMemo = `ESCROW-${Date.now().toString(36)}`;

    const escrow = this.escrowRepo.create({
      amount: this.formatAmount(payload.amount),
      assetCode: payload.assetCode || 'XLM',
      assetIssuer: payload.assetIssuer,
      status: EscrowStatus.PENDING_FUNDING,
      escrowAccountPublic: this.escrowPublic,
      depositMemo,
      carrierStellarAddress: payload.carrierStellarAddress,
      shipperStellarAddress: payload.shipperStellarAddress,
      shipperUserId: payload.shipperUserId,
      carrierPartnerId: payload.carrierPartnerId,
    });

    const saved = await this.escrowRepo.save(escrow);

    await this.auditLogService.createLog({
      action: AuditAction.USER_CREATED,
      userId: actorUserId,
      entityType: 'Escrow',
      entityId: saved.id,
      newValues: { id: saved.id, amount: saved.amount, depositMemo: saved.depositMemo },
      source: 'stellar-payments-service',
    });

    return saved;
  }

  async getEscrow(id: string): Promise<EscrowTransaction> {
    const escrow = await this.escrowRepo.findOne({ where: { id } });
    if (!escrow) throw new NotFoundException(`Escrow ${id} not found`);
    return escrow;
  }

  async listEscrows(status?: EscrowStatus): Promise<EscrowTransaction[]> {
    const where = status ? { status } : {};
    return this.escrowRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async verifyFunding(id: string, actorUserId?: string): Promise<EscrowTransaction> {
    const escrow = await this.getEscrow(id);
    if (escrow.status !== EscrowStatus.PENDING_FUNDING) return escrow;

    // Check recent payments to escrow account and match memo
    const payments = await this.server.payments().forAccount(escrow.escrowAccountPublic).limit(50).order('desc').call();

    let matched = false;
    let txHash: string | undefined;
    for (const record of payments.records) {
      if (record.type === 'payment' && record.asset_type === 'native') {
        try {
          const tx = await this.server.transactions().transaction(record.transaction_hash).call();
          if (tx.memo === escrow.depositMemo) {
            matched = true;
            txHash = record.transaction_hash;
            break;
          }
        } catch (_) {}
      }
    }

    if (!matched) {
      throw new BadRequestException('Funding not detected yet. Ensure payment was sent with the correct memo.');
    }

    escrow.status = EscrowStatus.FUNDED;
    escrow.fundedAt = new Date();
    escrow.fundingTxHash = txHash || null;
    const saved = await this.escrowRepo.save(escrow);

    await this.auditLogService.createLog({
      action: AuditAction.PAYMENT_PROCESSED,
      userId: actorUserId,
      entityType: 'Escrow',
      entityId: saved.id,
      newValues: { status: saved.status, fundingTxHash: saved.fundingTxHash },
      metadata: { event: 'funding_verified' },
      source: 'stellar-payments-service',
    });

    return saved;
  }

  async releaseEscrow(id: string, actorUserId?: string): Promise<EscrowTransaction> {
    const escrow = await this.getEscrow(id);
    if (escrow.status !== EscrowStatus.FUNDED) {
      throw new BadRequestException('Escrow must be funded before release');
    }

    const kp = this.getEscrowKeypair();
    const account = await this.server.loadAccount(this.escrowPublic);
    const fee = String(await this.server.fetchBaseFee());

    const tx = new TransactionBuilder(account, { fee, networkPassphrase: this.networkPassphrase })
      .addOperation(
        Operation.payment({
          destination: escrow.carrierStellarAddress,
          asset: Asset.native(),
          amount: escrow.amount,
        })
      )
      .addMemo(Memo.text(escrow.depositMemo))
      .setTimeout(180)
      .build();

    tx.sign(kp);
    const res = await this.server.submitTransaction(tx);

    escrow.status = EscrowStatus.RELEASED;
    escrow.releasedAt = new Date();
    escrow.releaseTxHash = res.hash;
    const saved = await this.escrowRepo.save(escrow);

    await this.auditLogService.createLog({
      action: AuditAction.PAYMENT_PROCESSED,
      userId: actorUserId,
      entityType: 'Escrow',
      entityId: saved.id,
      newValues: { status: saved.status, releaseTxHash: saved.releaseTxHash },
      source: 'stellar-payments-service',
    });

    return saved;
  }

  async refundEscrow(id: string, actorUserId?: string): Promise<EscrowTransaction> {
    const escrow = await this.getEscrow(id);
    if (![EscrowStatus.FUNDED, EscrowStatus.PENDING_FUNDING].includes(escrow.status)) {
      throw new BadRequestException('Escrow can only be refunded if funded or pending funding');
    }

    const kp = this.getEscrowKeypair();
    const account = await this.server.loadAccount(this.escrowPublic);
    const fee = String(await this.server.fetchBaseFee());

    const tx = new TransactionBuilder(account, { fee, networkPassphrase: this.networkPassphrase })
      .addOperation(
        Operation.payment({
          destination: escrow.shipperStellarAddress,
          asset: Asset.native(),
          amount: escrow.amount,
        })
      )
      .addMemo(Memo.text(escrow.depositMemo))
      .setTimeout(180)
      .build();

    tx.sign(kp);
    const res = await this.server.submitTransaction(tx);

    escrow.status = EscrowStatus.REFUNDED;
    escrow.refundedAt = new Date();
    escrow.refundTxHash = res.hash;
    const saved = await this.escrowRepo.save(escrow);

    await this.auditLogService.createLog({
      action: AuditAction.PAYMENT_PROCESSED,
      userId: actorUserId,
      entityType: 'Escrow',
      entityId: saved.id,
      newValues: { status: saved.status, refundTxHash: saved.refundTxHash },
      source: 'stellar-payments-service',
    });

    return saved;
  }
}