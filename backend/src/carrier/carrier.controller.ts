import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
} from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger"
import type { CarrierService } from "./carrier.service"
import type { CarrierDocumentService } from "./services/carrier-document.service"
import type { VehicleService } from "./services/vehicle.service"
import type { OperationalHistoryService } from "./services/operational-history.service"
import type { CarrierVerificationService } from "./services/carrier-verification.service"
import type { CreateCarrierDto, UpdateCarrierDto, UpdateCarrierStatusDto, CarrierQueryDto } from "./dto/carrier.dto"
import type { CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from "./dto/vehicle.dto"
import type { UploadDocumentDto, UpdateDocumentStatusDto } from "./dto/document.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { AdminGuard } from "../auth/guards/admin.guard"
import { CarrierGuard } from "../auth/guards/carrier.guard"
import type { Express } from "express"

@ApiTags("Carriers")
@Controller("carriers")
@UseGuards(JwtAuthGuard)
export class CarrierController {
  constructor(
    private readonly carrierService: CarrierService,
    private readonly documentService: CarrierDocumentService,
    private readonly vehicleService: VehicleService,
    private readonly historyService: OperationalHistoryService,
    private readonly verificationService: CarrierVerificationService,
  ) {}

  // Carrier Profile Management
  @Post()
  @ApiOperation({ summary: "Create carrier profile" })
  @ApiResponse({ status: 201, description: "Carrier profile created successfully" })
  async createCarrier(createCarrierDto: CreateCarrierDto, @Request() req: any) {
    return this.carrierService.create(createCarrierDto, req.user.id)
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all carriers (Admin only)" })
  async getAllCarriers(@Query() query: CarrierQueryDto) {
    return this.carrierService.findAll(query)
  }

  @Get("profile")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get carrier profile" })
  async getCarrierProfile(@Request() req: any) {
    return this.carrierService.findByUserId(req.user.id)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get carrier by ID" })
  async getCarrier(@Param("id") id: string) {
    return this.carrierService.findOne(id)
  }

  @Put("profile")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update carrier profile" })
  async updateCarrierProfile(updateCarrierDto: UpdateCarrierDto, @Request() req: any) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.carrierService.update(carrier.id, updateCarrierDto, req.user.id)
  }

  @Put(":id/status")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update carrier status (Admin only)" })
  async updateCarrierStatus(@Param("id") id: string, updateStatusDto: UpdateCarrierStatusDto, @Request() req: any) {
    return this.carrierService.updateStatus(id, updateStatusDto, req.user.id)
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete carrier (Admin only)" })
  async deleteCarrier(@Param("id") id: string) {
    return this.carrierService.remove(id)
  }

  // Document Management
  @Post("documents/upload")
  @UseGuards(CarrierGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload carrier document" })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    uploadDocumentDto: UploadDocumentDto,
    @Request() req: any,
  ) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.documentService.uploadDocument(carrier.id, file, uploadDocumentDto)
  }

  @Get("documents")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get carrier documents" })
  async getCarrierDocuments(@Request() req: any) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.documentService.getCarrierDocuments(carrier.id)
  }

  @Put("documents/:documentId/status")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update document status (Admin only)" })
  async updateDocumentStatus(
    @Param("documentId") documentId: string,
    updateStatusDto: UpdateDocumentStatusDto,
    @Request() req: any,
  ) {
    return this.documentService.updateDocumentStatus(documentId, updateStatusDto, req.user.id)
  }

  @Delete("documents/:documentId")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete carrier document" })
  async deleteDocument(@Param("documentId") documentId: string, @Request() req: any) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.documentService.deleteDocument(documentId, carrier.id)
  }

  // Vehicle Management
  @Post("vehicles")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add vehicle to carrier fleet" })
  async addVehicle(createVehicleDto: CreateVehicleDto, @Request() req: any) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.vehicleService.create(carrier.id, createVehicleDto)
  }

  @Post("vehicles/:vehicleId/images")
  @UseGuards(CarrierGuard)
  @UseInterceptors(FilesInterceptor("images", 5))
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload vehicle images" })
  async uploadVehicleImages(
    @Param("vehicleId") vehicleId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.vehicleService.uploadImages(vehicleId, files, carrier.id)
  }

  @Get("vehicles")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get carrier vehicles" })
  async getCarrierVehicles(@Query() query: VehicleQueryDto, @Request() req: any) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.vehicleService.findByCarrier(carrier.id, query)
  }

  @Get("vehicles/available")
  @ApiOperation({ summary: "Get available vehicles" })
  async getAvailableVehicles(@Query() query: VehicleQueryDto) {
    return this.vehicleService.findAvailable(query)
  }

  @Put("vehicles/:vehicleId")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update vehicle information" })
  async updateVehicle(@Param("vehicleId") vehicleId: string, updateVehicleDto: UpdateVehicleDto, @Request() req: any) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.vehicleService.update(vehicleId, updateVehicleDto, carrier.id)
  }

  @Delete("vehicles/:vehicleId")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove vehicle from fleet" })
  async removeVehicle(@Param("vehicleId") vehicleId: string, @Request() req: any) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.vehicleService.remove(vehicleId, carrier.id)
  }

  // Operational History
  @Get("history")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get carrier operational history" })
  async getOperationalHistory(@Request() req: any, @Query("page") page = 1, @Query("limit") limit = 20) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.historyService.getCarrierHistory(carrier.id, { page, limit })
  }

  // Verification Management
  @Get("verification")
  @UseGuards(CarrierGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get carrier verification status" })
  async getVerificationStatus(@Request() req: any) {
    const carrier = await this.carrierService.findByUserId(req.user.id)
    return this.verificationService.getVerificationStatus(carrier.id)
  }

  @Post(":id/verify")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Start carrier verification process (Admin only)" })
  async startVerification(@Param("id") carrierId: string, @Request() req: any) {
    return this.verificationService.startVerification(carrierId, req.user.id)
  }

  @Put(":id/verification")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update verification status (Admin only)" })
  async updateVerification(@Param("id") carrierId: string, verificationData: any, @Request() req: any) {
    return this.verificationService.updateVerification(carrierId, verificationData, req.user.id)
  }
}
