import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Shipment } from '../shipment/shipment.entity';

@Entity({ name: 'tracking_events' })
export class TrackingEvent {
  @ApiProperty({
    description: 'Tracking event unique identifier',
    format: 'uuid',
    example: 'a3f2a3a9-3f9f-4b42-9b87-9c8d0d5e2a1b',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Associated shipment ID',
    format: 'uuid',
    example: '5f8d04a5-2a2a-4c51-9c1b-0a8b3d0c1234',
  })
  @Index()
  @Column({ type: 'uuid' })
  shipmentId: string;

  @ManyToOne(() => Shipment, (shipment: Shipment) => shipment.trackingEvents, { onDelete: 'CASCADE' })
  shipment: Shipment;

  @ApiProperty({ description: 'Checkpoint location', example: 'Los Angeles Hub' })
  @Column({ type: 'varchar', length: 255 })
  location: string;

  @ApiProperty({ description: 'Status update message', example: 'In transit' })
  @Column({ type: 'varchar', length: 255 })
  statusUpdate: string;

  @ApiProperty({ description: 'Event timestamp (server-generated)', type: String, format: 'date-time' })
  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
