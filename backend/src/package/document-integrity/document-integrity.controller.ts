import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DocumentIntegrityService, IntegrityResult } from './document-integrity.service';

@Controller('api/documents')
@UseGuards(JwtAuthGuard)
export class DocumentIntegrityController {
  constructor(private readonly integrityService: DocumentIntegrityService) {}

  @Post(':id/verify-integrity')
  verifyIntegrity(@Param('id') id: string): Promise<IntegrityResult> {
    return this.integrityService.verifyIntegrity(id);
  }
}
