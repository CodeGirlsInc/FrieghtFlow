import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { Partner } from './entities/partner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Partner])],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService],
})
export class PartnerModule {}
