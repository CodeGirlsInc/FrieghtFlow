import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"
import type { ConfigService } from "@nestjs/config"
import { diskStorage } from "multer"
import { extname, join } from "path"
import { existsSync, mkdirSync } from "fs"
import { BadRequestException } from "@nestjs/common"

export const multerConfig = (configService: ConfigService): MulterOptions => {
  const uploadPath = configService.get("UPLOAD_PATH", "./uploads")

  // Ensure upload directory exists
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true })
  }

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const { uploadType } = req.body
        let subDir = "general"

        switch (uploadType) {
          case "proof":
            subDir = "proofs"
            break
          case "kyc":
            subDir = "kyc-documents"
            break
          case "shipment":
            subDir = "shipment-photos"
            break
          case "id":
            subDir = "id-documents"
            break
        }

        const fullPath = join(uploadPath, subDir)
        if (!existsSync(fullPath)) {
          mkdirSync(fullPath, { recursive: true })
        }

        cb(null, fullPath)
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const ext = extname(file.originalname)
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new BadRequestException("Invalid file type. Only JPEG, PNG, and PDF files are allowed."), false)
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5, // Maximum 5 files per request
    },
  }
}
