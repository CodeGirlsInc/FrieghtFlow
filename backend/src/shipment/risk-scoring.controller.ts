import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ShipmentService } from "./shipment.service";
import { Shipment } from "./shipment.entity";
import { CalculateRiskDto } from "./dto/calculate-risk.dto";

@Controller("risk-scoring")
export class RiskScoringController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post("shipments/:id/calculate")
  async calculateRiskScore(
    @Param("id") id: string,
    @Body() calculateRiskDto: CalculateRiskDto
  ): Promise<Shipment> {
    return this.shipmentService.calculateRiskScore(id);
  }

  @Get("shipments/risk-level/:riskLevel")
  async getShipmentsByRiskLevel(@Param("riskLevel") riskLevel: string): Promise<Shipment[]> {
    return this.shipmentService.getShipmentsByRiskLevel(riskLevel);
  }

  @Get("statistics")
  async getRiskStatistics(): Promise<any> {
    return this.shipmentService.getRiskStatistics();
  }
}