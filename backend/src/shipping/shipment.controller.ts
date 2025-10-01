import { Controller, Get, Post, Patch, Delete } from "@nestjs/common"
import type { ShipmentService } from "./shipment.service"
import type { CreateShipmentDto } from "./dto/create-shipment.dto"
import type { UpdateShipmentDto } from "./dto/update-shipment.dto"
import type { TrackingUpdateDto } from "./dto/tracking-update.dto"
import type { ArchiveShipmentDto } from "./dto/archive-shipment.dto"
import type { ShipmentStatus } from "./entities/shipment.entity"

@Controller("shipments")
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  create(createShipmentDto: CreateShipmentDto) {
    return this.shipmentService.create(createShipmentDto)
  }

  @Get()
  findAll(includeArchived = "false") {
    const includeArchivedBool = includeArchived.toLowerCase() === "true"
    return this.shipmentService.findAll(includeArchivedBool)
  }

  @Get("stats")
  getStats() {
    return this.shipmentService.getShipmentStats()
  }

  @Get("status/:status")
  findByStatus(status: string) {
    const statusArray = status.split(",") as ShipmentStatus[]
    return this.shipmentService.findByStatus(statusArray)
  }

  @Get("carrier/:carrier")
  findByCarrier(carrier: string) {
    return this.shipmentService.findByCarrier(carrier)
  }

  @Get("date-range")
  findByDateRange(startDate: string, endDate: string) {
    return this.shipmentService.findByDateRange(new Date(startDate), new Date(endDate))
  }

  @Get("tracking/:trackingNumber")
  findByTrackingNumber(trackingNumber: string) {
    return this.shipmentService.findByTrackingNumber(trackingNumber)
  }

  @Get(":id")
  findOne(id: string) {
    return this.shipmentService.findOne(id)
  }

  @Patch(":id")
  update(id: string, updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentService.update(id, updateShipmentDto)
  }

  @Patch(":id/tracking")
  updateTracking(id: string, trackingUpdateDto: TrackingUpdateDto) {
    return this.shipmentService.updateTracking(id, trackingUpdateDto)
  }

  @Patch(":id/archive")
  archive(id: string, archiveDto: ArchiveShipmentDto) {
    return this.shipmentService.archive(id, archiveDto)
  }

  @Patch(":id/unarchive")
  unarchive(id: string) {
    return this.shipmentService.unarchive(id)
  }

  @Delete(":id")
  remove(id: string) {
    return this.shipmentService.remove(id)
  }
}
