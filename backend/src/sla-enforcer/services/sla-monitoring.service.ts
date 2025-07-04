import { Injectable, Logger } from "@nestjs/common"
import { type Repository, In } from "typeorm"
import { Cron, CronExpression } from "@nestjs/schedule"
import { type SLARule, SLAType } from "../entities/sla-rule.entity"
import { type Shipment, ShipmentStatus } from "../entities/shipment.entity"
import { type SLAViolation, ViolationStatus } from "../entities/sla-violation.entity"
import type { SLAActionService } from "./sla-action.service"
import type { SLAMonitoringResult, SLAViolationSummary } from "../interfaces/sla-enforcer.interface"

@Injectable()
export class SLAMonitoringService {
  private readonly logger = new Logger(SLAMonitoringService.name)

  constructor(
    private readonly slaRuleRepository: Repository<SLARule>,
    private readonly shipmentRepository: Repository<Shipment>,
    private readonly slaViolationRepository: Repository<SLAViolation>,
    private readonly slaActionService: SLAActionService,
  ) {}

  /**
   * Scheduled monitoring job that runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async performScheduledMonitoring(): Promise<void> {
    this.logger.log("Starting scheduled SLA monitoring...")

    try {
      const results = await this.monitorAllShipments()
      const violations = results.filter((r) => r.isViolated)

      this.logger.log(`Monitoring completed. Found ${violations.length} SLA violations`)

      // Process violations
      for (const violation of violations) {
        await this.handleSLAViolation(violation)
      }
    } catch (error) {
      this.logger.error("Error during scheduled monitoring", error)
    }
  }

  /**
   * Monitor all active shipments against SLA rules
   */
  async monitorAllShipments(): Promise<SLAMonitoringResult[]> {
    const activeRules = await this.slaRuleRepository.find({
      where: { isActive: true },
    })

    if (activeRules.length === 0) {
      this.logger.warn("No active SLA rules found")
      return []
    }

    const results: SLAMonitoringResult[] = []

    for (const rule of activeRules) {
      const shipmentResults = await this.monitorShipmentsForRule(rule)
      results.push(...shipmentResults)
    }

    return results
  }

  /**
   * Monitor shipments for a specific SLA rule
   */
  async monitorShipmentsForRule(rule: SLARule): Promise<SLAMonitoringResult[]> {
    const shipments = await this.getShipmentsForRule(rule)
    const results: SLAMonitoringResult[] = []

    for (const shipment of shipments) {
      const result = await this.evaluateShipmentAgainstRule(shipment, rule)
      results.push(result)
    }

    return results
  }

  /**
   * Get shipments that should be evaluated against a specific rule
   */
  private async getShipmentsForRule(rule: SLARule): Promise<Shipment[]> {
    const queryBuilder = this.shipmentRepository.createQueryBuilder("shipment")

    // Base conditions
    queryBuilder.where("shipment.status != :deliveredStatus", {
      deliveredStatus: ShipmentStatus.DELIVERED,
    })
    queryBuilder.andWhere("shipment.status != :cancelledStatus", {
      cancelledStatus: ShipmentStatus.CANCELLED,
    })

    // Rule-specific conditions
    switch (rule.ruleType) {
      case SLAType.DELIVERY_TIME:
        queryBuilder.andWhere("shipment.expectedDeliveryAt < :now", { now: new Date() })
        break
      case SLAType.PICKUP_TIME:
        queryBuilder.andWhere("shipment.status = :createdStatus", {
          createdStatus: ShipmentStatus.CREATED,
        })
        break
      case SLAType.PROCESSING_TIME:
        queryBuilder.andWhere("shipment.status IN (:...processingStatuses)", {
          processingStatuses: [ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT],
        })
        break
    }

    // Apply rule conditions if any
    if (rule.conditions) {
      if (rule.conditions.priority) {
        queryBuilder.andWhere("shipment.priority = :priority", {
          priority: rule.conditions.priority,
        })
      }
      if (rule.conditions.origin) {
        queryBuilder.andWhere("shipment.origin ILIKE :origin", {
          origin: `%${rule.conditions.origin}%`,
        })
      }
    }

    return queryBuilder.getMany()
  }

