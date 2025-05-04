export class InAppNotification {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    userId: string;
  
    @Column()
    type: string;
  
    @Column()
    message: string;
  
    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;
  
    @Column({ default: false })
    read: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

