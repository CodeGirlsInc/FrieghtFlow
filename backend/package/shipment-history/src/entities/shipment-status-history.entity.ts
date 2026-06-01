import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'shipment_status_history' })
export class ShipmentStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shipmentId: string;

  @Column({ nullable: true })
  fromStatus: string;

  @Column()
  toStatus: string;

  @Column({ nullable: true })
  actorId: string;

  @Column({ nullable: true })
  actorRole: string;

  @CreateDateColumn()
  createdAt: Date;
}
