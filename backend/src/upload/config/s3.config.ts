import type { ConfigService } from "@nestjs/config"
import { S3Client } from "@aws-sdk/client-s3"
import * as multerS3 from "multer-s3"

export const s3Config = (configService: ConfigService) => {
  const s3 = new S3Client({
    region: configService.get("AWS_REGION"),
    credentials: {
      accessKeyId: configService.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: configService.get("AWS_SECRET_ACCESS_KEY"),
    },
  })

  return multerS3({
    s3: s3,
    bucket: configService.get("AWS_S3_BUCKET"),
    acl: "private",
    key: (req, file, cb) => {
      const { uploadType } = req.body
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      cb(null, `${uploadType}/${uniqueSuffix}-${file.originalname}`)
    },
  })
}
