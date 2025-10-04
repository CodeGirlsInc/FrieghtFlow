import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StellarContractService } from './stellar-contract.service';
import { BookingRepository } from './booking.repository';
import {
  CreateBookingDto,
  ConfirmCapacityDto,
  BookingQueryDto,
} from './dto';
import { BookingStatus } from './enums/booking-status.enum';

@Injectable()
export class StellarFreightService {
  constructor(
    private readonly stellarContract: StellarContractService,
    private readonly bookingRepo: BookingRepository,
  ) {}

  async createBooking(dto: CreateBookingDto) {
    // Validate shipper account
    const isValid = await this.stellarContract.validateAccount(
      dto.shipperPublicKey,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid shipper Stellar account');
    }

    // Deploy smart contract for this booking
    const contractResult = await this.stellarContract.deployBookingContract({
      shipperAddress: dto.shipperPublicKey,
      origin: dto.origin,
      destination: dto.destination,
      cargoDetails: dto.cargoDetails,
      rate: dto.rate,
      currency: dto.currency,
      validUntil: dto.validUntil,
    });

    // Store booking in database
    const booking = await this.bookingRepo.create({
      contractId: contractResult.contractId,
      contractAddress: contractResult.contractAddress,
      shipperPublicKey: dto.shipperPublicKey,
      origin: dto.origin,
      destination: dto.destination,
      cargoDetails: dto.cargoDetails,
      rate: dto.rate,
      currency: dto.currency,
      validUntil: dto.validUntil,
      status: BookingStatus.PENDING,
      transactionHash: contractResult.transactionHash,
    });

    return {
      bookingId: booking.id,
      contractAddress: contractResult.contractAddress,
      contractId: contractResult.contractId,
      transactionHash: contractResult.transactionHash,
      status: booking.status,
      lockedRate: booking.rate,
      validUntil: booking.validUntil,
    };
  }

  async confirmCapacity(bookingId: string, dto: ConfirmCapacityDto) {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        'Booking is not in pending state',
      );
    }

    // Check if booking is still valid
    if (new Date() > booking.validUntil) {
      await this.bookingRepo.update(bookingId, {
        status: BookingStatus.EXPIRED,
      });
      throw new BadRequestException('Booking has expired');
    }

    // Validate carrier account
    const isValid = await this.stellarContract.validateAccount(
      dto.carrierPublicKey,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid carrier Stellar account');
    }

    // Execute smart contract to confirm capacity
    const confirmResult = await this.stellarContract.confirmCapacity({
      contractId: booking.contractId,
      contractAddress: booking.contractAddress,
      carrierAddress: dto.carrierPublicKey,
      vesselId: dto.vesselId,
      availableCapacity: dto.availableCapacity,
      estimatedDeparture: dto.estimatedDeparture,
      estimatedArrival: dto.estimatedArrival,
    });

    // Update booking status
    const updatedBooking = await this.bookingRepo.update(bookingId, {
      carrierPublicKey: dto.carrierPublicKey,
      vesselId: dto.vesselId,
      availableCapacity: dto.availableCapacity,
      estimatedDeparture: dto.estimatedDeparture,
      estimatedArrival: dto.estimatedArrival,
      status: BookingStatus.CONFIRMED,
      confirmationTransactionHash: confirmResult.transactionHash,
    });

    return {
      bookingId: updatedBooking.id,
      status: updatedBooking.status,
      transactionHash: confirmResult.transactionHash,
      carrier: dto.carrierPublicKey,
      vesselId: dto.vesselId,
      estimatedDeparture: dto.estimatedDeparture,
      estimatedArrival: dto.estimatedArrival,
    };
  }

  async getBooking(bookingId: string) {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async listBookings(query: BookingQueryDto) {
    return this.bookingRepo.findAll(query);
  }

  async getContractState(bookingId: string) {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const contractState = await this.stellarContract.getContractState(
      booking.contractId,
    );

    return {
      bookingId,
      contractAddress: booking.contractAddress,
      contractState,
    };
  }
}