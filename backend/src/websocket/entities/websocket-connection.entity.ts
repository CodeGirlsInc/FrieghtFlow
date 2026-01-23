import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('websocket_connections')
@Index(['user_id'])
@Index(['socket_id'])
export class WebSocketConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255, name: 'socket_id', unique: true })
  socketId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'connected_at' })
  connectedAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'last_heartbeat' })
  lastHeartbeat: Date;
}

