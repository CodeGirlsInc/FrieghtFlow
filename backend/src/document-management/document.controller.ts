import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import {
  UploadDocumentDto,
  QueryDocumentsDto,
  UpdateDocumentDto,
  CreateVerificationDto,
} from './dto';
import { DocumentResponseDto, DocumentWithVerificationDto, DocumentStatsDto } from './dto/document-response.dto';
import { DocumentAccessLog } from './entities/document-access-log.entity';
import { DocumentVerification } from './entities/document-verification.entity';

@ApiTags('Document Management')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Document uploaded successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or upload data',
  })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @Req() request: Request,
  ): Promise<DocumentResponseDto> {
    // TODO: Extract user ID from JWT token
    const userId = (request as any).user?.id;
    
    return this.documentService.uploadDocument(file, uploadDto, userId, request);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documents retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: { $ref: '#/components/schemas/DocumentResponseDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() queryDto: QueryDocumentsDto,
    @Req() request: Request,
  ): Promise<{ documents: DocumentResponseDto[]; total: number }> {
    const userId = (request as any).user?.id;
    return this.documentService.findAll(queryDto, userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document statistics retrieved successfully',
    type: DocumentStatsDto,
  })
  async getStats(): Promise<DocumentStatsDto> {
    return this.documentService.getDocumentStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document retrieved successfully',
    type: DocumentWithVerificationDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied for confidential document',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<DocumentWithVerificationDto> {
    const userId = (request as any).user?.id;
    return this.documentService.findOne(id, userId, request);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document file' })
  @ApiParam({ name: 'id', description: 'Document ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document file downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied for confidential document',
  })
  async downloadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    const userId = (request as any).user?.id;
    const { buffer, document } = await this.documentService.downloadDocument(id, userId, request);

    response.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.originalName}"`,
      'Content-Length': buffer.length.toString(),
    });

    response.send(buffer);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiParam({ name: 'id', description: 'Document ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document updated successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied: Only uploader can modify document',
  })
  async updateDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDocumentDto,
    @Req() request: Request,
  ): Promise<DocumentResponseDto> {
    const userId = (request as any).user?.id;
    return this.documentService.updateDocument(id, updateDto, userId, request);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', description: 'Document ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied: Only uploader can delete document',
  })
  async deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<void> {
    const userId = (request as any).user?.id;
    return this.documentService.deleteDocument(id, userId, request);
  }

  @Get('shipment/:shipmentId')
  @ApiOperation({ summary: 'Get all documents for a specific shipment' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Shipment documents retrieved successfully',
    type: [DocumentResponseDto],
  })
  async getDocumentsByShipment(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
  ): Promise<DocumentResponseDto[]> {
    return this.documentService.getDocumentsByShipment(shipmentId);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Create a verification for a document' })
  @ApiParam({ name: 'id', description: 'Document ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Verification created successfully',
    type: DocumentVerification,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  async createVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createDto: CreateVerificationDto,
    @Req() request: Request,
  ): Promise<DocumentVerification> {
    const userId = (request as any).user?.id;
    return this.documentService.createVerification(id, createDto, userId);
  }

  @Get(':id/access-logs')
  @ApiOperation({ summary: 'Get access logs for a document' })
  @ApiParam({ name: 'id', description: 'Document ID', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Number of logs to return' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access logs retrieved successfully',
    type: [DocumentAccessLog],
  })
  async getDocumentAccessLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
  ): Promise<DocumentAccessLog[]> {
    return this.documentService.getDocumentAccessLogs(id, limit);
  }

  @Get('search/:query')
  @ApiOperation({ summary: 'Search documents by text' })
  @ApiParam({ name: 'query', description: 'Search query', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: { $ref: '#/components/schemas/DocumentResponseDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  async searchDocuments(
    @Param('query') query: string,
    @Query() queryDto: QueryDocumentsDto,
    @Req() request: Request,
  ): Promise<{ documents: DocumentResponseDto[]; total: number }> {
    const userId = (request as any).user?.id;
    return this.documentService.findAll({ ...queryDto, search: query }, userId);
  }

  @Get('expired/documents')
  @ApiOperation({ summary: 'Get expired documents' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired documents retrieved successfully',
    type: [DocumentResponseDto],
  })
  async getExpiredDocuments(@Req() request: Request): Promise<DocumentResponseDto[]> {
    const userId = (request as any).user?.id;
    const now = new Date().toISOString();
    return this.documentService.findAll(
      { expiresBefore: now, status: 'VALIDATED' as any },
      userId,
    ).then(result => result.documents);
  }

  @Get('confidential/documents')
  @ApiOperation({ summary: 'Get confidential documents' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Confidential documents retrieved successfully',
    type: [DocumentResponseDto],
  })
  async getConfidentialDocuments(@Req() request: Request): Promise<DocumentResponseDto[]> {
    const userId = (request as any).user?.id;
    return this.documentService.findAll(
      { isConfidential: true },
      userId,
    ).then(result => result.documents);
  }

  @Get('required/documents')
  @ApiOperation({ summary: 'Get required documents' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Required documents retrieved successfully',
    type: [DocumentResponseDto],
  })
  async getRequiredDocuments(@Req() request: Request): Promise<DocumentResponseDto[]> {
    const userId = (request as any).user?.id;
    return this.documentService.findAll(
      { isRequired: true },
      userId,
    ).then(result => result.documents);
  }
}
