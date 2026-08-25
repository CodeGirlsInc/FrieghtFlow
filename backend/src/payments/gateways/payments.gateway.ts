import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'payments',
})
export class PaymentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PaymentsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to payments WS: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from payments WS: ${client.id}`);
  }

  emitPaymentEvent(eventType: string, payload: any) {
    const channel = `payment.${eventType}`;
    this.logger.log(`Emitting WS event ${channel}: ${JSON.stringify(payload)}`);
    if (this.server) {
      this.server.emit(channel, payload);
    }
  }
}
