import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreightJob, FreightJobStatus } from '../entities/freight-job.entity';
import {
  CreateFreightJobDto,
  UpdateFreightJobDto,
  AssignCarrierDto,
  FilterFreightJobsDto,
  FreightJobResponseDto,
  PaginatedResponseDto,
} from '../dtos/freight-job.dto';
import { CostCalculationService } from './cost-calculation.service';

@Injectable()
export class FreightJobsService {
  private readonly logger = new Logger(FreightJobsService.name);

  // Status transition rules
  private readonly STATUS_TRANSITIONS: Record<FreightJobStatus, FreightJobStatus[]> = {
    [FreightJobStatus.DRAFT]: [FreightJobStatus.POSTED, FreightJobStatus.CANCELLED],
    [FreightJobStatus.POSTED]: [
      FreightJobStatus.ASSIGNED,
      FreightJobStatus.CANCELLED,
    ],
    [FreightJobStatus.ASSIGNED]: [FreightJobStatus.IN_TRANSIT, FreightJobStatus.CANCELLED],
    [FreightJobStatus.IN_TRANSIT]: [FreightJobStatus.DELIVERED],
    [FreightJobStatus.DELIVERED]: [],
    [FreightJobStatus.CANCELLED]: [],
  };

  constructor(
    @InjectRepository(FreightJob)
    private readonly freightJobRepository: Repository<FreightJob>,
    private readonly costCalculationService: CostCalculationService,
  ) {}

