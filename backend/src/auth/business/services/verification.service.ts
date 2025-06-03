import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { VerificationStatus } from "../entities/verification-status.entity"
import { Business } from "../entities/business.entity"
import type { CreateVerificationDto } from "../dto/create-verification.dto"
import type { UpdateVerificationDto } from "../dto/update-verification.dto"
import type { ComplianceService } from "../../compliance/services/compliance.service"

@Injectable()
export class VerificationService {
  private verificationRepository: Repository<VerificationStatus>
  private businessRepository: Repository<Business>
  private complianceService: ComplianceService

  constructor(
    @InjectRepository(VerificationStatus)
    verificationRepository: Repository<VerificationStatus>,
    @InjectRepository(Business)
    businessRepository: Repository<Business>,
    complianceService: ComplianceService,
  ) {
    this.verificationRepository = verificationRepository
    this.businessRepository = businessRepository
    this.complianceService = complianceService
  }

  async create(businessId: string, createVerificationDto: CreateVerificationDto): Promise<VerificationStatus> {
    // Check if business exists
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    })

    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`)
    }

    // Check if verification already exists
    const existingVerification = await this.verificationRepository.findOne({
      where: { business: { id: businessId } },
    })

    if (existingVerification) {
      // Update existing verification with new documents
      existingVerification.documents = [
        ...(existingVerification.documents || []),
        ...createVerificationDto.documents.map((doc) => ({
          ...doc,
          status: "pending",
        })),
      ]
      existingVerification.status = "pending"
      return this.verificationRepository.save(existingVerification)
    }

    // Create new verification
    const verification = this.verificationRepository.create({
      business,
      documents: createVerificationDto.documents.map((doc) => ({
        ...doc,
        status: "pending",
      })),
    })

    return this.verificationRepository.save(verification)
  }

  async findByBusinessId(businessId: string): Promise<VerificationStatus> {
    const verification = await this.verificationRepository.findOne({
      where: { business: { id: businessId } },
      relations: ["business"],
    })

    if (!verification) {
      throw new NotFoundException(`Verification for business with ID ${businessId} not found`)
    }

    return verification
  }

  async update(businessId: string, updateVerificationDto: UpdateVerificationDto): Promise<VerificationStatus> {
    const verification = await this.findByBusinessId(businessId)

    // Update verification fields
    if (updateVerificationDto.status) {
      verification.status = updateVerificationDto.status
    }

    if (updateVerificationDto.verifiedBy) {
      verification.verifiedBy = updateVerificationDto.verifiedBy
    }

    if (updateVerificationDto.rejectionReason) {
      verification.rejectionReason = updateVerificationDto.rejectionReason
    }

    if (updateVerificationDto.isCompliant !== undefined) {
      verification.isCompliant = updateVerificationDto.isCompliant
    }

    // Update documents if provided
    if (updateVerificationDto.documents) {
      // Create a map of existing documents by type
      const existingDocMap = new Map()
      verification.documents.forEach((doc) => {
        existingDocMap.set(doc.type + doc.url, doc)
      })

      // Update existing documents or add new ones
      verification.documents = updateVerificationDto.documents.map((doc) => {
        const existingDoc = existingDocMap.get(doc.type + doc.url)
        if (existingDoc) {
          return { ...existingDoc, ...doc }
        }
        return doc
      })
    }

    // If status is changing to verified, update verification date
    if (updateVerificationDto.status === "verified" && verification.status !== "verified") {
      verification.verifiedAt = new Date()

      // Check compliance after verification
      await this.complianceService.checkBusinessCompliance(businessId)
    }

    return this.verificationRepository.save(verification)
  }

  async isBusinessVerified(businessId: string): Promise<boolean> {
    try {
      const verification = await this.findByBusinessId(businessId)
      return verification.status === "verified"
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false
      }
      throw error
    }
  }
}
