import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { Address } from '../addresses/entities/address.entity';
import { Shipment } from '../shipments/entities/shipment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address, Shipment]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
