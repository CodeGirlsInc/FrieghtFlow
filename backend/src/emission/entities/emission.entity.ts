import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Emission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  distanceKm: number;

  @Column()
  weightKg: number;

  @Column()
  carbonKg: number;

  @Column({ nullable: true })
  shipmentId: string;

  @Column()
  userId: string;
}