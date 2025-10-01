import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FreightQuote } from './freight-quote.entity';

@Entity()
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  carrierId: number;

  @Column('decimal')
  price: number;

  @Column()
  details: string;

  @ManyToOne(() => FreightQuote, freightQuote => freightQuote.bids)
  freightQuote: FreightQuote;
}
