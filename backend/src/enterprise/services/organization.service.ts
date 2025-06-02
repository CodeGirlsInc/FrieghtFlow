import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Organization } from "../entities/organization.entity"
import type { CreateOrganizationDto } from "../dto/create-organization.dto"

@Injectable()
export class OrganizationService {
  private organizationRepository: Repository<Organization>

  constructor(
    @InjectRepository(Organization)
    organizationRepository: Repository<Organization>,
  ) {
    this.organizationRepository = organizationRepository;
  }

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const existingOrg = await this.organizationRepository.findOne({
      where: { name: createOrganizationDto.name },
    })

    if (existingOrg) {
      throw new ConflictException("Organization with this name already exists")
    }

    const organization = this.organizationRepository.create(createOrganizationDto)
    return await this.organizationRepository.save(organization)
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find({
      relations: ["users", "departments", "logisticsRoutes"],
    })
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ["users", "departments", "logisticsRoutes"],
    })

    if (!organization) {
      throw new NotFoundException("Organization not found")
    }

    return organization
  }

  async update(id: string, updateData: Partial<CreateOrganizationDto>): Promise<Organization> {
    const organization = await this.findOne(id)
    Object.assign(organization, updateData)
    return await this.organizationRepository.save(organization)
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id)
    organization.isActive = false
    await this.organizationRepository.save(organization)
  }

  async getOrganizationStats(id: string) {
    const organization = await this.findOne(id)

    const stats = await this.organizationRepository
      .createQueryBuilder("org")
      .leftJoin("org.users", "users")
      .leftJoin("org.departments", "departments")
      .leftJoin("org.logisticsRoutes", "routes")
      .leftJoin("departments.shipments", "shipments")
      .select([
        "COUNT(DISTINCT users.id) as userCount",
        "COUNT(DISTINCT departments.id) as departmentCount",
        "COUNT(DISTINCT routes.id) as routeCount",
        "COUNT(DISTINCT shipments.id) as shipmentCount",
      ])
      .where("org.id = :id", { id })
      .getRawOne()

    return {
      organization: organization.name,
      users: Number.parseInt(stats.userCount) || 0,
      departments: Number.parseInt(stats.departmentCount) || 0,
      routes: Number.parseInt(stats.routeCount) || 0,
      shipments: Number.parseInt(stats.shipmentCount) || 0,
    }
  }
}
