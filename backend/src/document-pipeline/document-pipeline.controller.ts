import { Controller, Post, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentPipelineService } from './document-pipeline.service';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentPipelineController {
  constructor(private readonly service: DocumentPipelineService) {}

  @Post(':id/process')
  @ApiOperation({ summary: 'Enqueue document for async processing, returns 202' })
  async enqueue(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.enqueue(id);
    return this.service.process(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document processing status' })
  getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getStatus(id);
  }
}
