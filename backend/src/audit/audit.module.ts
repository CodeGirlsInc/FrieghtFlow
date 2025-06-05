import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { AuditController } from "./audit.controller"
import { AuditService } from "./audit.service"
import { AuditConfigService } from "./config/audit-config.service"
import { AuditLog } from "./entities/audit-log.entity"
import { AuditLogRepository } from "./repositories/audit-log.repository"
import { AuditInterceptor } from "./interceptors/audit.interceptor"
import { APP_INTERCEPTOR } from "@nestjs/core"

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditConfigService,
    AuditLogRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService, AuditConfigService],
})
export class AuditModule {}
