import { IsString, IsNotEmpty, IsOptional } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class ScanQRRequestDto {
  @ApiProperty({ description: "QR code to scan", example: "QR_abc123def456" })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiPropertyOptional({ description: "Scanner identifier", example: "scanner-001" })
  @IsOptional()
  @IsString()
  scannedBy?: string

  @ApiPropertyOptional({ description: "Scan location", example: "Warehouse A - Gate 3" })
  @IsOptional()
  @IsString()
  scannedLocation?: string

  @ApiPropertyOptional({ description: "IP address of scanner", example: "192.168.1.100" })
  @IsOptional()
  @IsString()
  ipAddress?: string

  @ApiPropertyOptional({ description: "User agent of scanning device", example: "Mobile Scanner App v1.2" })
  @IsOptional()
  @IsString()
  userAgent?: string
}
