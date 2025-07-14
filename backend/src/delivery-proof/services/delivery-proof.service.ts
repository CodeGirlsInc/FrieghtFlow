import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { EventEmitter2 } from "@nestjs/event-emitter"
import { type DeliveryProof, ProofStatus, ProofType } from "../entities/delivery-proof.entity"
import type { CreateDeliveryProofDto } from "../dto/create-delivery-proof.dto"
import type { UpdateDeliveryProofDto } from "../dto/update-delivery-proof.dto"
import type { QueryDeliveryProofDto } from "../dto/query-delivery-proof.dto"
import {
  DeliveryProofCreatedEvent,
  DeliveryProofVerifiedEvent,
  DeliveryProofFailedEvent,
  BlockchainUpdateRequestedEvent,
} from "../events/delivery-proof.events"
import {
  DeliveryProofNotFoundException,
  DuplicateDeliveryProofException,
  InvalidProofDataException,
  ProofExpiredException,
} from "../exceptions/delivery-proof.exceptions"

@Injectable()
export class DeliveryProofService {
  private readonly logger = new Logger(DeliveryProofService.name)

  constructor(
    private readonly deliveryProofRepository: Repository<DeliveryProof>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateDeliveryProofDto): Promise<DeliveryProof> {
    this.logger.log(`Creating delivery proof for delivery: ${createDto.deliveryId}`)

    // Check for duplicate proof
    await this.checkForDuplicateProof(createDto.deliveryId, createDto.proofType)

    // Validate proof data based on type
    this.validateProofData(createDto)

    // Create the proof entity
    const deliveryProof = this.deliveryProofRepository.create({
      ...createDto,
      status: ProofStatus.PENDING,
      verificationAttempts: 0,
    })

    try {
      const savedProof = await this.deliveryProofRepository.save(deliveryProof)

      // Emit event for further processing
      this.eventEmitter.emit("delivery-proof.created", new DeliveryProofCreatedEvent(savedProof))

      this.logger.log(`Delivery proof created with ID: ${savedProof.id}`)
      return savedProof
    } catch (error) {
      this.logger.error(`Failed to create delivery proof: ${error.message}`, error.stack)
      throw error
    }
  }

  async findAll(queryDto: QueryDeliveryProofDto): Promise<{ data: DeliveryProof[]; total: number }> {
    const { deliveryId, proofType, status, fromDate, toDate, limit, offset, sortBy, sortOrder } = queryDto

    const queryBuilder = this.deliveryProofRepository.createQueryBuilder("proof")

    if (deliveryId) {
      queryBuilder.andWhere("proof.deliveryId = :deliveryId", { deliveryId })
    }

    if (proofType) {
      queryBuilder.andWhere("proof.proofType = :proofType", { proofType })
    }

    if (status) {
      queryBuilder.andWhere("proof.status = :status", { status })
    }

    if (fromDate) {
      queryBuilder.andWhere("proof.createdAt >= :fromDate", { fromDate })
    }

    if (toDate) {
      queryBuilder.andWhere("proof.createdAt <= :toDate", { toDate })
    }

    queryBuilder.orderBy(`proof.${sortBy}`, sortOrder).skip(offset).take(limit)

    const [data, total] = await queryBuilder.getManyAndCount()

    return { data, total }
  }

  async findOne(id: string): Promise<DeliveryProof> {
    const deliveryProof = await this.deliveryProofRepository.findOne({
      where: { id },
    })

    if (!deliveryProof) {
      throw new DeliveryProofNotFoundException(id)
    }

    // Check if proof has expired
    if (deliveryProof.expiresAt && deliveryProof.expiresAt < new Date()) {
      throw new ProofExpiredException(id)
    }

    return deliveryProof
  }

  async findByDeliveryId(deliveryId: string): Promise<DeliveryProof[]> {
    return this.deliveryProofRepository.find({
      where: { deliveryId },
      order: { createdAt: "DESC" },
    })
  }

  async update(id: string, updateDto: UpdateDeliveryProofDto): Promise<DeliveryProof> {
    const deliveryProof = await this.findOne(id)

    Object.assign(deliveryProof, updateDto)
    deliveryProof.updatedAt = new Date()

    const updatedProof = await this.deliveryProofRepository.save(deliveryProof)

    // Emit events based on status changes
    if (updateDto.status === ProofStatus.VERIFIED) {
      this.eventEmitter.emit("delivery-proof.verified", new DeliveryProofVerifiedEvent(updatedProof))
    } else if (updateDto.status === ProofStatus.FAILED) {
      this.eventEmitter.emit(
        "delivery-proof.failed",
        new DeliveryProofFailedEvent(updatedProof, updateDto.lastError || "Unknown error"),
      )
    }

    return updatedProof
  }

