import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './providers/cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const result = await this.cloudinaryService.uploadImage(file);
    return { success: true, data: result };
  }

  @Delete('delete/:publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    const result = await this.cloudinaryService.deleteImage(publicId);
    return { success: true, data: result };
  }
}
