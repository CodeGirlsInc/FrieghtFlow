import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

@Entity("logs")
@Index(["level", "timestamp"])
@Index(["userId", "timestamp"])
@Index(["requestId"])
@Index(["traceId"])
@Index(["module", "component"])
export class LogEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 10 })
  @Index()
  level: string

  @Column({ type: "text" })
  message: string

  @Column({ type: "jsonb", nullable: true })
  context: Record<string, any>

  @Column({ type: "text", nullable: true })
  error: string

  @CreateDateColumn()
  @Index()
  timestamp: Date

  @Column({ type: "varchar", length: 255, nullable: true })
  @Index()
  userId: string

  @Column({ type: "varchar", length: 255, nullable: true })
  sessionId: string

  @Column({ type: "varchar", length: 255, nullable: true })
  @Index()
  requestId: string

  @Column({ type: "varchar", length: 255, nullable: true })
  @Index()
  traceId: string

  @Column({ type: "varchar", length: 255, nullable: true })
  spanId: string

  @Column({ type: "varchar", length: 100, nullable: true })
  @Index()
  module: string

  @Column({ type: "varchar", length: 100, nullable: true })
  component: string

  @Column({ type: "integer", nullable: true })
  duration: number

  @Column({ type: "simple-array", nullable: true })
  tags: string[]

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "varchar", length: 50 })
  @Index()
  environment: string

  @Column({ type: "varchar", length: 50 })
  version: string

  @Column({ type: "varchar", length: 255 })
  hostname: string

  @Column({ type: "integer" })
  processId: number

  @Column({ type: "varchar", length: 100, nullable: true })
  threadId: string

  @Column({ type: "bigint", nullable: true })
  memoryUsage: number

  @Column({ type: "float", nullable: true })
  cpuUsage: number

  @Column({ type: "boolean", default: false })
  @Index()
  archived: boolean

  @Column({ type: "timestamp", nullable: true })
  archivedAt: Date
}
