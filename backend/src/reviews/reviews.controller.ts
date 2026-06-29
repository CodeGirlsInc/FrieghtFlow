import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('shipments')
@ApiBearerAuth()
@Controller('shipments')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':id/review')
  @ApiOperation({ summary: 'Leave a review for a completed shipment' })
  @ApiResponse({ status: 201, type: ReviewResponseDto })
  create(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(id, user, dto);
  }
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserRatingController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id/rating')
  @ApiOperation({ summary: 'Get average rating for a user' })
  getRating(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.getAverageRating(id);
  }
}
