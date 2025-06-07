import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type CarrierVerification, VerificationStatus } from "../entities/carrier-verification.entity"
import { type CarrierDocument, DocumentStatus } from "../entities/carrier-document.entity"
import type { OperationalHistoryService } from "./operational-history.service"
import { OperationType } from "../entities/operational-history.entity"

@Injectable()
export class CarrierVerificationService {
  private readonly verificationRepository: Repository<CarrierVerification>
  private readonly documentRepository: Repository<CarrierDocument>
  private readonly historyService: OperationalHistoryService

  constructor(
    verificationRepository: Repository<CarrierVerification>,
    documentRepository: Repository<CarrierDocument>,
    historyService: OperationalHistoryService,
  ) {
    this.verificationRepository = verificationRepository
    this.documentRepository = documentRepository
    this.historyService = historyService
  }

  async getVerificationStatus(carrierId: string): Promise<CarrierVerification> {
    let verification = await this.verificationRepository.findOne({
      where: { carrierId },
    })

    if (!verification) {
      verification = await this.createInitialVerification(carrierId)
    }

    return verification
  }

  async startVerification(carrierId: string, verifiedBy: string): Promise<CarrierVerification> {
    let verification = await this.verificationRepository.findOne({
      where: { carrierId },
    })

    if (!verification) {
      verification = await this.createInitialVerification(carrierId)
    }

    verification.status = VerificationStatus.IN_PROGRESS
    verification.verifiedBy = verifiedBy

    const updatedVerification = await this.verificationRepository.save(verification)

    // Log the verification start
    await this.historyService.logOperation(carrierId, {
      operationType: OperationType.STATUS_CHANGED,
      description: "Verification process started",
      performedBy: verifiedBy,
      metadata: { verificationStatus: VerificationStatus.IN_PROGRESS },
    })

    return updatedVerification
  }

  async updateVerification(
    carrierId: string,
    verificationData: {
      checklist?: Record<string, boolean>
      notes?: string
      rejectionReasons?: string[]
      verificationScore?: number
    },
    verifiedBy: string,
  ): Promise<CarrierVerification> {
    const verification = await this.getVerificationStatus(carrierId)

    if (verificationData.checklist) {
      verification.checklist = { ...verification.checklist, ...verificationData.checklist }
    }

    if (verificationData.notes) {
      verification.notes = verificationData.notes
    }

    if (verificationData.rejectionReasons) {
      verification.rejectionReasons = verificationData.rejectionReasons
    }

    if (verificationData.verificationScore !== undefined) {
      verification.verificationScore = verificationData.verificationScore
    }

    verification.verifiedBy = verifiedBy

    // Auto-determine status based on checklist completion
    if (verification.checklist) {
      const checklistValues = Object.values(verification.checklist)
      const allCompleted = checklistValues.every((value) => value === true)
      const anyRejected = verification.rejectionReasons && verification.rejectionReasons.length > 0

      if (anyRejected) {
        verification.status = VerificationStatus.FAILED
      } else if (allCompleted) {
        verification.status = VerificationStatus.COMPLETED
        verification.verifiedAt = new Date()
      }
    }

    const updatedVerification = await this.verificationRepository.save(verification)

    // Log the verification update
    await this.historyService.logOperation(carrierId, {
      operationType: OperationType.STATUS_CHANGED,
      description: `Verification updated - Status: ${verification.status}`,
      performedBy: verifiedBy,
      metadata: {
        verificationStatus: verification.status,
        verificationScore: verification.verificationScore,
        checklist: verification.checklist,
      },
    })

    return updatedVerification
  }

  async calculateVerificationScore(carrierId: string): Promise<number> {
    const documents = await this.documentRepository.find({
      where: { carrierId },
    })

    let score = 0
    const maxScore = 100

    // Document verification scoring
    const requiredDocuments = ["business_license", "insurance_certificate", "vehicle_registration", "driver_license"]

    const approvedDocuments = documents.filter((doc) => doc.status === DocumentStatus.APPROVED)
    const documentScore = (approvedDocuments.length / requiredDocuments.length) * 60

    // Document expiry scoring
    const currentDate = new Date()
    const validDocuments = approvedDocuments.filter((doc) => {
      if (!doc.expiryDate) return true
      return doc.expiryDate > currentDate
    })
    const expiryScore = (validDocuments.length / approvedDocuments.length) * 20

    // Completeness scoring
    const completenessScore = documents.length >= requiredDocuments.length ? 20 : 0

    score = documentScore + expiryScore + completenessScore

    return Math.min(score, maxScore)
  }

  private async createInitialVerification(carrierId: string): Promise<CarrierVerification> {
    const verification = this.verificationRepository.create({
      carrierId,
      status: VerificationStatus.PENDING,
      checklist: {
        businessLicense: false,
        insurance: false,
        vehicleRegistration: false,
        driverLicense: false,
        backgroundCheck: false,
        bankVerification: false,
      },
      verificationScore: 0,
    })

    return this.verificationRepository.save(verification)
  }

  async getPendingVerifications(): Promise<CarrierVerification[]> {
    return this.verificationRepository.find({
      where: { status: VerificationStatus.PENDING },
      relations: ["carrier"],
      order: { createdAt: "ASC" },
    })
  }

  async getVerificationStats(): Promise<{
    pending: number
    inProgress: number
    completed: number
    failed: number
  }> {
    const [pending, inProgress, completed, failed] = await Promise.all([
      this.verificationRepository.count({ where: { status: VerificationStatus.PENDING } }),
      this.verificationRepository.count({ where: { status: VerificationStatus.IN_PROGRESS } }),
      this.verificationRepository.count({ where: { status: VerificationStatus.COMPLETED } }),
      this.verificationRepository.count({ where: { status: VerificationStatus.FAILED } }),
    ])

    return { pending, inProgress, completed, failed }
  }
}
