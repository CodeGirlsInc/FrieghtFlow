import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

export enum ShipmentStatus {
  CREATED = 'created',
  IN_TRANSIT = 'in-transit',
  ARRIVED = 'arrived',
  DELIVERED = 'delivered',
}

@Entity()
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shipperId: string;

  @Column()
  customerId: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.CREATED,
  })
  status: ShipmentStatus;

  @OneToMany(() => ShipmentStatusHistory, (history) => history.shipment, {
    cascade: true,
  })
  statusHistory: ShipmentStatusHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class ShipmentStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.statusHistory)
  @JoinColumn()
  shipment: Shipment;

  @Column({ type: 'enum', enum: ShipmentStatus })
  status: ShipmentStatus;

  @ManyToOne(() => Location)
  @JoinColumn()
  location: Location;

  @CreateDateColumn()
  timestamp: Date;
}
