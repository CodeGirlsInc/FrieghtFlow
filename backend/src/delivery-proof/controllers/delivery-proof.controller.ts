import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common"
import type { DeliveryProofService } from "../services/delivery-proof.service"
import type { CreateDeliveryProofDto } from "../dto/create-delivery-proof.dto"
import type { UpdateDeliveryProofDto } from "../dto/update-delivery-proof.dto"
import type { QueryDeliveryProofDto } from "../dto/query-delivery-proof.dto"
import type { DeliveryProof } from "../entities/delivery-proof.entity"

@Controller("delivery-proofs")
export class DeliveryProofController {
  constructor(private readonly deliveryProofService: DeliveryProofService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(createDeliveryProofDto: CreateDeliveryProofDto): Promise<DeliveryProof> {
    return this.deliveryProofService.create(createDeliveryProofDto)
  }

  @Get()
  async findAll(
    @Query() queryDto: QueryDeliveryProofDto,
  ): Promise<{ data: DeliveryProof[]; total: number }> {
    return this.deliveryProofService.findAll(queryDto);
  }

  @Get("statistics")
  async getStatistics(): Promise<any> {
    return this.deliveryProofService.getStatistics()
  }

  @Get('delivery/:deliveryId')
  async findByDeliveryId(
    @Param('deliveryId') deliveryId: string,
  ): Promise<DeliveryProof[]> {
    return this.deliveryProofService.findByDeliveryId(deliveryId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeliveryProof> {
    return this.deliveryProofService.findOne(id);
  }

  @Patch(":id")
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeliveryProofDto: UpdateDeliveryProofDto,
  ): Promise<DeliveryProof> {
    return this.deliveryProofService.update(id, updateDeliveryProofDto)
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeliveryProof> {
    return this.deliveryProofService.verifyProof(id);
  }

  @Post(":id/fail")
  @HttpCode(HttpStatus.OK)
  async markAsFailed(@Param('id', ParseUUIDPipe) id: string, @Body('error') error: string): Promise<DeliveryProof> {
    return this.deliveryProofService.markAsFailed(id, error)
  }

  @Patch(":id/blockchain")
  async updateBlockchainInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('txHash') txHash: string,
    @Body('blockNumber') blockNumber: string,
  ): Promise<DeliveryProof> {
    return this.deliveryProofService.updateBlockchainInfo(id, txHash, blockNumber)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deliveryProofService.delete(id);
  }
}