  /**
   * Evaluate a single shipment against an SLA rule
   */
  private async evaluateShipmentAgainstRule(shipment: Shipment, rule: SLARule): Promise<SLAMonitoringResult> {
    const now = new Date()
    let expectedTime: Date
    let actualTime: Date | undefined
    let isViolated = false
    let delayMinutes = 0

    // Determine expected and actual times based on rule type
    switch (rule.ruleType) {
      case SLAType.DELIVERY_TIME:
        expectedTime = shipment.expectedDeliveryAt
        actualTime = shipment.actualDeliveryAt
        if (!actualTime && now > expectedTime) {
          delayMinutes = Math.floor((now.getTime() - expectedTime.getTime()) / (1000 * 60))
          isViolated = delayMinutes > rule.gracePeriodMinutes
        }
        break

      case SLAType.PICKUP_TIME:
        expectedTime = new Date(shipment.createdAt.getTime() + rule.thresholdMinutes * 60 * 1000)
        actualTime = shipment.pickedUpAt
        if (!actualTime && now > expectedTime) {
          delayMinutes = Math.floor((now.getTime() - expectedTime.getTime()) / (1000 * 60))
          isViolated = delayMinutes > rule.gracePeriodMinutes
        }
        break

      case SLAType.PROCESSING_TIME:
        expectedTime = new Date(
          (shipment.pickedUpAt || shipment.createdAt).getTime() + rule.thresholdMinutes * 60 * 1000,
        )
        actualTime = shipment.actualDeliveryAt
        if (!actualTime && now > expectedTime) {
          delayMinutes = Math.floor((now.getTime() - expectedTime.getTime()) / (1000 * 60))
          isViolated = delayMinutes > rule.gracePeriodMinutes
        }
        break

      default:
        expectedTime = shipment.expectedDeliveryAt
    }

    return {
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      ruleId: rule.id,
      ruleName: rule.name,
      isViolated,
      delayMinutes: isViolated ? delayMinutes : undefined,
      expectedTime,
      actualTime,
      status: shipment.status,
    }
  }

  /**
   * Handle an SLA violation
   */
  private async handleSLAViolation(violation: SLAMonitoringResult): Promise<void> {
    // Check if violation already exists
    const existingViolation = await this.slaViolationRepository.findOne({
      where: {
        shipmentId: violation.shipmentId,
        ruleId: violation.ruleId,
        status: In([ViolationStatus.DETECTED, ViolationStatus.PROCESSING]),
      },
    })

    if (existingViolation) {
      // Update existing violation
      existingViolation.delayMinutes = violation.delayMinutes!
      await this.slaViolationRepository.save(existingViolation)
      return
    }

    // Create new violation record
    const newViolation = this.slaViolationRepository.create({
      shipmentId: violation.shipmentId,
      ruleId: violation.ruleId,
      delayMinutes: violation.delayMinutes!,
      detectedAt: new Date(),
      status: ViolationStatus.DETECTED,
    })

    const savedViolation = await this.slaViolationRepository.save(newViolation)

    // Execute actions
    await this.slaActionService.executeViolationActions(savedViolation.id)

    this.logger.warn(
      `SLA violation detected for shipment ${violation.trackingNumber} ` +
        `(Rule: ${violation.ruleName}, Delay: ${violation.delayMinutes} minutes)`,
    )
  }

  /**
   * Get SLA violation summary
   */
  async getViolationSummary(fromDate?: Date, toDate?: Date): Promise<SLAViolationSummary> {
    const queryBuilder = this.slaViolationRepository
      .createQueryBuilder("violation")
      .leftJoinAndSelect("violation.rule", "rule")

    if (fromDate) {
      queryBuilder.andWhere("violation.detectedAt >= :fromDate", { fromDate })
    }
    if (toDate) {
      queryBuilder.andWhere("violation.detectedAt <= :toDate", { toDate })
    }

    const violations = await queryBuilder.getMany()

    const totalViolations = violations.length
    const activeViolations = violations.filter(
      (v) => v.status === ViolationStatus.DETECTED || v.status === ViolationStatus.PROCESSING,
    ).length
    const resolvedViolations = violations.filter((v) => v.status === ViolationStatus.RESOLVED).length

    const averageDelayMinutes =
      violations.length > 0 ? violations.reduce((sum, v) => sum + v.delayMinutes, 0) / violations.length : 0

    const violationsByPriority: Record<string, number> = {}
    const violationsByType: Record<string, number> = {}

    violations.forEach((violation) => {
      const priority = violation.rule.priority
      const type = violation.rule.ruleType

      violationsByPriority[priority] = (violationsByPriority[priority] || 0) + 1
      violationsByType[type] = (violationsByType[type] || 0) + 1
    })

    return {
      totalViolations,
      activeViolations,
      resolvedViolations,
      averageDelayMinutes: Math.round(averageDelayMinutes),
      violationsByPriority,
      violationsByType,
    }
  }

  /**
   * Get monitoring results for specific criteria
   */
  async getMonitoringResults(
    shipmentId?: string,
    ruleId?: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<SLAMonitoringResult[]> {
    if (shipmentId && ruleId) {
      // Monitor specific shipment against specific rule
      const shipment = await this.shipmentRepository.findOne({ where: { id: shipmentId } })
      const rule = await this.slaRuleRepository.findOne({ where: { id: ruleId } })

      if (!shipment || !rule) {
        return []
      }

      const result = await this.evaluateShipmentAgainstRule(shipment, rule)
      return [result]
    }

    // For broader queries, use the general monitoring
    return this.monitorAllShipments()
  }
}
