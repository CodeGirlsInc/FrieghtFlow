import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import { TestSignAndSubmitPaymentDto } from './dto/test-sign-and-submit-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('shipments/:shipmentId/payment')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get payment/escrow status for a shipment',
    description:
      'Returns the escrow payment record if one exists for this shipment. Accessible to the shipper, carrier, and admin.',
  })
  @ApiOkResponse({ description: 'Payment record found', type: Payment })
  @ApiOperation({ summary: 'Get escrow status for a shipment' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.CARRIER, UserRole.ADMIN)
  getStatus(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.findByShipmentIdForUser(shipmentId, user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Build an unsigned funding transaction for an accepted shipment (shipper only)',
    description:
      'Returns unsigned XDR for the shipper wallet to sign client-side. Safe to call repeatedly while unfunded.',
  })
  @ApiForbiddenResponse({ description: "Not this shipment's shipper" })
  @ApiConflictResponse({ description: 'Already funded or funding in progress' })
  @ApiUnprocessableEntityResponse({
    description:
      'Missing wallet address, insufficient balance/allowance, or contract rejection',
  })
  initiate(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.initiateFunding(shipmentId, user.id);
  }

  @Post(':paymentId/submit')
  @ApiOperation({
    summary: 'Submit the shipper-signed funding transaction (shipper only)',
    description:
      "Accepts the XDR signed by the shipper's own wallet and submits it to the escrow contract.",
  })
  @ApiForbiddenResponse({ description: "Not this shipment's shipper" })
  @ApiConflictResponse({ description: 'Already funded or funding in progress' })
  @ApiUnprocessableEntityResponse({
    description: 'Submission rejected by the network or the escrow contract',
  })
  submit(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @CurrentUser() user: User,
    @Body() dto: SubmitPaymentDto,
  ) {
    return this.paymentsService.submitFunding(
      shipmentId,
      paymentId,
      user.id,
      dto.signedXdr,
    );
  }

  @Post(':paymentId/test-sign-and-submit')
  @ApiOperation({
    summary:
      'TEST ONLY — signs with a provided secret and submits (shipper only)',
    description:
      'Disabled unless ALLOW_TEST_SIGNING="true". Lets the funding flow be verified end-to-end on testnet before the frontend wallet-signing UI exists. Never use in production.',
  })
  testSignAndSubmit(
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @CurrentUser() user: User,
    @Body() dto: TestSignAndSubmitPaymentDto,
  ) {
    return this.paymentsService.testSignAndSubmitFunding(
      shipmentId,
      paymentId,
      user.id,
      dto.shipperSecret,
    );
  }
}
