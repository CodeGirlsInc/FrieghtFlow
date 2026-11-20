import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EtaService, ShipmentZone } from './eta.service';
import { EstimateEtaDto } from './dto/estimate-eta.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

/**
 * Response body for `POST /shipments/eta/estimate`.
 *
 * `originZone` / `destinationZone` expose the zones the service resolved
 * so a caller can see which lane was priced instead of trusting an
 * opaque number — a route that could not be placed is rejected outright
 * rather than estimated against a default zone.
 */
export class EtaEstimateResponseDto {
  @ApiProperty({ example: 4 })
  estimatedTransitDays: number;

  @ApiProperty({ example: '2026-03-02', description: 'UTC calendar date' })
  estimatedDeliveryDate: string;

  @ApiProperty({ enum: ShipmentZone, example: ShipmentZone.AF })
  originZone: ShipmentZone;

  @ApiProperty({ enum: ShipmentZone, example: ShipmentZone.AF })
  destinationZone: ShipmentZone;
}

@ApiTags('shipments')
@ApiBearerAuth()
@Controller('shipments/eta')
export class EtaController {
  constructor(private readonly etaService: EtaService) {}

  @Post('estimate')
  @ApiOperation({
    summary: 'Estimate transit time for a route',
    description:
      'Resolves each location to a shipping zone and returns the baseline ' +
      'transit days for that lane plus the estimated delivery date. ' +
      'Locations must carry a recognisable country or region (e.g. ' +
      '"Lagos, Nigeria"); unresolvable locations and unserved lanes are ' +
      'rejected with 400 rather than estimated against a default zone.',
  })
  @ApiResponse({
    status: 201,
    description: 'Transit estimate returned',
    type: EtaEstimateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input, unresolvable location, or unserved lane',
  })
  estimate(@CurrentUser() _user: User, @Body() dto: EstimateEtaDto) {
    return this.etaService.estimate(dto);
  }
}
