import type { ConfigService } from "@nestjs/config"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

export const cloudinaryConfig = (configService: ConfigService) => {
  cloudinary.config({
    cloud_name: configService.get("CLOUDINARY_CLOUD_NAME"),
    api_key: configService.get("CLOUDINARY_API_KEY"),
    api_secret: configService.get("CLOUDINARY_API_SECRET"),
  })

  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "uploads",
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    } as any,
  })
}
