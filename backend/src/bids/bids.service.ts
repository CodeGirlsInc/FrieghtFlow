import {
  BadRequestException,
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
import { CounterBidDto } from './dto/counter-bid.dto';

const BID_EXPIRY_HOURS = 48;

export const BID_COUNTERED = 'bid.countered';
export const BID_COUNTER_DECLINED = 'bid.counter_declined';

export interface BidWithExpiry extends Bid {
  isExpired: boolean;
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

  private async getBidOrFail(bidId: string, shipmentId: string): Promise<Bid> {
    const bid = await this.bidRepo.findOne({ where: { id: bidId, shipmentId }, relations: ['carrier'] });
    if (!bid) throw new NotFoundException(`Bid ${bidId} not found`);
    return bid;
  }

  private addIsExpired(bid: Bid): BidWithExpiry {
    const isExpired = !!bid.expiresAt && new Date() > new Date(bid.expiresAt);
    return { ...bid, isExpired } as BidWithExpiry;
  }

  private isBidExpired(bid: Bid): boolean {
    return !!bid.expiresAt && new Date() > new Date(bid.expiresAt);
  }

  async submitBid(
    shipmentId: string,
    carrierId: string,
    dto: CreateBidDto,
  ): Promise<BidWithExpiry> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException(
        'Bids can only be placed on PENDING shipments',
      );
    }

    const existing = await this.bidRepo.findOne({
      where: { shipmentId, carrierId, status: BidStatus.PENDING },
    });
    if (existing) {
      throw new BadRequestException(
        'You already have a pending bid on this shipment',
      );
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + BID_EXPIRY_HOURS);

    const bid = this.bidRepo.create({
      shipmentId,
      carrierId,
      proposedPrice: dto.proposedPrice,
      message: dto.message ?? null,
      expiresAt,
    });
    const saved = await this.bidRepo.save(bid);
    return this.addIsExpired(saved);
  }

  async getBids(shipmentId: string, requesterId: string): Promise<BidWithExpiry[]> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.shipperId !== requesterId) {
      throw new ForbiddenException('Only the shipment owner can view bids');
    }
    const bids = await this.bidRepo.find({
      where: { shipmentId },
      relations: ['carrier'],
      order: { proposedPrice: 'ASC' },
    });
    return bids.map(b => this.addIsExpired(b));
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

    bid.status = BidStatus.ACCEPTED;
    await this.bidRepo.save(bid);

    await this.bidRepo.update(
      { shipmentId, status: BidStatus.PENDING, id: Not(bidId) },
      { status: BidStatus.REJECTED },
    );

    await this.shipmentRepo.update(shipmentId, {
      carrierId: bid.carrierId,
      status: ShipmentStatus.ACCEPTED,
    });

    return bid;
  }

  async counterBid(
    shipmentId: string,
    bidId: string,
    requesterId: string,
    dto: CounterBidDto,
  ): Promise<BidWithExpiry> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.shipperId !== requesterId) {
      throw new ForbiddenException('Only the shipment owner can make a counteroffer');
    }

    const bid = await this.getBidOrFail(bidId, shipmentId);
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Can only counter a PENDING bid');
    }
    if (this.isBidExpired(bid)) {
      throw new BadRequestException('This bid has expired and cannot be countered');
    }

    bid.counterPrice = dto.counterPrice;
    bid.counterMessage = dto.counterMessage ?? null;
    bid.status = BidStatus.COUNTER_OFFERED;
    bid.counterOfferedAt = new Date();
    const saved = await this.bidRepo.save(bid);

    this.eventEmitter.emit(BID_COUNTERED, { bid: saved, shipment });

    return this.addIsExpired(saved);
  }

  async acceptCounter(
    shipmentId: string,
    bidId: string,
    requesterId: string,
  ): Promise<Bid> {
    const shipment = await this.getShipment(shipmentId);
    const bid = await this.getBidOrFail(bidId, shipmentId);

    if (bid.carrierId !== requesterId) {
      throw new ForbiddenException('Only the bid owner can accept the counter');
    }
    if (bid.status !== BidStatus.COUNTER_OFFERED) {
      throw new BadRequestException('Bid is not in COUNTER_OFFERED status');
    }

    bid.status = BidStatus.COUNTER_ACCEPTED;
    bid.proposedPrice = bid.counterPrice!;
    await this.bidRepo.save(bid);

    await this.bidRepo.update(
      { shipmentId, status: BidStatus.PENDING, id: Not(bidId) },
      { status: BidStatus.REJECTED },
    );

    await this.shipmentRepo.update(shipmentId, {
      carrierId: bid.carrierId,
      status: ShipmentStatus.ACCEPTED,
    });

    this.eventEmitter.emit('shipment.accepted', { shipment, actorId: requesterId });

    return bid;
  }

  async declineCounter(
    shipmentId: string,
    bidId: string,
    requesterId: string,
  ): Promise<Bid> {
    const bid = await this.getBidOrFail(bidId, shipmentId);
    const shipment = await this.getShipment(shipmentId);

    if (bid.carrierId !== requesterId) {
      throw new ForbiddenException('Only the bid owner can decline the counter');
    }
    if (bid.status !== BidStatus.COUNTER_OFFERED) {
      throw new BadRequestException('Bid is not in COUNTER_OFFERED status');
    }

    bid.status = BidStatus.REJECTED;
    await this.bidRepo.save(bid);

    this.eventEmitter.emit(BID_COUNTER_DECLINED, { bid, shipment });

    return bid;
  }
}
