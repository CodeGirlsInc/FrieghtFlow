import { Controller, Get, Post, Put, Delete, Param, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import type { EventSubscriptionService } from "../services/event-subscription.service"
import type { CreateSubscriptionDto } from "../dto/create-subscription.dto"
import type { UpdateSubscriptionDto } from "../dto/update-subscription.dto"
import type { ContractSubscription } from "../entities/contract-subscription.entity"

@ApiTags("Event Subscriptions")
@Controller("event-subscriptions")
export class EventSubscriptionsController {
  constructor(private readonly eventSubscriptionService: EventSubscriptionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new event subscription" })
  @ApiResponse({ status: 201, description: "Subscription created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async createSubscription(createSubscriptionDto: CreateSubscriptionDto): Promise<ContractSubscription> {
    return this.eventSubscriptionService.createSubscription(createSubscriptionDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all event subscriptions" })
  @ApiResponse({ status: 200, description: "Subscriptions retrieved successfully" })
  async getAllSubscriptions(): Promise<ContractSubscription[]> {
    return this.eventSubscriptionService.getAllSubscriptions()
  }

  @Get(":id")
  @ApiOperation({ summary: "Get subscription by ID" })
  @ApiParam({ name: "id", description: "Subscription ID" })
  @ApiResponse({ status: 200, description: "Subscription retrieved successfully" })
  @ApiResponse({ status: 404, description: "Subscription not found" })
  async getSubscriptionById(@Param('id') id: string): Promise<ContractSubscription> {
    return this.eventSubscriptionService.getSubscriptionById(id)
  }

  @Put(":id")
  @ApiOperation({ summary: "Update subscription" })
  @ApiParam({ name: "id", description: "Subscription ID" })
  @ApiResponse({ status: 200, description: "Subscription updated successfully" })
  @ApiResponse({ status: 404, description: "Subscription not found" })
  async updateSubscription(
    @Param('id') id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<ContractSubscription> {
    return this.eventSubscriptionService.updateSubscription(id, updateSubscriptionDto)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete subscription" })
  @ApiParam({ name: "id", description: "Subscription ID" })
  @ApiResponse({ status: 204, description: "Subscription deleted successfully" })
  @ApiResponse({ status: 404, description: "Subscription not found" })
  async deleteSubscription(@Param('id') id: string): Promise<void> {
    await this.eventSubscriptionService.deleteSubscription(id)
  }

  @Post(":id/start")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Start monitoring for a subscription" })
  @ApiParam({ name: "id", description: "Subscription ID" })
  @ApiResponse({ status: 200, description: "Subscription started successfully" })
  @ApiResponse({ status: 404, description: "Subscription not found" })
  async startSubscription(@Param('id') id: string): Promise<{ message: string }> {
    await this.eventSubscriptionService.startSubscription(id)
    return { message: `Subscription ${id} started successfully` }
  }

  @Post(":id/stop")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Stop monitoring for a subscription" })
  @ApiParam({ name: "id", description: "Subscription ID" })
  @ApiResponse({ status: 200, description: "Subscription stopped successfully" })
  @ApiResponse({ status: 404, description: "Subscription not found" })
  async stopSubscription(@Param('id') id: string): Promise<{ message: string }> {
    await this.eventSubscriptionService.stopSubscription(id)
    return { message: `Subscription ${id} stopped successfully` }
  }

  @Post(":id/restart")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Restart monitoring for a subscription" })
  @ApiParam({ name: "id", description: "Subscription ID" })
  @ApiResponse({ status: 200, description: "Subscription restarted successfully" })
  @ApiResponse({ status: 404, description: "Subscription not found" })
  async restartSubscription(@Param('id') id: string): Promise<{ message: string }> {
    await this.eventSubscriptionService.restartSubscription(id)
    return { message: `Subscription ${id} restarted successfully` }
  }

  @Post("create-default-subscriptions")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create default subscriptions for FreightFlow contracts" })
  @ApiResponse({ status: 201, description: "Default subscriptions created" })
  async createDefaultSubscriptions(): Promise<ContractSubscription[]> {
    const defaultSubscriptions: CreateSubscriptionDto[] = [
      {
        name: "FreightFlow Main Contract",
        contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        eventTypes: ["DELIVERY_CONFIRMED", "ESCROW_RELEASED", "SHIPMENT_CREATED"] as any,
        description: "Main FreightFlow contract for shipment and escrow events",
        maxRetries: 3,
        retryDelayMs: 5000,
      },
      {
        name: "FreightFlow Payment Contract",
        contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        eventTypes: ["PAYMENT_PROCESSED", "ESCROW_CREATED"] as any,
        description: "Payment processing contract for financial events",
        maxRetries: 5,
        retryDelayMs: 3000,
      },
      {
        name: "FreightFlow Dispute Contract",
        contractAddress: "0x0735596016a37ee972c42adef6a3cf628c19bb3794369c65d2c82ba034aecf2c",
        eventTypes: ["DISPUTE_RAISED", "DISPUTE_RESOLVED"] as any,
        description: "Dispute resolution contract for conflict management",
        maxRetries: 3,
        retryDelayMs: 10000,
      },
    ]

    const createdSubscriptions: ContractSubscription[] = []
    for (const subscriptionDto of defaultSubscriptions) {
      try {
        const subscription = await this.eventSubscriptionService.createSubscription(subscriptionDto)
        createdSubscriptions.push(subscription)
      } catch (error) {
        // Continue creating other subscriptions even if one fails
        console.error(`Failed to create subscription for ${subscriptionDto.name}:`, error)
      }
    }

    return createdSubscriptions
  }
}
