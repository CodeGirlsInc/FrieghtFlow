import { Controller, Post, Get, Param, Query, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import type { RewardsEngineService } from "../services/rewards-engine.service"
import type { RedemptionService } from "../services/redemption.service"
import type { RewardEventDto } from "../dto/reward-event.dto"
import { RewardBalanceDto } from "../dto/reward-balance.dto"
import type { RedemptionRequestDto } from "../dto/redemption-request.dto"

@ApiTags("Rewards Engine")
@Controller("rewards")
export class RewardsEngineController {
  constructor(
    private readonly rewardsEngineService: RewardsEngineService,
    private readonly redemptionService: RedemptionService,
  ) {}

  @Post("events")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Process a reward event" })
  @ApiResponse({ status: 200, description: "Reward event processed successfully" })
  @ApiResponse({ status: 400, description: "Invalid event data or constraints violated" })
  async processRewardEvent(eventDto: RewardEventDto) {
    return this.rewardsEngineService.processRewardEvent(eventDto)
  }

  @Get("balance/:userId")
  @ApiOperation({ summary: "Get user reward balance and tier information" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "Reward balance retrieved successfully", type: RewardBalanceDto })
  @ApiResponse({ status: 404, description: "User reward balance not found" })
  async getRewardBalance(@Param("userId") userId: string): Promise<RewardBalanceDto> {
    return this.rewardsEngineService.getRewardBalance(userId)
  }

  @Get("transactions/:userId")
  @ApiOperation({ summary: "Get user transaction history" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of transactions to return" })
  @ApiResponse({ status: 200, description: "Transaction history retrieved successfully" })
  async getTransactionHistory(@Param("userId") userId: string, @Query("limit") limit?: number) {
    return this.rewardsEngineService.getTransactionHistory(userId, limit)
  }

  @Post("redemptions")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new redemption" })
  @ApiResponse({ status: 201, description: "Redemption created successfully" })
  @ApiResponse({ status: 400, description: "Insufficient points or invalid request" })
  async createRedemption(request: RedemptionRequestDto) {
    return this.redemptionService.createRedemption(request)
  }

  @Get("redemptions/:userId")
  @ApiOperation({ summary: "Get user redemption history" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of redemptions to return" })
  @ApiResponse({ status: 200, description: "Redemption history retrieved successfully" })
  async getUserRedemptions(@Param("userId") userId: string, @Query("limit") limit?: number) {
    return this.redemptionService.getUserRedemptions(userId, limit)
  }

  @Post("redemptions/:id/approve")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Approve a pending redemption" })
  @ApiParam({ name: "id", description: "Redemption ID" })
  @ApiResponse({ status: 200, description: "Redemption approved successfully" })
  @ApiResponse({ status: 400, description: "Cannot approve redemption in current status" })
  async approveRedemption(@Param("id") id: string) {
    return this.redemptionService.approveRedemption(id)
  }

  @Post("redemptions/:id/fulfill")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Fulfill an approved redemption" })
  @ApiParam({ name: "id", description: "Redemption ID" })
  @ApiResponse({ status: 200, description: "Redemption fulfilled successfully" })
  async fulfillRedemption(@Param("id") id: string) {
    return this.redemptionService.fulfillRedemption(id)
  }

  @Post("redemptions/:id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel a redemption" })
  @ApiParam({ name: "id", description: "Redemption ID" })
  @ApiQuery({ name: "refund", required: false, type: Boolean, description: "Whether to refund points" })
  @ApiResponse({ status: 200, description: "Redemption cancelled successfully" })
  async cancelRedemption(@Param("id") id: string, @Query("refund") refund = true) {
    return this.redemptionService.cancelRedemption(id, refund)
  }

  @Get("statistics/redemptions")
  @ApiOperation({ summary: "Get redemption statistics" })
  @ApiQuery({ name: "userId", required: false, type: String, description: "Filter by user ID" })
  @ApiResponse({ status: 200, description: "Redemption statistics retrieved successfully" })
  async getRedemptionStatistics(@Query("userId") userId?: string) {
    return this.redemptionService.getRedemptionStatistics(userId)
  }

  @Post("adjust/:userId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Manually adjust user points" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "Points adjusted successfully" })
  async adjustPoints(@Param("userId") userId: string, body: { points: number; reason: string }) {
    await this.rewardsEngineService.adjustPoints(userId, body.points, body.reason)
    return { message: "Points adjusted successfully" }
  }
}
