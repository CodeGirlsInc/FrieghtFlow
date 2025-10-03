import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Shipment, ShipmentStatus } from "./shipment.entity";

@Entity({ name: "shipment_status_history" })
export class ShipmentStatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "uuid" })
  shipmentId: string;

  @Column({ type: "enum", enum: ShipmentStatus })
  status: ShipmentStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  location?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @CreateDateColumn({ type: "timestamptz" })
  timestamp: Date;

  @ManyToOne(() => Shipment, (shipment) => shipment.statusHistory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shipmentId" })
  shipment: Shipment;
}
