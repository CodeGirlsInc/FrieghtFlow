import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Bid, BidStatus } from './entities/bid.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { CreateBidDto } from './dto/create-bid.dto';

export const BID_SUBMITTED = 'bid.submitted';
export const BID_ACCEPTED = 'bid.accepted';
export const BID_REJECTED = 'bid.rejected';

export class BidEvent {
  constructor(
    public readonly bid: Bid,
    public readonly shipment: Shipment,
  ) {}
}

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async getShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
    });
    if (!shipment)
      throw new NotFoundException(`Shipment ${shipmentId} not found`);
    return shipment;
  }

  async submitBid(
    shipmentId: string,
    carrierId: string,
    dto: CreateBidDto,
  ): Promise<Bid> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException(
        'Bids can only be placed on PENDING shipments',
      );
    }

    if (shipment.shipperId === carrierId) {
      throw new ForbiddenException('Cannot bid on your own shipment');
    }

    const existing = await this.bidRepo.findOne({
      where: { shipmentId, carrierId, status: BidStatus.PENDING },
    });
    if (existing) {
      throw new ConflictException(
        'You already have a pending bid on this shipment',
      );
    }

    const bid = this.bidRepo.create({
      shipmentId,
      carrierId,
      proposedPrice: dto.proposedPrice,
      message: dto.message ?? null,
    });

    let saved: Bid;
    try {
      saved = await this.bidRepo.save(bid);
    } catch (error: unknown) {
      // Handle DB-level unique constraint violation (concurrent duplicate).
      const code =
        (error as { code?: string })?.code ??
        (error as { driverError?: { code?: string } })?.driverError?.code;
      if (code === '23505') {
        throw new ConflictException(
          'You already have a pending bid on this shipment',
        );
      }
      throw error;
    }

    this.eventEmitter.emit(BID_SUBMITTED, new BidEvent(saved, shipment));
    return saved;
  }

  async getBids(
    shipmentId: string,
    requesterId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Bid[]; total: number; page: number; limit: number; totalPages: number }> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.shipperId !== requesterId) {
      throw new ForbiddenException('Only the shipment owner can view bids');
    }

    const skip = (page - 1) * limit;
    const [data, total] = await this.bidRepo.findAndCount({
      where: { shipmentId },
      relations: ['carrier'],
      order: { proposedPrice: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyBids(
    carrierId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Bid[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.bidRepo.findAndCount({
      where: { carrierId },
      relations: ['shipment'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async withdrawBid(
    shipmentId: string,
    bidId: string,
    carrierId: string,
  ): Promise<Bid> {
    const bid = await this.bidRepo.findOne({
      where: { id: bidId, shipmentId },
    });
    if (!bid) throw new NotFoundException(`Bid ${bidId} not found`);
    if (bid.carrierId !== carrierId) {
      throw new ForbiddenException('You can only withdraw your own bids');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Only pending bids can be withdrawn');
    }

    bid.status = BidStatus.REJECTED;
    const saved = await this.bidRepo.save(bid);
    const shipment = await this.getShipment(shipmentId);
    this.eventEmitter.emit(BID_REJECTED, new BidEvent(saved, shipment));
    return saved;
  }

  async acceptBid(
    shipmentId: string,
    bidId: string,
    requesterId: string,
  ): Promise<Bid> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.shipperId !== requesterId) {
      throw new ForbiddenException('Only the shipment owner can accept bids');
    }
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException('Shipment is no longer accepting bids');
    }

    const bid = await this.bidRepo.findOne({
      where: { id: bidId, shipmentId },
    });
    if (!bid) throw new NotFoundException(`Bid ${bidId} not found`);
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Bid is no longer pending');
    }

    const queryRunner = this.bidRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let acceptedBid: Bid;
    try {
      await queryRunner.manager.update(
        Bid,
        { id: bid.id },
        { status: BidStatus.ACCEPTED },
      );
      await queryRunner.manager.update(
        Bid,
        { shipmentId, status: BidStatus.PENDING, id: Not(bidId) },
        { status: BidStatus.REJECTED },
      );
      await queryRunner.manager.update(Shipment, shipmentId, {
        carrierId: bid.carrierId,
        status: ShipmentStatus.ACCEPTED,
        price: bid.proposedPrice,
        listedPrice: shipment.listedPrice ?? shipment.price,
        insurancePremium: shipment.isInsured
          ? Math.round(Number(bid.proposedPrice) * 0.015 * 100) / 100
          : null,
      });
      await queryRunner.commitTransaction();

      bid.status = BidStatus.ACCEPTED;
      acceptedBid = bid;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Notify: winning carrier
    this.eventEmitter.emit(BID_ACCEPTED, new BidEvent(acceptedBid, shipment));

    // Notify: losing carriers — load rejected bids and emit per carrier
    const rejectedBids = await this.bidRepo.find({
      where: { shipmentId, status: BidStatus.REJECTED, id: Not(bidId) },
    });
    for (const rejected of rejectedBids) {
      this.eventEmitter.emit(BID_REJECTED, new BidEvent(rejected, shipment));
    }

    return acceptedBid;
  }

  /**
   * Closes all remaining PENDING bids for a shipment that has left PENDING
   * status by a path other than acceptBid (e.g. direct carrier accept or
   * shipper/admin cancellation).  Call within the same transaction when
   * possible.
   */
  async closeOpenBids(shipmentId: string): Promise<void> {
    await this.bidRepo.update(
      { shipmentId, status: BidStatus.PENDING },
      { status: BidStatus.REJECTED },
    );
  }
}
