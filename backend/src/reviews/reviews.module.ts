import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController, UserRatingController } from './reviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Shipment])],
  controllers: [ReviewsController, UserRatingController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
