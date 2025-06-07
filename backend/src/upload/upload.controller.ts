import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Get,
  Param,
  Delete,
  Res,
  BadRequestException,
} from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiConsumes, ApiBody, ApiResponse } from "@nestjs/swagger"
import type { Response } from "express"
import type { UploadService } from "./upload.service"
import { type UploadDto, UploadResponseDto } from "./dto/upload.dto"
import type { Express } from "express"

@ApiTags("Upload")
@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("single")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
        uploadType: {
          type: "string",
          enum: ["proof", "kyc", "shipment", "id", "general"],
        },
        description: {
          type: "string",
        },
        referenceId: {
          type: "string",
        },
      },
    },
  })
  @ApiResponse({ type: UploadResponseDto })
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDto,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException("No file uploaded")
    }

    return this.uploadService.saveFileRecord(file, uploadDto)
  }

  @Post("multiple")
  @UseInterceptors(FilesInterceptor("files", 5))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
        uploadType: {
          type: "string",
          enum: ["proof", "kyc", "shipment", "id", "general"],
        },
        description: {
          type: "string",
        },
        referenceId: {
          type: "string",
        },
      },
    },
  })
  @ApiResponse({ type: [UploadResponseDto] })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadDto,
  ): Promise<UploadResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded")
    }

    const results = []
    for (const file of files) {
      const result = await this.uploadService.saveFileRecord(file, uploadDto)
      results.push(result)
    }

    return results
  }

  @Get(':id')
  @ApiResponse({ type: UploadResponseDto })
  async getFile(@Param('id') id: string): Promise<UploadResponseDto> {
    return this.uploadService.getFileById(id);
  }

  @Get("download/:id")
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.uploadService.getFileById(id)
    return res.download(file.path, file.originalName)
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string): Promise<{ message: string }> {
    await this.uploadService.deleteFile(id);
    return { message: 'File deleted successfully' };
  }

  @Get('by-type/:uploadType')
  @ApiResponse({ type: [UploadResponseDto] })
  async getFilesByType(@Param('uploadType') uploadType: string): Promise<UploadResponseDto[]> {
    return this.uploadService.getFilesByType(uploadType);
  }

  @Get('by-reference/:referenceId')
  @ApiResponse({ type: [UploadResponseDto] })
  async getFilesByReference(@Param('referenceId') referenceId: string): Promise<UploadResponseDto[]> {
    return this.uploadService.getFilesByReference(referenceId);
  }
}
