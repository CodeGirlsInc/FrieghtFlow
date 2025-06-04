import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from "@nestjs/common"
import type { ComplianceService } from "./compliance.service"
import type { CreateComplianceDocumentDto } from "./dto/create-compliance-document.dto"
import type { UpdateComplianceDocumentDto } from "./dto/update-compliance-document.dto"
import type { VerifyDocumentDto } from "./dto/verify-document.dto"
import type { FilterComplianceDocumentsDto } from "./dto/filter-compliance-documents.dto"
import type { VerificationStatus } from "./entities/compliance-document.entity"
import { AdminGuard } from "../auth/guards/admin.guard"
import { AuthGuard } from "../auth/guards/auth.guard"

@Controller("compliance")
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post("documents")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createComplianceDocumentDto: CreateComplianceDocumentDto) {
    // In a real application, you would get the userId from the authenticated user
    // For now, we'll use the one provided in the DTO
    return this.complianceService.create(createComplianceDocumentDto)
  }

  @Get("documents")
  @UseGuards(AuthGuard)
  findAll(@Query() filters: FilterComplianceDocumentsDto, @Request() req) {
    // If user is admin, return all documents based on filters
    // If user is regular user, only return their documents
    const isAdmin = req.user?.isAdmin || false

    if (!isAdmin) {
      filters.userId = req.user.id
    }

    return this.complianceService.findAll(filters)
  }

  @Get("documents/pending")
  @UseGuards(AdminGuard)
  getPendingDocuments() {
    return this.complianceService.getPendingDocuments()
  }

  @Get("documents/by-status/:status")
  @UseGuards(AdminGuard)
  getDocumentsByStatus(@Param("status") status: VerificationStatus) {
    return this.complianceService.getDocumentsByStatus(status)
  }

  @Get("documents/:id")
  @UseGuards(AuthGuard)
  findOne(@Param("id", ParseUUIDPipe) id: string, @Request() req) {
    // In a real application, you would check if the user has permission to view this document
    return this.complianceService.findOne(id)
  }

  @Patch("documents/:id")
  @UseGuards(AuthGuard)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateComplianceDocumentDto: UpdateComplianceDocumentDto,
    @Request() req,
  ) {
    // In a real application, you would check if the user has permission to update this document
    return this.complianceService.update(id, updateComplianceDocumentDto)
  }

  @Delete("documents/:id")
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.complianceService.remove(id)
  }

  @Post("documents/:id/verify")
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  verifyDocument(@Param("id", ParseUUIDPipe) id: string, @Body() verifyDocumentDto: VerifyDocumentDto, @Request() req) {
    return this.complianceService.verifyDocument(id, verifyDocumentDto, req.user.id)
  }

  @Get("user-documents")
  @UseGuards(AuthGuard)
  getUserDocuments(@Request() req) {
    return this.complianceService.getUserDocuments(req.user.id)
  }

  @Get("expiring")
  @UseGuards(AdminGuard)
  getExpiringDocuments(@Query("days") days?: string) {
    const daysThreshold = days ? Number.parseInt(days, 10) : 30
    return this.complianceService.checkExpiringDocuments(daysThreshold)
  }
}
