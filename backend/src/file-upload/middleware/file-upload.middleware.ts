import { Injectable, type NestMiddleware, BadRequestException } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"
import * as multer from "multer"
import { UPLOAD_CONFIG } from "../config/upload.config"

@Injectable()
export class FileUploadMiddleware implements NestMiddleware {
  private upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
      files: 5, // Maximum 5 files per request
    },
    fileFilter: (req, file, callback) => {
      // Additional security checks
      if (!file.originalname) {
        return callback(new Error("File must have a name"), false)
      }

      // Check for potentially dangerous file names
      if (this.isDangerousFileName(file.originalname)) {
        return callback(new Error("File name contains invalid characters"), false)
      }

      // MIME type validation
      if (!UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return callback(new Error(`File type ${file.mimetype} not allowed`), false)
      }

      callback(null, true)
    },
  }).single("file")

  use(req: Request, res: Response, next: NextFunction) {
    this.upload(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          throw new BadRequestException(
            `File too large. Maximum size is ${this.formatFileSize(UPLOAD_CONFIG.MAX_FILE_SIZE)}`,
          )
        }
        if (error.code === "LIMIT_FILE_COUNT") {
          throw new BadRequestException("Too many files")
        }
        throw new BadRequestException(`Upload error: ${error.message}`)
      } else if (error) {
        throw new BadRequestException(error.message)
      }
      next()
    })
  }

  private isDangerousFileName(filename: string): boolean {
    // Check for path traversal attempts
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return true
    }

    // Check for executable extensions
    const dangerousExtensions = [".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js"]
    const extension = filename.toLowerCase().substring(filename.lastIndexOf("."))

    return dangerousExtensions.includes(extension)
  }

  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }
}
