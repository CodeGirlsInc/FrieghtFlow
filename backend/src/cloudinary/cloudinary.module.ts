import { Module } from '@nestjs/common';
import { CloudinaryService } from './providers/cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryImage } from './cloudinary.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CloudinaryImage, User])],
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
