import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Shipment } from 'src/shipment';

@Entity()
export class Emission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, { eager: true })
  shipment: Shipment;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column('float')
  distanceKm: number;

  @Column('float')
  weightKg: number;

  @Column('float')
  carbonKg: number;

  @CreateDateColumn()
  createdAt: Date;
}
