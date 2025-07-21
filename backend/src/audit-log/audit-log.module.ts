import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuditLogService } from "./audit-log.service"
import { AuditLogController } from "./audit-log.controller"
import { AuditLog } from "./entities/audit-log.entity"
import { AuditInterceptor } from "./interceptors/audit.interceptor"

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditInterceptor],
  exports: [AuditLogService, AuditInterceptor],
})
export class AuditLogModule {}
