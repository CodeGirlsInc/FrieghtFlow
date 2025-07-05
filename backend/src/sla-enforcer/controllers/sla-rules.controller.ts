import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import type { Repository } from "typeorm"
import type { SLARule } from "../entities/sla-rule.entity"
import type { CreateSLARuleDto } from "../dto/create-sla-rule.dto"

@ApiTags("SLA Rules")
@Controller("sla-rules")
export class SLARulesController {
  constructor(private readonly slaRuleRepository: Repository<SLARule>) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new SLA rule" })
  @ApiResponse({ status: 201, description: "SLA rule created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async createSLARule(@Body() createSLARuleDto: CreateSLARuleDto): Promise<SLARule> {
    const slaRule = this.slaRuleRepository.create(createSLARuleDto)
    return this.slaRuleRepository.save(slaRule)
  }

  @Get()
  @ApiOperation({ summary: "Get all SLA rules" })
  @ApiResponse({ status: 200, description: "SLA rules retrieved successfully" })
  @ApiQuery({ name: "isActive", required: false, description: "Filter by active status" })
  async getAllSLARules(@Query('isActive') isActive?: boolean): Promise<SLARule[]> {
    const where = isActive !== undefined ? { isActive } : {}
    return this.slaRuleRepository.find({ where, order: { createdAt: "DESC" } })
  }

  @Get(":id")
  @ApiOperation({ summary: "Get SLA rule by ID" })
  @ApiParam({ name: "id", description: "SLA rule ID" })
  @ApiResponse({ status: 200, description: "SLA rule retrieved successfully" })
  @ApiResponse({ status: 404, description: "SLA rule not found" })
  async getSLARuleById(@Param('id') id: string): Promise<SLARule> {
    const rule = await this.slaRuleRepository.findOne({ where: { id } })
    if (!rule) {
      throw new Error(`SLA rule not found: ${id}`)
    }
    return rule
  }

  @Put(":id")
  @ApiOperation({ summary: "Update SLA rule" })
  @ApiParam({ name: "id", description: "SLA rule ID" })
  @ApiResponse({ status: 200, description: "SLA rule updated successfully" })
  @ApiResponse({ status: 404, description: "SLA rule not found" })
  async updateSLARule(@Param('id') id: string, @Body() updateSLARuleDto: Partial<CreateSLARuleDto>): Promise<SLARule> {
    const rule = await this.getSLARuleById(id)
    Object.assign(rule, updateSLARuleDto)
    return this.slaRuleRepository.save(rule)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete SLA rule" })
  @ApiParam({ name: "id", description: "SLA rule ID" })
  @ApiResponse({ status: 204, description: "SLA rule deleted successfully" })
  @ApiResponse({ status: 404, description: "SLA rule not found" })
  async deleteSLARule(@Param('id') id: string): Promise<void> {
    const rule = await this.getSLARuleById(id)
    await this.slaRuleRepository.remove(rule)
  }

  @Post("seed-default-rules")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create default SLA rules for testing" })
  @ApiResponse({ status: 201, description: "Default SLA rules created" })
  async seedDefaultRules(): Promise<SLARule[]> {
    const defaultRules: CreateSLARuleDto[] = [
      {
        name: "Standard Delivery SLA",
        description: "Standard shipments must be delivered within 3 days",
        ruleType: "delivery_time" as any,
        priority: "medium" as any,
        thresholdMinutes: 3 * 24 * 60, // 3 days
        gracePeriodMinutes: 60, // 1 hour grace period
        conditions: { priority: "standard" },
        actions: {
          alertEmails: ["logistics@company.com"],
          webhookUrl: "https://api.company.com/sla-breach",
          penaltyAmount: 50,
        },
      },
      {
        name: "Express Delivery SLA",
        description: "Express shipments must be delivered within 1 day",
        ruleType: "delivery_time" as any,
        priority: "high" as any,
        thresholdMinutes: 24 * 60, // 1 day
        gracePeriodMinutes: 30, // 30 minutes grace period
        conditions: { priority: "express" },
        actions: {
          alertEmails: ["logistics@company.com", "manager@company.com"],
          webhookUrl: "https://api.company.com/sla-breach",
          penaltyAmount: 100,
        },
      },
      {
        name: "Pickup Time SLA",
        description: "Shipments must be picked up within 4 hours of creation",
        ruleType: "pickup_time" as any,
        priority: "medium" as any,
        thresholdMinutes: 4 * 60, // 4 hours
        gracePeriodMinutes: 15, // 15 minutes grace period
        actions: {
          alertEmails: ["pickup@company.com"],
          penaltyAmount: 25,
        },
      },
    ]

    const createdRules: SLARule[] = []
    for (const ruleDto of defaultRules) {
      const existingRule = await this.slaRuleRepository.findOne({
        where: { name: ruleDto.name },
      })

      if (!existingRule) {
        const rule = this.slaRuleRepository.create(ruleDto)
        const savedRule = await this.slaRuleRepository.save(rule)
        createdRules.push(savedRule)
      } else {
        createdRules.push(existingRule)
      }
    }

    return createdRules
  }
}
