import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Shipment } from '../shipment.entity';

@Entity()
export class ShipmentLocationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shipment, (shipment: Shipment) => shipment.locationHistory)
  shipment: Shipment;


  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column('float', { nullable: true })
  accuracy?: number;

  @Column('float', { nullable: true })
  speed?: number;

  @Column('float', { nullable: true })
  heading?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source?: string;

  @CreateDateColumn()
  timestamp: Date;
}
