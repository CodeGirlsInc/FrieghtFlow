import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Business } from "../entities/business.entity"
import { BusinessProfile } from "../entities/business-profile.entity"
import type { CreateBusinessDto } from "../dto/create-business.dto"
import type { UpdateBusinessDto } from "../dto/update-business.dto"
import type { ServicePackageService } from "./service-package.service"
import type { ConfigService } from "../../config/services/config.service"
import type { ComplianceService } from "../../compliance/services/compliance.service"

@Injectable()
export class BusinessService {
  constructor(
    private businessRepository: Repository<Business>,
    private profileRepository: Repository<BusinessProfile>,
    private servicePackageService: ServicePackageService,
    private configService: ConfigService,
    private complianceService: ComplianceService,
    @InjectRepository(Business)
    @InjectRepository(BusinessProfile)
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    // Check if business with email already exists
    const existingBusiness = await this.businessRepository.findOne({
      where: { email: createBusinessDto.email },
    })

    if (existingBusiness) {
      throw new ConflictException(`Business with email ${createBusinessDto.email} already exists`)
    }

    // Create new business
    const business = this.businessRepository.create({
      name: createBusinessDto.name,
      email: createBusinessDto.email,
      phone: createBusinessDto.phone,
    })

    // Save business to get ID
    const savedBusiness = await this.businessRepository.save(business)

    // Create profile if provided
    if (createBusinessDto.profile) {
      const profile = this.profileRepository.create({
        ...createBusinessDto.profile,
        business: savedBusiness,
      })
      await this.profileRepository.save(profile)
    }

    // Add service packages if provided
    if (createBusinessDto.servicePackageIds && createBusinessDto.servicePackageIds.length > 0) {
      for (const packageId of createBusinessDto.servicePackageIds) {
        await this.servicePackageService.selectPackageForBusiness(savedBusiness.id, packageId)
      }
    }

    // Check compliance requirements
    await this.complianceService.checkInitialCompliance(savedBusiness.id)

    // Return the business with relations
    return this.findOne(savedBusiness.id)
  }

  async findAll(options: {
    page: number
    limit: number
    status?: string
  }): Promise<{ items: Business[]; total: number; page: number; limit: number }> {
    const { page, limit, status } = options
    const skip = (page - 1) * limit

    const queryBuilder = this.businessRepository
      .createQueryBuilder("business")
      .leftJoinAndSelect("business.profile", "profile")
      .leftJoinAndSelect("business.verification", "verification")

    if (status) {
      queryBuilder.where("business.status = :status", { status })
    }

    const [items, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount()

    return {
      items,
      total,
      page,
      limit,
    }
  }

  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ["profile", "verification", "serviceSelections", "serviceSelections.servicePackage"],
    })

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`)
    }

    return business
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto): Promise<Business> {
    const business = await this.findOne(id)

    // Check if email is being updated and if it's already in use
    if (updateBusinessDto.email && updateBusinessDto.email !== business.email) {
      const existingBusiness = await this.businessRepository.findOne({
        where: { email: updateBusinessDto.email },
      })

      if (existingBusiness) {
        throw new ConflictException(`Business with email ${updateBusinessDto.email} already exists`)
      }
    }

    // Update business fields
    Object.assign(business, updateBusinessDto)

    // If status is changing to active, check compliance
    if (updateBusinessDto.status === "active" && business.status !== "active") {
      const isCompliant = await this.complianceService.checkBusinessCompliance(id)
      if (!isCompliant) {
        throw new BadRequestException("Business cannot be activated as it does not meet compliance requirements")
      }
    }

    // Save updated business
    return this.businessRepository.save(business)
  }

  async remove(id: string): Promise<void> {
    const business = await this.findOne(id)
    await this.businessRepository.remove(business)
  }

  async findByEmail(email: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { email },
      relations: ["profile"],
    })

    if (!business) {
      throw new NotFoundException(`Business with email ${email} not found`)
    }

    return business
  }
}
