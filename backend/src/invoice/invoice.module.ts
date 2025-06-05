import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { InvoiceController } from "./invoice.controller"
import { InvoiceService } from "./invoice.service"
import { PdfGeneratorService } from "./services/pdf-generator.service"
import { EmailService } from "./services/email.service"
import { InvoiceTemplateService } from "./services/invoice-template.service"
import { InvoiceConfigService } from "./config/invoice-config.service"
import { Invoice } from "./entities/invoice.entity"
import { InvoiceItem } from "./entities/invoice-item.entity"
import { InvoiceRepository } from "./repositories/invoice.repository"
import { InvoiceItemRepository } from "./repositories/invoice-item.repository"

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Invoice, InvoiceItem])],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    PdfGeneratorService,
    EmailService,
    InvoiceTemplateService,
    InvoiceConfigService,
    InvoiceRepository,
    InvoiceItemRepository,
  ],
  exports: [InvoiceService, PdfGeneratorService],
})
export class InvoiceModule {}
