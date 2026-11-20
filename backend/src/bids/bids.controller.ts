import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('bids')
@ApiBearerAuth()
@Controller('shipments')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post(':shipmentId/bids')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER)
  @ApiOperation({ summary: 'Submit a bid on a shipment (carrier only)' })
  @ApiResponse({ status: 201, description: 'Bid submitted' })
  @ApiResponse({ status: 409, description: 'Duplicate pending bid' })
  submitBid(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateBidDto,
  ) {
    return this.bidsService.submitBid(shipmentId, user.id, dto);
  }

  @Get(':shipmentId/bids')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List bids for a shipment (shipment owner only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getBids(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bidsService.getBids(
      shipmentId,
      user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Patch(':shipmentId/bids/:bidId/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER)
  @ApiOperation({ summary: 'Accept a bid (shipment owner only)' })
  acceptBid(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
    @Param('bidId', ParseUUIDPipe) bidId: string,
    @CurrentUser() user: User,
  ) {
    return this.bidsService.acceptBid(shipmentId, bidId, user.id);
  }

  @Patch(':shipmentId/bids/:bidId/withdraw')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER)
  @ApiOperation({ summary: 'Withdraw a pending bid (bid owner only)' })
  @ApiResponse({ status: 200, description: 'Bid withdrawn' })
  @ApiResponse({ status: 400, description: 'Bid is not pending' })
  @ApiResponse({ status: 403, description: 'Not the bid owner' })
  withdrawBid(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
    @Param('bidId', ParseUUIDPipe) bidId: string,
    @CurrentUser() user: User,
  ) {
    return this.bidsService.withdrawBid(shipmentId, bidId, user.id);
  }
}
