import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum CargoType {
  GENERAL = "general",
  HAZARDOUS = "hazardous",
  FRAGILE = "fragile",
  PERISHABLE = "perishable",
  OVERSIZED = "oversized",
  LIQUID = "liquid",
}

export enum QuoteStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

@Entity("freight_quotes")
@Index(["requesterId"])
@Index(["status"])
@Index(["createdAt"])
export class FreightQuote {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "requester_id" })
  @Index()
  requesterId: string

  @Column({
    type: "enum",
    enum: CargoType,
    name: "cargo_type",
  })
  cargoType: CargoType

  @Column("decimal", { precision: 10, scale: 2 })
  weight: number

  @Column({ length: 255 })
  origin: string

  @Column({ length: 255 })
  destination: string

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  price: number

  @Column({
    type: "enum",
    enum: QuoteStatus,
    default: QuoteStatus.PENDING,
  })
  status: QuoteStatus

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  distance: number

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ name: "expires_at", type: "timestamp", nullable: true })
  expiresAt: Date

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
