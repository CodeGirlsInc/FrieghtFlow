import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  Res,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { FileUploadService } from './file-upload.service';
import type {
  UploadDocumentDto,
  QueryDocumentsDto,
} from './dto/upload-document.dto';
import type { DocumentStatus } from './entities/document.entity';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(file: any, @Body() uploadDto: UploadDocumentDto) {
    const document = await this.fileUploadService.uploadDocument(
      file,
      uploadDto,
    );

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: document.id,
        originalName: document.originalName,
        fileName: document.fileName,
        documentType: document.documentType,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt,
      },
    };
  }

  @Get('documents')
  async getDocuments(@Query() queryDto: QueryDocumentsDto) {
    const result = await this.fileUploadService.findAll(queryDto);

    return {
      success: true,
      data: result.documents,
      pagination: {
        total: result.total,
        limit: queryDto.limit,
        offset: queryDto.offset,
        hasMore: result.total > queryDto.offset + queryDto.limit,
      },
    };
  }

  @Get('documents/:id')
  async getDocument(@Param('id', ParseUUIDPipe) id: string) {
    const document = await this.fileUploadService.findOne(id);

    return {
      success: true,
      data: document,
    };
  }

  @Get('documents/:id/download')
  async downloadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { buffer, document } =
      await this.fileUploadService.downloadDocument(id);

    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.originalName}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  @Delete('documents/:id')
  async deleteDocument(@Param('id', ParseUUIDPipe) id: string) {
    await this.fileUploadService.deleteDocument(id);

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }

  @Post('documents/:id/status')
  async updateDocumentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: DocumentStatus,
  ) {
    const document = await this.fileUploadService.updateDocumentStatus(
      id,
      status,
    );

    return {
      success: true,
      message: 'Document status updated successfully',
      data: {
        id: document.id,
        status: document.status,
        updatedAt: document.updatedAt,
      },
    };
  }

  @Get('documents/shipment/:shipmentId')
  async getDocumentsByShipment(@Param('shipmentId') shipmentId: string) {
    const documents =
      await this.fileUploadService.getDocumentsByShipment(shipmentId);

    return {
      success: true,
      data: documents,
    };
  }

  @Get('stats')
  async getDocumentStats() {
    const stats = await this.fileUploadService.getDocumentStats();

    return {
      success: true,
      data: stats,
    };
  }
}
