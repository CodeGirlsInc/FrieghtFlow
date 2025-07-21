import { Injectable } from "@nestjs/common"
import * as path from "path"
import { UPLOAD_CONFIG, DOCUMENT_TYPE_VALIDATION } from "../config/upload.config"
import { DocumentType } from "../entities/document.entity"
import type { Express } from "express"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

@Injectable()
export class FileValidationService {
  validateFile(file: Express.Multer.File, documentType: DocumentType): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic file validation
    if (!file) {
      errors.push("No file provided")
      return { isValid: false, errors, warnings }
    }

    // File size validation
    this.validateFileSize(file, documentType, errors)

    // MIME type validation
    this.validateMimeType(file, documentType, errors)

    // File extension validation
    this.validateFileExtension(file, errors)

    // File content validation (basic)
    this.validateFileContent(file, warnings)

    // Document type specific validation
    this.validateDocumentTypeSpecific(file, documentType, errors, warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private validateFileSize(file: Express.Multer.File, documentType: DocumentType, errors: string[]): void {
    const maxSize = DOCUMENT_TYPE_VALIDATION[documentType]?.maxSize || UPLOAD_CONFIG.MAX_FILE_SIZE

    if (file.size > maxSize) {
      errors.push(
        `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size ${this.formatFileSize(maxSize)}`,
      )
    }

    if (file.size === 0) {
      errors.push("File is empty")
    }
  }

  private validateMimeType(file: Express.Multer.File, documentType: DocumentType, errors: string[]): void {
    const allowedTypes = DOCUMENT_TYPE_VALIDATION[documentType]?.allowedTypes || UPLOAD_CONFIG.ALLOWED_MIME_TYPES

    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(", ")}`)
    }
  }

  private validateFileExtension(file: Express.Multer.File, errors: string[]): void {
    const extension = path.extname(file.originalname).toLowerCase()

    if (!UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(
        `File extension ${extension} is not allowed. Allowed extensions: ${UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(", ")}`,
      )
    }
  }

  private validateFileContent(file: Express.Multer.File, warnings: string[]): void {
    // Basic file header validation
    if (file.mimetype === "application/pdf") {
      if (!file.buffer.subarray(0, 4).toString() === "%PDF") {
        warnings.push("File may be corrupted - PDF header not found")
      }
    }

    if (file.mimetype.startsWith("image/")) {
      // Basic image validation - check for common image headers
      const header = file.buffer.subarray(0, 10)
      const isValidImage = this.isValidImageHeader(header, file.mimetype)

      if (!isValidImage) {
        warnings.push("File may be corrupted - invalid image header")
      }
    }
  }

  private validateDocumentTypeSpecific(
    file: Express.Multer.File,
    documentType: DocumentType,
    errors: string[],
    warnings: string[],
  ): void {
    const config = DOCUMENT_TYPE_VALIDATION[documentType]

    if (!config) {
      warnings.push(`No specific validation rules found for document type: ${documentType}`)
      return
    }

    // Additional validation based on document type
    switch (documentType) {
      case DocumentType.BILL_OF_LADING:
        if (file.mimetype !== "application/pdf") {
          warnings.push("Bill of Lading documents are typically PDF files")
        }
        break

      case DocumentType.COMMERCIAL_INVOICE:
        if (file.size < 1024) {
          warnings.push("Commercial Invoice seems unusually small")
        }
        break

      default:
        break
    }
  }

  private isValidImageHeader(header: Buffer, mimeType: string): boolean {
    switch (mimeType) {
      case "image/jpeg":
        return header[0] === 0xff && header[1] === 0xd8
      case "image/png":
        return header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      case "image/tiff":
        return (header[0] === 0x49 && header[1] === 0x49) || (header[0] === 0x4d && header[1] === 0x4d)
      default:
        return true // Unknown type, assume valid
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  validateUploadRequest(dto: any, documentType: DocumentType): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const config = DOCUMENT_TYPE_VALIDATION[documentType]

    if (config?.requiredFields) {
      for (const field of config.requiredFields) {
        if (!dto[field]) {
          errors.push(`Required field missing: ${field}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }
}
