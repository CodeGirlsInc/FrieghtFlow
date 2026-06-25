import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
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
@Controller('shipments/:id/bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER)
  @ApiOperation({ summary: 'Carrier submits a bid on a shipment' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({ status: 201, description: 'Bid submitted' })
  submitBid(
    @Param('id', ParseUUIDPipe) shipmentId: string,
    @CurrentUser() carrier: User,
    @Body() dto: CreateBidDto,
  ) {
    return this.bidsService.submitBid(shipmentId, carrier.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Shipper views all bids on their shipment' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  getBids(
    @Param('id', ParseUUIDPipe) shipmentId: string,
    @CurrentUser() user: User,
  ) {
    return this.bidsService.getBids(shipmentId, user.id);
  }

  @Patch(':bidId/accept')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER)
  @ApiOperation({ summary: 'Shipper accepts a bid — assigns carrier, rejects others' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiParam({ name: 'bidId', description: 'Bid ID' })
  acceptBid(
    @Param('id', ParseUUIDPipe) shipmentId: string,
    @Param('bidId', ParseUUIDPipe) bidId: string,
    @CurrentUser() user: User,
  ) {
    return this.bidsService.acceptBid(shipmentId, bidId, user.id);
  }
}
