import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationPayload } from '../interfaces/notification-payload.interface';

@WebSocketGateway({ namespace: '/notifications' })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private userSockets = new Map<string, string[]>();

  handleConnection(client: Socket): void {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;

    const existingSockets = this.userSockets.get(userId) || [];
    this.userSockets.set(userId, [...existingSockets, client.id]);
    
    console.log(`Client connected: ${client.id} for user: ${userId}`);
  }

  handleDisconnect(client: Socket): void {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;

    const existingSockets = this.userSockets.get(userId) || [];
    this.userSockets.set(
      userId,
      existingSockets.filter(id => id !== client.id)
    );
    
    console.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent('notification.send')
  handleNotificationEvent(payload: NotificationPayload): void {
    const { userId } = payload;
    const userSocketIds = this.userSockets.get(userId) || [];
    
    userSocketIds.forEach(socketId => {
      this.server.to(socketId).emit('notification', payload);
    });
  }
}