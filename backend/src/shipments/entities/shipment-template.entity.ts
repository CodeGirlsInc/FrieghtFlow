import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Postgres `numeric` → JS `number` at the driver boundary.
 *
 * node-postgres returns `numeric` as a string to avoid silent precision loss,
 * so without this every template would expose `weightKg: "100.00"` — a string
 * where the declared type (and `CreateShipmentDto`) say number. Coercing in
 * the column transformer keeps the entity honest for every reader, including
 * ones that never pass through the service.
 */
export const decimalTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | null): number | null =>
    value === null || value === undefined ? null : Number(value),
};

/**
 * A saved, reusable shipment draft owned by a single user.
 *
 * Templates are per-user: the owning `userId` is the ownership boundary
 * enforced by `ShipmentTemplateService`, and the composite unique index
 * keeps one user's template names unambiguous.
 */
@Entity('shipment_templates')
@Unique('UQ_shipment_templates_user_id_name', ['userId', 'name'])
export class ShipmentTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  origin: string;

  @Column({ length: 255 })
  destination: string;

  @Column({ name: 'cargo_description', type: 'text' })
  cargoDescription: string;

  // `numeric` is returned by node-postgres as a *string* unless explicitly
  // transformed, so these are declared `number` for callers and coerced on
  // the way out by `ShipmentTemplateService` (`toResponse`).
  @Column({
    name: 'weight_kg',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  weightKg: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ default: 'USD', length: 3 })
  currency: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

/**
 * The shipment fields a template carries, with the template's own
 * bookkeeping (`id`, `userId`, `name`) stripped — i.e. exactly what a
 * client needs to pre-fill `POST /shipments`.
 */
export interface ShipmentTemplateDraft {
  origin: string;
  destination: string;
  cargoDescription: string;
  weightKg: number;
  price: number;
  currency: string;
}
