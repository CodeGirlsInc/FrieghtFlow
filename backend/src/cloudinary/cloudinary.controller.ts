import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return { url: result.secure_url, public_id: result.public_id };
    } catch (error) {
      throw new BadRequestException('Image upload failed');
    }
  }

  @Delete('delete/:publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    try {
      const result = await this.cloudinaryService.deleteImage(publicId);
      return { result };
    } catch (error) {
      throw new BadRequestException('Image deletion failed');
    }
  }
}
