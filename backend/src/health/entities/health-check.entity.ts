import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

export enum HealthStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
}

export enum ServiceType {
  DATABASE = "database",
  REDIS = "redis",
  EMAIL = "email",
  EXTERNAL_API = "external_api",
  STORAGE = "storage",
  QUEUE = "queue",
  WEBHOOK = "webhook",
}

@Entity("health_checks")
@Index(["serviceName", "createdAt"])
@Index(["status"])
@Index(["serviceType"])
export class HealthCheck {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "service_name", length: 100 })
  @Index()
  serviceName: string

  @Column({
    name: "service_type",
    type: "enum",
    enum: ServiceType,
  })
  serviceType: ServiceType

  @Column({
    type: "enum",
    enum: HealthStatus,
  })
  status: HealthStatus

  @Column({ name: "response_time", type: "integer" })
  responseTime: number

  @Column({ type: "jsonb", nullable: true })
  details?: Record<string, any>

  @Column({ name: "error_message", type: "text", nullable: true })
  errorMessage?: string

  @Column({ name: "checked_at" })
  checkedAt: Date

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}
