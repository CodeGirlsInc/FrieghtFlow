import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import {
  SHIPMENT_ACCEPTED,
  SHIPMENT_IN_TRANSIT,
  SHIPMENT_DELIVERED,
  SHIPMENT_COMPLETED,
  SHIPMENT_CANCELLED,
  SHIPMENT_DISPUTED,
  SHIPMENT_DISPUTE_RESOLVED,
  SHIPMENT_CREATED,
  ShipmentEvent,
} from '../shipments/events/shipment.events';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

/** Room prefix for per-user rooms */
const userRoom = (userId: string) => `user:${userId}`;

@WebSocketGateway({
  cors: {
    origin: (origin: string, cb: (err: Error | null, allow: boolean) => void) => {
      // Allow same-origin and configured frontend URL
      cb(null, true);
    },
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialised');
  }

  // ── Connection lifecycle ────────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ||
        (client.handshake.headers?.authorization as string | undefined);

      if (!token) {
        this.disconnect(client, 'No token provided');
        return;
      }

      const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
      const secret = this.configService.get<string>('JWT_SECRET')!;

      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify<JwtPayload>(raw, { secret });
      } catch {
        this.disconnect(client, 'Invalid or expired token');
        return;
      }

      // Store userId on the socket for later use
      (client.data as { userId: string }).userId = payload.sub;

      // Join the user's personal room
      await client.join(userRoom(payload.sub));
      this.logger.debug(`Client ${client.id} joined room ${userRoom(payload.sub)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.disconnect(client, msg);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client.data as { userId?: string }).userId;
    this.logger.debug(`Client ${client.id} disconnected${userId ? ` (user: ${userId})` : ''}`);
  }

  private disconnect(client: Socket, reason: string) {
    this.logger.warn(`Disconnecting client ${client.id}: ${reason}`);
    client.emit('error', { message: reason });
    client.disconnect(true);
  }

  // ── Emit helper ─────────────────────────────────────────────────────────────

  private emitToUser(
    userId: string,
    event: string,
    payload: Record<string, unknown>,
  ) {
    this.server.to(userRoom(userId)).emit(event, payload);
  }

  private buildPayload(
    eventName: string,
    { shipment }: ShipmentEvent,
  ): Record<string, unknown> {
    return {
      event: eventName,
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      origin: shipment.origin,
      destination: shipment.destination,
      updatedAt: new Date().toISOString(),
    };
  }

  // ── Domain event → WebSocket emit ───────────────────────────────────────────

  @OnEvent(SHIPMENT_CREATED)
  onCreated(evt: ShipmentEvent) {
    const payload = this.buildPayload('shipment:created', evt);
    this.emitToUser(evt.shipment.shipperId, 'shipment:updated', payload);
  }

  @OnEvent(SHIPMENT_ACCEPTED)
  onAccepted(evt: ShipmentEvent) {
    const payload = this.buildPayload('shipment:accepted', evt);
    this.emitToUser(evt.shipment.shipperId, 'shipment:updated', payload);
    if (evt.shipment.carrierId) {
      this.emitToUser(evt.shipment.carrierId, 'shipment:updated', payload);
    }
  }

  @OnEvent(SHIPMENT_IN_TRANSIT)
  onInTransit(evt: ShipmentEvent) {
    const payload = this.buildPayload('shipment:in_transit', evt);
    this.emitToUser(evt.shipment.shipperId, 'shipment:updated', payload);
    if (evt.shipment.carrierId) {
      this.emitToUser(evt.shipment.carrierId, 'shipment:updated', payload);
    }
  }

  @OnEvent(SHIPMENT_DELIVERED)
  onDelivered(evt: ShipmentEvent) {
    const payload = this.buildPayload('shipment:delivered', evt);
    this.emitToUser(evt.shipment.shipperId, 'shipment:updated', payload);
    if (evt.shipment.carrierId) {
      this.emitToUser(evt.shipment.carrierId, 'shipment:updated', payload);
    }
  }

  @OnEvent(SHIPMENT_COMPLETED)
  onCompleted(evt: ShipmentEvent) {
    const payload = this.buildPayload('shipment:completed', evt);
    this.emitToUser(evt.shipment.shipperId, 'shipment:updated', payload);
    if (evt.shipment.carrierId) {
      this.emitToUser(evt.shipment.carrierId, 'shipment:updated', payload);
    }
  }

  @OnEvent(SHIPMENT_CANCELLED)
  onCancelled(evt: ShipmentEvent) {
    const payload = this.buildPayload('shipment:cancelled', evt);
    this.emitToUser(evt.shipment.shipperId, 'shipment:updated', payload);
    if (evt.shipment.carrierId) {
      this.emitToUser(evt.shipment.carrierId, 'shipment:updated', payload);
    }
  }

  @OnEvent(SHIPMENT_DISPUTED)
  onDisputed(evt: ShipmentEvent) {
    const payload = this.buildPayload('shipment:disputed', evt);
    this.emitToUser(evt.shipment.shipperId, 'shipment:updated', payload);
    if (evt.shipment.carrierId) {
      this.emitToUser(evt.shipment.carrierId, 'shipment:updated', payload);
    }
  }

  @OnEvent(SHIPMENT_DISPUTE_RESOLVED)
  onDisputeResolved(evt: ShipmentEvent) {
    const payload = this.buildPayload('shipment:dispute_resolved', evt);
    this.emitToUser(evt.shipment.shipperId, 'shipment:updated', payload);
    if (evt.shipment.carrierId) {
      this.emitToUser(evt.shipment.carrierId, 'shipment:updated', payload);
    }
  }
}
