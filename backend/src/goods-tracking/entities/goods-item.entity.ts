import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Warehouse } from "../../warehouse/entities/warehouse.entity";
import { Shipment } from "../../shipment/shipment.entity";

export enum GoodsStatus {
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  PENDING = "pending",
  IN_STORAGE = "in_storage",
}

@Entity("goods_items")
export class GoodsItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, length: 100 })
  uniqueIdentifier: string;

  @Column("int")
  quantity: number;

  @Column({ type: "enum", enum: GoodsStatus, default: GoodsStatus.PENDING })
  status: GoodsStatus;

  @Column({ length: 255, nullable: true })
  description: string;

  @ManyToOne(() => Warehouse, { nullable: true })
  warehouse: Warehouse;

  @ManyToOne(() => Shipment, { nullable: true })
  shipment: Shipment;

  @CreateDateColumn()
  createdAt: Date;
}
