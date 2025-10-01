import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('carriers')
export class Carrier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. DHL, Maersk, Delta Airlines

  @Column()
  type: string; // trucking | airline | shipping

  @Column({ nullable: true })
  contactEmail?: string;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Shipment, (shipment) => shipment.carrier)
  shipments: Shipment[];
}
