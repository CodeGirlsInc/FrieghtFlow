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
      throw new BadRequestException(
        'You already have a pending bid on this shipment',
      );
    }

    const bid = this.bidRepo.create({
      shipmentId,
      carrierId,
      proposedPrice: dto.proposedPrice,
      message: dto.message ?? null,
    });
    return this.bidRepo.save(bid);
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

    // Accept this bid, reject the shipment's other pending bids, and assign
    // the carrier — all in a single transaction so a crash between steps can
    // never leave the shipment ACCEPTED without a carrier (or vice versa).
    const queryRunner = this.bidRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    bid.status = BidStatus.ACCEPTED;
    return bid;
  }
}
