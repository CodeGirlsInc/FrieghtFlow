import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common"
import { getRepositoryToken } from "@nestjs/typeorm"
import { type Repository, Between } from "typeorm"
import { ComplianceDocument, VerificationStatus } from "./entities/compliance-document.entity"
import type { CreateComplianceDocumentDto } from "./dto/create-compliance-document.dto"
import type { UpdateComplianceDocumentDto } from "./dto/update-compliance-document.dto"
import type { VerifyDocumentDto } from "./dto/verify-document.dto"
import type { FilterComplianceDocumentsDto } from "./dto/filter-compliance-documents.dto"
import type { NotificationService } from "../notifications/notification.service"

@Injectable()
export class ComplianceService {
  private complianceDocumentRepository: Repository<ComplianceDocument>

  constructor(
    @Inject(getRepositoryToken(ComplianceDocument))
    complianceDocumentRepository: Repository<ComplianceDocument>,
    private notificationService: NotificationService,
  ) {
    this.complianceDocumentRepository = complianceDocumentRepository
  }

  async create(createComplianceDocumentDto: CreateComplianceDocumentDto): Promise<ComplianceDocument> {
    const document = this.complianceDocumentRepository.create({
      ...createComplianceDocumentDto,
      expiryDate: createComplianceDocumentDto.expiryDate ? new Date(createComplianceDocumentDto.expiryDate) : null,
    })

    const savedDocument = await this.complianceDocumentRepository.save(document)

    // Notify admins about new document submission
    await this.notifyAdminsAboutNewDocument(savedDocument)

    return this.findOne(savedDocument.id)
  }

  async findAll(filters?: FilterComplianceDocumentsDto): Promise<ComplianceDocument[]> {
    const query = this.complianceDocumentRepository
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.user", "user")
      .leftJoinAndSelect("document.reviewedBy", "reviewedBy")

    if (filters) {
      if (filters.documentType) {
        query.andWhere("document.documentType = :documentType", {
          documentType: filters.documentType,
        })
      }

      if (filters.status) {
        query.andWhere("document.status = :status", {
          status: filters.status,
        })
      }

      if (filters.userId) {
        query.andWhere("document.userId = :userId", {
          userId: filters.userId,
        })
      }

      if (filters.startDate && filters.endDate) {
        query.andWhere("document.createdAt BETWEEN :startDate AND :endDate", {
          startDate: new Date(filters.startDate),
          endDate: new Date(filters.endDate),
        })
      }
    }

    return query.orderBy("document.createdAt", "DESC").getMany()
  }

  async findOne(id: string): Promise<ComplianceDocument> {
    const document = await this.complianceDocumentRepository.findOne({
      where: { id },
      relations: ["user", "reviewedBy"],
    })

    if (!document) {
      throw new NotFoundException(`Compliance document with ID ${id} not found`)
    }

    return document
  }

  async update(id: string, updateComplianceDocumentDto: UpdateComplianceDocumentDto): Promise<ComplianceDocument> {
    const document = await this.findOne(id)

    if (updateComplianceDocumentDto.expiryDate) {
      updateComplianceDocumentDto.expiryDate = new Date(updateComplianceDocumentDto.expiryDate).toISOString()
    }

    await this.complianceDocumentRepository.update(id, {
      ...updateComplianceDocumentDto,
      expiryDate: updateComplianceDocumentDto.expiryDate ? new Date(updateComplianceDocumentDto.expiryDate) : undefined,
    })

    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id)
    await this.complianceDocumentRepository.remove(document)
  }

  async verifyDocument(
    id: string,
    verifyDocumentDto: VerifyDocumentDto,
    reviewerId: string,
  ): Promise<ComplianceDocument> {
    const document = await this.findOne(id)

    if (document.status !== VerificationStatus.PENDING) {
      throw new BadRequestException(`Document has already been ${document.status.toLowerCase()}`)
    }

    // If rejecting, require a reason
    if (verifyDocumentDto.status === VerificationStatus.REJECTED && !verifyDocumentDto.rejectionReason) {
      throw new BadRequestException("Rejection reason is required when rejecting a document")
    }

    await this.complianceDocumentRepository.update(id, {
      status: verifyDocumentDto.status,
      rejectionReason: verifyDocumentDto.rejectionReason,
      notes: verifyDocumentDto.notes,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    })

    const updatedDocument = await this.findOne(id)

    // Notify user about verification result
    await this.notifyUserAboutVerificationResult(updatedDocument)

    return updatedDocument
  }

  async getUserDocuments(userId: string): Promise<ComplianceDocument[]> {
    return this.complianceDocumentRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })
  }

  async getPendingDocuments(): Promise<ComplianceDocument[]> {
    return this.complianceDocumentRepository.find({
      where: { status: VerificationStatus.PENDING },
      relations: ["user"],
      order: { createdAt: "ASC" },
    })
  }

  async getDocumentsByStatus(status: VerificationStatus): Promise<ComplianceDocument[]> {
    return this.complianceDocumentRepository.find({
      where: { status },
      relations: ["user", "reviewedBy"],
      order: { updatedAt: "DESC" },
    })
  }

  async checkExpiringDocuments(daysThreshold = 30): Promise<ComplianceDocument[]> {
    const today = new Date()
    const thresholdDate = new Date()
    thresholdDate.setDate(today.getDate() + daysThreshold)

    const expiringDocuments = await this.complianceDocumentRepository.find({
      where: {
        expiryDate: Between(today, thresholdDate),
        status: VerificationStatus.APPROVED,
      },
      relations: ["user"],
    })

    // Notify users about expiring documents
    for (const document of expiringDocuments) {
      await this.notifyUserAboutExpiringDocument(document)
    }

    return expiringDocuments
  }

  private async notifyUserAboutVerificationResult(document: ComplianceDocument): Promise<void> {
    if (!document.user?.email) {
      return
    }

    const isApproved = document.status === VerificationStatus.APPROVED
    const subject = isApproved ? `Document Approved: ${document.name}` : `Document Requires Attention: ${document.name}`

    const template = isApproved ? "document-approved" : "document-rejected"
    const context = {
      userName: document.user.name,
      documentName: document.name,
      documentType: document.documentType,
      status: document.status,
      rejectionReason: document.rejectionReason,
      notes: document.notes,
      reviewDate: document.reviewedAt?.toLocaleDateString(),
    }

    await this.notificationService.sendEmail(document.user.email, subject, template, context)
  }

  private async notifyAdminsAboutNewDocument(document: ComplianceDocument): Promise<void> {
    // In a real application, you would fetch admin emails from the database
    // For now, we'll just log the notification
    console.log(`New compliance document submitted: ${document.id} - ${document.name} by user ${document.userId}`)

    // Example of how you might notify admins in a real application:
    // const admins = await this.userService.getAdmins();
    // for (const admin of admins) {
    //   await this.notificationService.sendEmail(
    //     admin.email,
    //     'New Compliance Document Submitted',
    //     'new-compliance-document',
    //     { documentName: document.name, documentType: document.documentType, userName: document.user.name }
    //   );
    // }
  }

  private async notifyUserAboutExpiringDocument(document: ComplianceDocument): Promise<void> {
    if (!document.user?.email) {
      return
    }

    const daysUntilExpiry = Math.ceil((document.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    const subject = `Document Expiring Soon: ${document.name}`
    const template = "document-expiring"
    const context = {
      userName: document.user.name,
      documentName: document.name,
      documentType: document.documentType,
      expiryDate: document.expiryDate.toLocaleDateString(),
      daysUntilExpiry,
    }

    await this.notificationService.sendEmail(document.user.email, subject, template, context)
  }
}
