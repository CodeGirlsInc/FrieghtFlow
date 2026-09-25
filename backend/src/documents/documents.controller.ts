import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import {
  isAllowedDocumentMimeType,
  unsupportedDocumentMimeTypeMessage,
} from './document-upload.constants';
import { UploadCleanupInterceptor } from './upload-cleanup.interceptor';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document for a shipment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'shipmentId', 'documentType'],
      properties: {
        file: { type: 'string', format: 'binary' },
        shipmentId: { type: 'string', format: 'uuid' },
        documentType: { type: 'string' },
        notes: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or payload' })
  @ApiResponse({ status: 403, description: 'Not a party to this shipment' })
  // Multer options are configured via MulterModule in DocumentsModule. The
  // cleanup interceptor wraps parsing so rejected requests cannot leak files.
  @UseInterceptors(UploadCleanupInterceptor, FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!isAllowedDocumentMimeType(file.mimetype)) {
      throw new BadRequestException(
        unsupportedDocumentMimeTypeMessage(file.mimetype),
      );
    }
    return this.documentsService.upload(file, dto, user);
  }

  @Get('shipment/:shipmentId')
  @ApiOperation({ summary: 'List all documents for a shipment' })
  @ApiResponse({ status: 200, description: 'Document list' })
  listByShipment(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.listByShipment(shipmentId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata by ID' })
  @ApiResponse({ status: 200, description: 'Document metadata' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.documentsService.findOne(id, user);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document file' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const { filePath, originalName } = await this.documentsService.getFilePath(
      id,
      user,
    );
    res.download(filePath, originalName);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document (uploader or admin only)' })
  @ApiResponse({ status: 204, description: 'Document deleted' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.documentsService.delete(id, user);
  }
}
