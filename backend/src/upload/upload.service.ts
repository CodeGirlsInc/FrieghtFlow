import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { unlink } from "fs/promises"
import type { UploadDto, UploadResponseDto } from "./dto/upload.dto"
import { FileUpload } from "./entities/file-upload.entity"
import type { Express } from "express"

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(FileUpload)
    private readonly fileUploadRepository: Repository<FileUpload>,
  ) {}

  async saveFileRecord(file: Express.Multer.File, uploadDto: UploadDto): Promise<UploadResponseDto> {
    const fileRecord = this.fileUploadRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadType: uploadDto.uploadType,
      description: uploadDto.description,
      referenceId: uploadDto.referenceId,
    })

    const savedFile = await this.fileUploadRepository.save(fileRecord)
    return this.mapToResponseDto(savedFile)
  }

  async getFileById(id: string): Promise<UploadResponseDto> {
    const file = await this.fileUploadRepository.findOne({ where: { id } })
    if (!file) {
      throw new NotFoundException("File not found")
    }
    return this.mapToResponseDto(file)
  }

  async getFilesByType(uploadType: string): Promise<UploadResponseDto[]> {
    const files = await this.fileUploadRepository.find({
      where: { uploadType },
      order: { uploadedAt: "DESC" },
    })
    return files.map((file) => this.mapToResponseDto(file))
  }

  async getFilesByReference(referenceId: string): Promise<UploadResponseDto[]> {
    const files = await this.fileUploadRepository.find({
      where: { referenceId },
      order: { uploadedAt: "DESC" },
    })
    return files.map((file) => this.mapToResponseDto(file))
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.fileUploadRepository.findOne({ where: { id } })
    if (!file) {
      throw new NotFoundException("File not found")
    }

    try {
      await unlink(file.path)
    } catch (error) {
      console.error("Error deleting physical file:", error)
    }

    await this.fileUploadRepository.remove(file)
  }

  private mapToResponseDto(file: FileUpload): UploadResponseDto {
    return {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadType: file.uploadType,
      uploadedAt: file.uploadedAt,
      description: file.description,
      referenceId: file.referenceId,
    }
  }
}
