import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type CarrierDocument, DocumentStatus } from "../entities/carrier-document.entity"
import type { OperationalHistoryService } from "./operational-history.service"
import { OperationType } from "../entities/operational-history.entity"
import type { UploadDocumentDto, UpdateDocumentStatusDto } from "../dto/document.dto"
import { unlink } from "fs/promises"
import type { Express } from "express"

@Injectable()
export class CarrierDocumentService {
  private readonly documentRepository: Repository<CarrierDocument>
  private readonly historyService: OperationalHistoryService

  constructor(documentRepository: Repository<CarrierDocument>, historyService: OperationalHistoryService) {
    this.documentRepository = documentRepository
    this.historyService = historyService
  }

  async uploadDocument(
    carrierId: string,
    file: Express.Multer.File,
    uploadDocumentDto: UploadDocumentDto,
  ): Promise<CarrierDocument> {
    if (!file) {
      throw new BadRequestException("No file uploaded")
    }

    // Check if document type already exists for this carrier
    const existingDocument = await this.documentRepository.findOne({
      where: {
        carrierId,
        documentType: uploadDocumentDto.documentType,
      },
    })

    if (existingDocument) {
      // Delete old file
      try {
        await unlink(existingDocument.filePath)
      } catch (error) {
        console.error("Error deleting old file:", error)
      }
      // Remove old document record
      await this.documentRepository.remove(existingDocument)
    }

    const document = this.documentRepository.create({
      carrierId,
      documentType: uploadDocumentDto.documentType,
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      documentNumber: uploadDocumentDto.documentNumber,
      issueDate: uploadDocumentDto.issueDate ? new Date(uploadDocumentDto.issueDate) : undefined,
      expiryDate: uploadDocumentDto.expiryDate ? new Date(uploadDocumentDto.expiryDate) : undefined,
      issuingAuthority: uploadDocumentDto.issuingAuthority,
      description: uploadDocumentDto.description,
      status: DocumentStatus.PENDING,
    })

    const savedDocument = await this.documentRepository.save(document)

    // Log the upload
    await this.historyService.logOperation(carrierId, {
      operationType: OperationType.DOCUMENT_UPLOADED,
      description: `Document uploaded: ${uploadDocumentDto.documentType}`,
      relatedEntityId: savedDocument.id,
      metadata: { documentType: uploadDocumentDto.documentType },
    })

    return savedDocument
  }

  async getCarrierDocuments(carrierId: string): Promise<CarrierDocument[]> {
    return this.documentRepository.find({
      where: { carrierId },
      order: { createdAt: "DESC" },
    })
  }

  async updateDocumentStatus(
    documentId: string,
    updateStatusDto: UpdateDocumentStatusDto,
    verifiedBy: string,
  ): Promise<CarrierDocument> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    })

    if (!document) {
      throw new NotFoundException("Document not found")
    }

    const oldStatus = document.status
    document.status = updateStatusDto.status
    document.rejectionReason = updateStatusDto.rejectionReason
    document.verifiedBy = verifiedBy
    document.verifiedAt = new Date()

    const updatedDocument = await this.documentRepository.save(document)

    // Log the verification
    await this.historyService.logOperation(document.carrierId, {
      operationType: OperationType.DOCUMENT_VERIFIED,
      description: `Document ${updateStatusDto.status}: ${document.documentType}`,
      performedBy: verifiedBy,
      relatedEntityId: documentId,
      metadata: {
        oldStatus,
        newStatus: updateStatusDto.status,
        rejectionReason: updateStatusDto.rejectionReason,
      },
    })

    return updatedDocument
  }

  async deleteDocument(documentId: string, carrierId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, carrierId },
    })

    if (!document) {
      throw new NotFoundException("Document not found")
    }

    // Delete physical file
    try {
      await unlink(document.filePath)
    } catch (error) {
      console.error("Error deleting file:", error)
    }

    await this.documentRepository.remove(document)
  }

  async getExpiringDocuments(days = 30): Promise<CarrierDocument[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return this.documentRepository
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.carrier", "carrier")
      .where("document.expiryDate <= :futureDate", { futureDate })
      .andWhere("document.expiryDate > :now", { now: new Date() })
      .andWhere("document.status = :status", { status: DocumentStatus.APPROVED })
      .orderBy("document.expiryDate", "ASC")
      .getMany()
  }
}
