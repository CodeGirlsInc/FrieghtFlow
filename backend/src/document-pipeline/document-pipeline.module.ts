import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentProcessing } from './entities/document-processing.entity';
import { Document } from '../documents/entities/document.entity';
import { DocumentPipelineService } from './document-pipeline.service';
import { DocumentPipelineController } from './document-pipeline.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentProcessing, Document])],
  controllers: [DocumentPipelineController],
  providers: [DocumentPipelineService],
})
export class DocumentPipelineModule {}
