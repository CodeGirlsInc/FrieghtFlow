import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { ServicePackage } from "../entities/service-package.entity"
import type { Business } from "../entities/business.entity"
import type { BusinessServiceSelection } from "../entities/business-service-selection.entity"
import type { CreateServicePackageDto } from "../dto/create-service-package.dto"
import type { UpdateServicePackageDto } from "../dto/update-service-package.dto"

@Injectable()
export class ServicePackageService {
  constructor(
    private servicePackageRepository: Repository<ServicePackage>,
    private businessRepository: Repository<Business>,
    private selectionRepository: Repository<BusinessServiceSelection>,
    private selectionRepository: Repository<BusinessServiceSelection>,
  ) {}

  async create(createServicePackageDto: CreateServicePackageDto): Promise<ServicePackage> {
    const servicePackage = this.servicePackageRepository.create(createServicePackageDto)
    return this.servicePackageRepository.save(servicePackage)
  }

  async findAll(options: {
    active?: boolean
    page: number
    limit: number
  }): Promise<{
    items: ServicePackage[]
    total: number
    page: number
    limit: number
  }> {
    const { active, page, limit } = options
    const skip = (page - 1) * limit

    const queryBuilder = this.servicePackageRepository.createQueryBuilder("package")

    if (active !== undefined) {
      queryBuilder.where("package.isActive = :active", { active })
    }

    const [items, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount()

    return {
      items,
      total,
      page,
      limit,
    }
  }

  async findOne(id: string): Promise<ServicePackage> {
    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id },
    })

    if (!servicePackage) {
      throw new NotFoundException(`Service package with ID ${id} not found`)
    }

    return servicePackage
  }

  async update(id: string, updateServicePackageDto: UpdateServicePackageDto): Promise<ServicePackage> {
    const servicePackage = await this.findOne(id)
    Object.assign(servicePackage, updateServicePackageDto)
    return this.servicePackageRepository.save(servicePackage)
  }

  async remove(id: string): Promise<void> {
    const servicePackage = await this.findOne(id)
    await this.servicePackageRepository.remove(servicePackage)
  }

  async selectPackageForBusiness(businessId: string, packageId: string): Promise<BusinessServiceSelection> {
    // Check if business exists
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    })

    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`)
    }

    // Check if service package exists
    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id: packageId },
    })

    if (!servicePackage) {
      throw new NotFoundException(`Service package with ID ${packageId} not found`)
    }

    // Check if selection already exists
    const existingSelection = await this.selectionRepository.findOne({
      where: {
        business: { id: businessId },
        servicePackage: { id: packageId },
      },
      relations: ["business", "servicePackage"],
    })

    if (existingSelection) {
      throw new ConflictException(`Business already has this service package selected`)
    }

    // Create new selection
    const selection = this.selectionRepository.create({
      business,
      servicePackage,
      startDate: new Date(),
      endDate: servicePackage.durationMonths
        ? new Date(new Date().setMonth(new Date().getMonth() + servicePackage.durationMonths))
        : null,
    })

    return this.selectionRepository.save(selection)
  }

  async deselectPackageForBusiness(businessId: string, packageId: string): Promise<void> {
    const selection = await this.selectionRepository.findOne({
      where: {
        business: { id: businessId },
        servicePackage: { id: packageId },
      },
      relations: ["business", "servicePackage"],
    })

    if (!selection) {
      throw new NotFoundException(`Selection for business ${businessId} and package ${packageId} not found`)
    }

    await this.selectionRepository.remove(selection)
  }

  async getBusinessSelectedPackages(businessId: string): Promise<BusinessServiceSelection[]> {
    return this.selectionRepository.find({
      where: { business: { id: businessId } },
      relations: ["servicePackage"],
    })
  }
}
