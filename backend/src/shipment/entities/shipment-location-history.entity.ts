import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity()
export class ShipmentLocationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shipment, shipment => shipment.locationHistory)
  shipment: Shipment;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @CreateDateColumn()
  timestamp: Date;
}
