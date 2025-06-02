import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { BusinessProfile } from "../entities/business-profile.entity"
import { Business } from "../entities/business.entity"
import type { UpdateBusinessProfileDto } from "../dto/update-business-profile.dto"

@Injectable()
export class BusinessProfileService {
  constructor(
    @InjectRepository(BusinessProfile)
    private profileRepository: Repository<BusinessProfile>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) { }

  async findByBusinessId(businessId: string): Promise<BusinessProfile> {
    const profile = await this.profileRepository
      .createQueryBuilder("profile")
      .leftJoinAndSelect("profile.business", "business")
      .where("business.id = :businessId", { businessId })
      .getOne()

    if (!profile) {
      throw new NotFoundException(`Profile for business with ID ${businessId} not found`)
    }

    return profile
  }

  async update(businessId: string, updateProfileDto: UpdateBusinessProfileDto): Promise<BusinessProfile> {
    // Check if business exists
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    })

    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`)
    }

    // Find existing profile or create new one
    let profile = await this.profileRepository
      .createQueryBuilder("profile")
      .leftJoinAndSelect("profile.business", "business")
      .where("business.id = :businessId", { businessId })
      .getOne()

    if (!profile) {
      profile = this.profileRepository.create({
        business,
      })
    }

    // Update profile fields
    Object.assign(profile, updateProfileDto)

    // Save updated profile
    return this.profileRepository.save(profile)
  }
}