  /**
   * Create a new freight job (only shippers)
   */
  async create(
    createFreightJobDto: CreateFreightJobDto,
    shipperId: string,
  ): Promise<FreightJobResponseDto> {
    try {
      // Validate dates
      const pickupDate = new Date(createFreightJobDto.pickupDate);
      const deliveryDate = new Date(createFreightJobDto.deliveryDate);

      if (deliveryDate <= pickupDate) {
        throw new BadRequestException(
          'Delivery date must be after pickup date',
        );
      }

      // Calculate estimated cost
      const estimatedCost = this.costCalculationService.calculateEstimatedCost(
        createFreightJobDto.originAddress,
        createFreightJobDto.destinationAddress,
        createFreightJobDto.cargoWeight,
        createFreightJobDto.cargoType,
      );

      const freightJob = this.freightJobRepository.create({
        ...createFreightJobDto,
        shipperId,
        estimatedCost,
        status: FreightJobStatus.DRAFT,
        pickupDate,
        deliveryDate,
      });

      const savedJob = await this.freightJobRepository.save(freightJob);
      this.logger.log(`Freight job created: ${savedJob.id}`);

      return this.mapToResponseDto(savedJob);
    } catch (error) {
      this.logger.error(`Failed to create freight job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all freight jobs with filtering and pagination
   */
  async findAll(
    filters: FilterFreightJobsDto,
  ): Promise<PaginatedResponseDto<FreightJobResponseDto>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    let query = this.freightJobRepository.createQueryBuilder('fj');

    // Apply status filter
    if (filters.status) {
      query = query.where('fj.status = :status', { status: filters.status });
    }

    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      query = query.andWhere('fj.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Apply search filter
    if (filters.search) {
      query = query.andWhere(
        '(fj.title ILIKE :search OR fj.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply city filter
    if (filters.city) {
      query = query.andWhere(
        "(fj.originAddress->>'city' ILIKE :city OR fj.destinationAddress->>'city' ILIKE :city)",
        { city: `%${filters.city}%` },
      );
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    query = query.orderBy('fj.createdAt', 'DESC').skip(skip).take(limit);

    const jobs = await query.getMany();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: jobs.map(job => this.mapToResponseDto(job)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  /**
   * Get a single freight job by ID
   */
  async findOne(id: string): Promise<FreightJobResponseDto> {
    const job = await this.freightJobRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException(`Freight job with ID ${id} not found`);
    }

    return this.mapToResponseDto(job);
  }

  /**
   * Get all jobs for a specific shipper
   */
  async findByShipperId(
    shipperId: string,
    filters: FilterFreightJobsDto,
  ): Promise<PaginatedResponseDto<FreightJobResponseDto>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    let query = this.freightJobRepository
      .createQueryBuilder('fj')
      .where('fj.shipperId = :shipperId', { shipperId });

    // Apply status filter
    if (filters.status) {
      query = query.andWhere('fj.status = :status', { status: filters.status });
    }

    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      query = query.andWhere('fj.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Apply search filter
    if (filters.search) {
      query = query.andWhere(
        '(fj.title ILIKE :search OR fj.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const total = await query.getCount();
    query = query.orderBy('fj.createdAt', 'DESC').skip(skip).take(limit);

    const jobs = await query.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data: jobs.map(job => this.mapToResponseDto(job)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get all jobs assigned to a specific carrier
   */
  async findByCarrierId(
    carrierId: string,
    filters: FilterFreightJobsDto,
  ): Promise<PaginatedResponseDto<FreightJobResponseDto>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    let query = this.freightJobRepository
      .createQueryBuilder('fj')
      .where('fj.carrierId = :carrierId', { carrierId });

    // Apply status filter
    if (filters.status) {
      query = query.andWhere('fj.status = :status', { status: filters.status });
    }

    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      query = query.andWhere('fj.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Apply search filter
    if (filters.search) {
      query = query.andWhere(
        '(fj.title ILIKE :search OR fj.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const total = await query.getCount();
    query = query.orderBy('fj.createdAt', 'DESC').skip(skip).take(limit);

    const jobs = await query.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data: jobs.map(job => this.mapToResponseDto(job)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Update a freight job
   */
  async update(
    id: string,
    updateFreightJobDto: UpdateFreightJobDto,
    userId: string,
    userRole: 'shipper' | 'carrier' | 'admin',
  ): Promise<FreightJobResponseDto> {
    const job = await this.freightJobRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException(`Freight job with ID ${id} not found`);
    }

    // Check authorization: only shipper can update their own job or admin
    if (userRole !== 'admin' && job.shipperId !== userId) {
      throw new ForbiddenException(
        'Only the shipper can update this job',
      );
    }

    // If status is being updated, validate the transition
    if (updateFreightJobDto.status) {
      this.validateStatusTransition(job.status, updateFreightJobDto.status);
    }

    // Recalculate cost if addresses or cargo details changed
    if (
      updateFreightJobDto.originAddress ||
      updateFreightJobDto.destinationAddress ||
      updateFreightJobDto.cargoWeight ||
      updateFreightJobDto.cargoType
    ) {
      const originAddress =
        updateFreightJobDto.originAddress || job.originAddress;
      const destinationAddress =
        updateFreightJobDto.destinationAddress || job.destinationAddress;
      const cargoWeight = updateFreightJobDto.cargoWeight || job.cargoWeight;
      const cargoType = updateFreightJobDto.cargoType || job.cargoType;

      job.estimatedCost =
        this.costCalculationService.calculateEstimatedCost(
          originAddress,
          destinationAddress,
          cargoWeight,
          cargoType,
        );
    }

    // Validate dates if provided
    if (
      updateFreightJobDto.pickupDate ||
      updateFreightJobDto.deliveryDate
    ) {
      const pickupDate = updateFreightJobDto.pickupDate
        ? new Date(updateFreightJobDto.pickupDate)
        : job.pickupDate;
      const deliveryDate = updateFreightJobDto.deliveryDate
        ? new Date(updateFreightJobDto.deliveryDate)
        : job.deliveryDate;

      if (deliveryDate <= pickupDate) {
        throw new BadRequestException(
          'Delivery date must be after pickup date',
        );
      }

      job.pickupDate = pickupDate;
      job.deliveryDate = deliveryDate;
    }

    // Update allowed fields
    if (updateFreightJobDto.title) {
      job.title = updateFreightJobDto.title;
    }

    if (updateFreightJobDto.description) {
      job.description = updateFreightJobDto.description;
    }

    if (updateFreightJobDto.originAddress) {
      job.originAddress = updateFreightJobDto.originAddress;
    }

    if (updateFreightJobDto.destinationAddress) {
      job.destinationAddress = updateFreightJobDto.destinationAddress;
    }

    if (updateFreightJobDto.cargoType) {
      job.cargoType = updateFreightJobDto.cargoType;
    }

    if (updateFreightJobDto.cargoWeight) {
      job.cargoWeight = updateFreightJobDto.cargoWeight;
    }

    if (updateFreightJobDto.status) {
      job.status = updateFreightJobDto.status;
    }

    const updatedJob = await this.freightJobRepository.save(job);
    this.logger.log(`Freight job updated: ${updatedJob.id}`);

    return this.mapToResponseDto(updatedJob);
  }

  /**
   * Assign a carrier to a job
   */
  async assignCarrier(
    id: string,
    assignCarrierDto: AssignCarrierDto,
    userId: string,
    userRole: 'shipper' | 'carrier' | 'admin',
  ): Promise<FreightJobResponseDto> {
    const job = await this.freightJobRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException(`Freight job with ID ${id} not found`);
    }

    // Check authorization: only shipper can assign or admin
    if (userRole !== 'admin' && job.shipperId !== userId) {
      throw new ForbiddenException(
        'Only the shipper can assign a carrier to this job',
      );
    }

    // Job must be in POSTED status
    if (job.status !== FreightJobStatus.POSTED) {
      throw new BadRequestException(
        'Can only assign carriers to jobs in POSTED status',
      );
    }

    // Update job with carrier assignment and change status to ASSIGNED
    job.carrierId = assignCarrierDto.carrierId;
    job.status = FreightJobStatus.ASSIGNED;

    const updatedJob = await this.freightJobRepository.save(job);
    this.logger.log(`Carrier ${assignCarrierDto.carrierId} assigned to job ${updatedJob.id}`);

    return this.mapToResponseDto(updatedJob);
  }

  /**
   * Delete a freight job (soft delete - only if status is DRAFT)
   */
  async remove(
    id: string,
    userId: string,
    userRole: 'shipper' | 'carrier' | 'admin',
  ): Promise<void> {
    const job = await this.freightJobRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException(`Freight job with ID ${id} not found`);
    }

    // Check authorization
    if (userRole !== 'admin' && job.shipperId !== userId) {
      throw new ForbiddenException(
        'Only the shipper can delete this job',
      );
    }

    // Can only delete if status is DRAFT
    if (job.status !== FreightJobStatus.DRAFT) {
      throw new BadRequestException(
        'Can only delete jobs with DRAFT status',
      );
    }

    await this.freightJobRepository.softDelete(id);
    this.logger.log(`Freight job deleted: ${id}`);
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: FreightJobStatus,
    newStatus: FreightJobStatus,
  ): void {
    const allowedTransitions = this.STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ')}`,
      );
    }
  }

  /**
   * Map FreightJob entity to response DTO
   */
  private mapToResponseDto(job: FreightJob): FreightJobResponseDto {
    return {
      id: job.id,
      shipperId: job.shipperId,
      carrierId: job.carrierId || null,
      title: job.title,
      description: job.description,
      originAddress: job.originAddress,
      destinationAddress: job.destinationAddress,
      cargoType: job.cargoType,
      cargoWeight: job.cargoWeight,
      estimatedCost: job.estimatedCost,
      status: job.status,
      pickupDate: job.pickupDate,
      deliveryDate: job.deliveryDate,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
