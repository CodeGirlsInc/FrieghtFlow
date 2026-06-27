import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { MarketplaceSearchService } from './marketplace-search.service';
import { MarketplaceSearchController } from './marketplace-search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment])],
  controllers: [MarketplaceSearchController],
  providers: [MarketplaceSearchService],
})
export class MarketplaceSearchModule {}
