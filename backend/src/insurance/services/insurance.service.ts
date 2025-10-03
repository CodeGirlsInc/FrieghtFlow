import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindManyOptions } from 'typeorm';
import { InsurancePolicy, PolicyStatus } from '../entities/insurance-policy.entity';
import { ClaimHistory, ClaimStatus } from '../entities/claim-history.entity';
import { CreateInsurancePolicyDto } from '../dto/create-insurance-policy.dto';
import { UpdateInsurancePolicyDto } from '../dto/update-insurance-policy.dto';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { InsurancePolicyQueryDto, ClaimQueryDto } from '../dto/insurance-query.dto';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(InsurancePolicy)
    private readonly insurancePolicyRepository: Repository<InsurancePolicy>,
    @InjectRepository(ClaimHistory)
    private readonly claimHistoryRepository: Repository<ClaimHistory>,
  ) {}

  // Insurance Policy CRUD Operations

  async createInsurancePolicy(createDto: CreateInsurancePolicyDto): Promise<InsurancePolicy> {
    // Check if policy number already exists
    const existingPolicy = await this.insurancePolicyRepository.findOne({
      where: { policyNumber: createDto.policyNumber },
    });

    if (existingPolicy) {
      throw new ConflictException('Policy number already exists');
    }

    // Validate dates
    const effectiveDate = new Date(createDto.effectiveDate);
    const expiryDate = new Date(createDto.expiryDate);

    if (expiryDate <= effectiveDate) {
      throw new BadRequestException('Expiry date must be after effective date');
    }

    const insurancePolicy = this.insurancePolicyRepository.create({
      ...createDto,
      effectiveDate,
      expiryDate,
      currency: createDto.currency || 'USD',
      status: createDto.status || PolicyStatus.PENDING,
    });

    return await this.insurancePolicyRepository.save(insurancePolicy);
  }

  async findAllInsurancePolicies(queryDto: InsurancePolicyQueryDto): Promise<{
    data: InsurancePolicy[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.policyNumber) {
      where.policyNumber = Like(`%${filters.policyNumber}%`);
    }

    if (filters.provider) {
      where.provider = Like(`%${filters.provider}%`);
    }

    if (filters.coverageType) {
      where.coverageType = filters.coverageType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.shipmentId) {
      where.shipmentId = filters.shipmentId;
    }

    if (filters.effectiveDateFrom || filters.effectiveDateTo) {
      where.effectiveDate = {};
      if (filters.effectiveDateFrom) {
        where.effectiveDate = Between(new Date(filters.effectiveDateFrom), where.effectiveDate || new Date());
      }
      if (filters.effectiveDateTo) {
        where.effectiveDate = Between(where.effectiveDate || new Date('1900-01-01'), new Date(filters.effectiveDateTo));
      }
    }

    if (filters.expiryDateFrom || filters.expiryDateTo) {
      where.expiryDate = {};
      if (filters.expiryDateFrom) {
        where.expiryDate = Between(new Date(filters.expiryDateFrom), where.expiryDate || new Date());
      }
      if (filters.expiryDateTo) {
        where.expiryDate = Between(where.expiryDate || new Date('1900-01-01'), new Date(filters.expiryDateTo));
      }
    }

    const findOptions: FindManyOptions<InsurancePolicy> = {
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['shipment', 'claimHistory'],
    };

    const [data, total] = await this.insurancePolicyRepository.findAndCount(findOptions);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findInsurancePolicyById(id: string): Promise<InsurancePolicy> {
    const policy = await this.insurancePolicyRepository.findOne({
      where: { id },
      relations: ['shipment', 'claimHistory'],
    });

    if (!policy) {
      throw new NotFoundException('Insurance policy not found');
    }

    return policy;
  }

  async findInsurancePolicyByPolicyNumber(policyNumber: string): Promise<InsurancePolicy> {
    const policy = await this.insurancePolicyRepository.findOne({
      where: { policyNumber },
      relations: ['shipment', 'claimHistory'],
    });

    if (!policy) {
      throw new NotFoundException('Insurance policy not found');
    }

    return policy;
  }

  async updateInsurancePolicy(id: string, updateDto: UpdateInsurancePolicyDto): Promise<InsurancePolicy> {
    const policy = await this.findInsurancePolicyById(id);

    // Check if new policy number conflicts with existing ones
    if (updateDto.policyNumber && updateDto.policyNumber !== policy.policyNumber) {
      const existingPolicy = await this.insurancePolicyRepository.findOne({
        where: { policyNumber: updateDto.policyNumber },
      });

      if (existingPolicy) {
        throw new ConflictException('Policy number already exists');
      }
    }

    // Validate dates if provided
    if (updateDto.effectiveDate || updateDto.expiryDate) {
      const effectiveDate = updateDto.effectiveDate ? new Date(updateDto.effectiveDate) : policy.effectiveDate;
      const expiryDate = updateDto.expiryDate ? new Date(updateDto.expiryDate) : policy.expiryDate;

      if (expiryDate <= effectiveDate) {
        throw new BadRequestException('Expiry date must be after effective date');
      }
    }

    Object.assign(policy, updateDto);

    if (updateDto.effectiveDate) {
      policy.effectiveDate = new Date(updateDto.effectiveDate);
    }

    if (updateDto.expiryDate) {
      policy.expiryDate = new Date(updateDto.expiryDate);
    }

    return await this.insurancePolicyRepository.save(policy);
  }

  async deleteInsurancePolicy(id: string): Promise<void> {
    const policy = await this.findInsurancePolicyById(id);
    await this.insurancePolicyRepository.remove(policy);
  }

  async getInsurancePoliciesByShipment(shipmentId: string): Promise<InsurancePolicy[]> {
    return await this.insurancePolicyRepository.find({
      where: { shipmentId },
      relations: ['claimHistory'],
      order: { createdAt: 'DESC' },
    });
  }

  // Claim History CRUD Operations

  async createClaim(createDto: CreateClaimDto): Promise<ClaimHistory> {
    // Check if claim number already exists
    const existingClaim = await this.claimHistoryRepository.findOne({
      where: { claimNumber: createDto.claimNumber },
    });

    if (existingClaim) {
      throw new ConflictException('Claim number already exists');
    }

    // Verify insurance policy exists
    const policy = await this.findInsurancePolicyById(createDto.insurancePolicyId);

    const claim = this.claimHistoryRepository.create({
      ...createDto,
      incidentDate: new Date(createDto.incidentDate),
      claimDate: new Date(createDto.claimDate),
      settlementDate: createDto.settlementDate ? new Date(createDto.settlementDate) : undefined,
      currency: createDto.currency || 'USD',
      status: createDto.status || ClaimStatus.SUBMITTED,
    });

    return await this.claimHistoryRepository.save(claim);
  }

  async findAllClaims(queryDto: ClaimQueryDto): Promise<{
    data: ClaimHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.claimNumber) {
      where.claimNumber = Like(`%${filters.claimNumber}%`);
    }

    if (filters.claimType) {
      where.claimType = filters.claimType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.insurancePolicyId) {
      where.insurancePolicyId = filters.insurancePolicyId;
    }

    if (filters.incidentDateFrom || filters.incidentDateTo) {
      where.incidentDate = {};
      if (filters.incidentDateFrom) {
        where.incidentDate = Between(new Date(filters.incidentDateFrom), where.incidentDate || new Date());
      }
      if (filters.incidentDateTo) {
        where.incidentDate = Between(where.incidentDate || new Date('1900-01-01'), new Date(filters.incidentDateTo));
      }
    }

    if (filters.claimDateFrom || filters.claimDateTo) {
      where.claimDate = {};
      if (filters.claimDateFrom) {
        where.claimDate = Between(new Date(filters.claimDateFrom), where.claimDate || new Date());
      }
      if (filters.claimDateTo) {
        where.claimDate = Between(where.claimDate || new Date('1900-01-01'), new Date(filters.claimDateTo));
      }
    }

    const findOptions: FindManyOptions<ClaimHistory> = {
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['insurancePolicy', 'insurancePolicy.shipment'],
    };

    const [data, total] = await this.claimHistoryRepository.findAndCount(findOptions);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findClaimById(id: string): Promise<ClaimHistory> {
    const claim = await this.claimHistoryRepository.findOne({
      where: { id },
      relations: ['insurancePolicy', 'insurancePolicy.shipment'],
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return claim;
  }

  async findClaimByClaimNumber(claimNumber: string): Promise<ClaimHistory> {
    const claim = await this.claimHistoryRepository.findOne({
      where: { claimNumber },
      relations: ['insurancePolicy', 'insurancePolicy.shipment'],
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return claim;
  }

  async updateClaim(id: string, updateDto: UpdateClaimDto): Promise<ClaimHistory> {
    const claim = await this.findClaimById(id);

    // Check if new claim number conflicts with existing ones
    if (updateDto.claimNumber && updateDto.claimNumber !== claim.claimNumber) {
      const existingClaim = await this.claimHistoryRepository.findOne({
        where: { claimNumber: updateDto.claimNumber },
      });

      if (existingClaim) {
        throw new ConflictException('Claim number already exists');
      }
    }

    Object.assign(claim, updateDto);

    if (updateDto.incidentDate) {
      claim.incidentDate = new Date(updateDto.incidentDate);
    }

    if (updateDto.claimDate) {
      claim.claimDate = new Date(updateDto.claimDate);
    }

    if (updateDto.settlementDate) {
      claim.settlementDate = new Date(updateDto.settlementDate);
    }

    return await this.claimHistoryRepository.save(claim);
  }

  async deleteClaim(id: string): Promise<void> {
    const claim = await this.findClaimById(id);
    await this.claimHistoryRepository.remove(claim);
  }

  async getClaimsByInsurancePolicy(insurancePolicyId: string): Promise<ClaimHistory[]> {
    return await this.claimHistoryRepository.find({
      where: { insurancePolicyId },
      relations: ['insurancePolicy'],
      order: { createdAt: 'DESC' },
    });
  }

  // Analytics and Reporting

  async getInsuranceStatistics(): Promise<{
    totalPolicies: number;
    activePolicies: number;
    expiredPolicies: number;
    totalClaims: number;
    pendingClaims: number;
    approvedClaims: number;
    totalClaimAmount: number;
    totalPaidAmount: number;
  }> {
    const [totalPolicies, activePolicies, expiredPolicies] = await Promise.all([
      this.insurancePolicyRepository.count(),
      this.insurancePolicyRepository.count({ where: { status: PolicyStatus.ACTIVE } }),
      this.insurancePolicyRepository.count({ where: { status: PolicyStatus.EXPIRED } }),
    ]);

    const [totalClaims, pendingClaims, approvedClaims] = await Promise.all([
      this.claimHistoryRepository.count(),
      this.claimHistoryRepository.count({ where: { status: ClaimStatus.SUBMITTED } }),
      this.claimHistoryRepository.count({ where: { status: ClaimStatus.APPROVED } }),
    ]);

    const claimAmounts = await this.claimHistoryRepository
      .createQueryBuilder('claim')
      .select('SUM(claim.claimedAmount)', 'totalClaimAmount')
      .addSelect('SUM(claim.paidAmount)', 'totalPaidAmount')
      .getRawOne();

    return {
      totalPolicies,
      activePolicies,
      expiredPolicies,
      totalClaims,
      pendingClaims,
      approvedClaims,
      totalClaimAmount: parseFloat(claimAmounts.totalClaimAmount) || 0,
      totalPaidAmount: parseFloat(claimAmounts.totalPaidAmount) || 0,
    };
  }
}
