import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Bid, BidStatus } from './entities/bid.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { CreateBidDto } from './dto/create-bid.dto';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  private async getShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
    });
    if (!shipment) throw new NotFoundException(`Shipment ${shipmentId} not found`);
    return shipment;
  }

  async submitBid(
    shipmentId: string,
    carrierId: string,
    dto: CreateBidDto,
  ): Promise<Bid> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException('Bids can only be placed on PENDING shipments');
    }

    const existing = await this.bidRepo.findOne({
      where: { shipmentId, carrierId, status: BidStatus.PENDING },
    });
    if (existing) {
      throw new BadRequestException('You already have a pending bid on this shipment');
    }

    const bid = this.bidRepo.create({
      shipmentId,
      carrierId,
      proposedPrice: dto.proposedPrice,
      message: dto.message ?? null,
    });
    return this.bidRepo.save(bid);
  }

  async getBids(shipmentId: string, requesterId: string): Promise<Bid[]> {
    const shipment = await this.getShipment(shipmentId);
    if (shipment.shipperId !== requesterId) {
      throw new ForbiddenException('Only the shipment owner can view bids');
    }
    return this.bidRepo.find({
      where: { shipmentId },
      relations: ['carrier'],
      order: { proposedPrice: 'ASC' },
    });
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

    const bid = await this.bidRepo.findOne({ where: { id: bidId, shipmentId } });
    if (!bid) throw new NotFoundException(`Bid ${bidId} not found`);
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException('Bid is no longer pending');
    }

    // Accept this bid
    bid.status = BidStatus.ACCEPTED;
    await this.bidRepo.save(bid);

    // Reject all other pending bids for this shipment
    await this.bidRepo.update(
      { shipmentId, status: BidStatus.PENDING, id: Not(bidId) },
      { status: BidStatus.REJECTED },
    );

    // Assign carrier to shipment
    await this.shipmentRepo.update(shipmentId, {
      carrierId: bid.carrierId,
      status: ShipmentStatus.ACCEPTED,
    });

    return bid;
  }
}