  async verifyProof(id: string): Promise<DeliveryProof> {
    const deliveryProof = await this.findOne(id)

    if (deliveryProof.status !== ProofStatus.PENDING) {
      throw new InvalidProofDataException("Proof is not in pending status")
    }

    deliveryProof.status = ProofStatus.VERIFIED
    deliveryProof.verificationAttempts += 1
    deliveryProof.updatedAt = new Date()

    const verifiedProof = await this.deliveryProofRepository.save(deliveryProof)

    // Emit events
    this.eventEmitter.emit("delivery-proof.verified", new DeliveryProofVerifiedEvent(verifiedProof))
    this.eventEmitter.emit("blockchain.update-requested", new BlockchainUpdateRequestedEvent(verifiedProof))

    this.logger.log(`Delivery proof verified: ${id}`)
    return verifiedProof
  }

  async markAsFailed(id: string, error: string): Promise<DeliveryProof> {
    const deliveryProof = await this.findOne(id)

    deliveryProof.status = ProofStatus.FAILED
    deliveryProof.lastError = error
    deliveryProof.verificationAttempts += 1
    deliveryProof.updatedAt = new Date()

    const failedProof = await this.deliveryProofRepository.save(deliveryProof)

    this.eventEmitter.emit("delivery-proof.failed", new DeliveryProofFailedEvent(failedProof, error))

    this.logger.warn(`Delivery proof marked as failed: ${id}, Error: ${error}`)
    return failedProof
  }

  async updateBlockchainInfo(id: string, txHash: string, blockNumber: string): Promise<DeliveryProof> {
    const deliveryProof = await this.findOne(id)

    deliveryProof.blockchainTxHash = txHash
    deliveryProof.blockchainBlockNumber = blockNumber
    deliveryProof.status = ProofStatus.BLOCKCHAIN_CONFIRMED
    deliveryProof.updatedAt = new Date()

    const updatedProof = await this.deliveryProofRepository.save(deliveryProof)

    this.logger.log(`Blockchain info updated for proof: ${id}, TX: ${txHash}`)
    return updatedProof
  }

  async delete(id: string): Promise<void> {
    const deliveryProof = await this.findOne(id)
    await this.deliveryProofRepository.remove(deliveryProof)
    this.logger.log(`Delivery proof deleted: ${id}`)
  }

  async getStatistics(): Promise<any> {
    const stats = await this.deliveryProofRepository
      .createQueryBuilder("proof")
      .select([
        "COUNT(*) as total",
        "COUNT(CASE WHEN status = :pending THEN 1 END) as pending",
        "COUNT(CASE WHEN status = :verified THEN 1 END) as verified",
        "COUNT(CASE WHEN status = :failed THEN 1 END) as failed",
        "COUNT(CASE WHEN status = :blockchainConfirmed THEN 1 END) as blockchainConfirmed",
      ])
      .setParameters({
        pending: ProofStatus.PENDING,
        verified: ProofStatus.VERIFIED,
        failed: ProofStatus.FAILED,
        blockchainConfirmed: ProofStatus.BLOCKCHAIN_CONFIRMED,
      })
      .getRawOne()

    return {
      total: Number.parseInt(stats.total),
      pending: Number.parseInt(stats.pending),
      verified: Number.parseInt(stats.verified),
      failed: Number.parseInt(stats.failed),
      blockchainConfirmed: Number.parseInt(stats.blockchainConfirmed),
    }
  }

  private async checkForDuplicateProof(deliveryId: string, proofType: ProofType): Promise<void> {
    const existingProof = await this.deliveryProofRepository.findOne({
      where: {
        deliveryId,
        proofType,
        status: ProofStatus.VERIFIED,
      },
    })

    if (existingProof) {
      throw new DuplicateDeliveryProofException(deliveryId, proofType)
    }
  }

  private validateProofData(createDto: CreateDeliveryProofDto): void {
    switch (createDto.proofType) {
      case ProofType.SIGNATURE:
        if (!createDto.signature) {
          throw new InvalidProofDataException("Signature is required for signature proof type")
        }
        break
      case ProofType.PHOTO:
        if (!createDto.photoUrl) {
          throw new InvalidProofDataException("Photo URL is required for photo proof type")
        }
        break
      case ProofType.TOKEN:
        if (!createDto.token) {
          throw new InvalidProofDataException("Token is required for token proof type")
        }
        break
      case ProofType.QR_CODE:
        if (!createDto.qrData) {
          throw new InvalidProofDataException("QR data is required for QR code proof type")
        }
        break
      default:
        throw new InvalidProofDataException("Invalid proof type")
    }
  }
}
