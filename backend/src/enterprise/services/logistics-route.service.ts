import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { LogisticsRoute, RouteStatus } from "../entities/logistics-route.entity"
import type { CreateLogisticsRouteDto } from "../dto/create-logistics-route.dto"

@Injectable()
export class LogisticsRouteService {
  constructor(
    @InjectRepository(LogisticsRoute)
    private readonly routeRepository: Repository<LogisticsRoute>,
  ) {}

  async create(createRouteDto: CreateLogisticsRouteDto): Promise<LogisticsRoute> {
    const route = this.routeRepository.create(createRouteDto)
    return await this.routeRepository.save(route)
  }

  async findAll(organizationId?: string): Promise<LogisticsRoute[]> {
    const query = this.routeRepository
      .createQueryBuilder("route")
      .leftJoinAndSelect("route.organization", "organization")
      .leftJoinAndSelect("route.shipments", "shipments")

    if (organizationId) {
      query.where("route.organizationId = :organizationId", { organizationId })
    }

    return await query.getMany()
  }

  async findOne(id: string): Promise<LogisticsRoute> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ["organization", "shipments"],
    })

    if (!route) {
      throw new NotFoundException("Logistics route not found")
    }

    return route
  }

  async updateStatus(id: string, status: RouteStatus): Promise<LogisticsRoute> {
    const route = await this.findOne(id)
    route.status = status
    return await this.routeRepository.save(route)
  }

  async getActiveRoutes(organizationId: string): Promise<LogisticsRoute[]> {
    return await this.routeRepository.find({
      where: { organizationId, status: RouteStatus.ACTIVE },
      relations: ["shipments"],
    })
  }

  async getRoutePerformance(routeId: string) {
    const route = await this.findOne(routeId)

    const performance = await this.routeRepository
      .createQueryBuilder("route")
      .leftJoin("route.shipments", "shipments")
      .select([
        "COUNT(shipments.id) as totalShipments",
        "AVG(shipments.cost) as avgShipmentCost",
        "SUM(shipments.cost) as totalRevenue",
      ])
      .where("route.id = :routeId", { routeId })
      .getRawOne()

    return {
      route: route.name,
      totalShipments: Number.parseInt(performance.totalShipments) || 0,
      averageShipmentCost: Number.parseFloat(performance.avgShipmentCost) || 0,
      totalRevenue: Number.parseFloat(performance.totalRevenue) || 0,
      costPerKm: route.cost / route.distance,
    }
  }
}
