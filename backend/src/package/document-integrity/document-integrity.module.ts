import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../../documents/entities/document.entity';
import { DocumentIntegrityService } from './document-integrity.service';
import { DocumentIntegrityController } from './document-integrity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [DocumentIntegrityController],
  providers: [DocumentIntegrityService],
})
export class DocumentIntegrityModule {}
