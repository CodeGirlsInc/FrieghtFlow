import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessageService } from '../services/message.service';
import { WebSocketConnectionService } from '../services/websocket-connection.service';
import { WsJwtAuthGuard } from '../guards/ws-jwt-auth.guard';
import { WsUser } from '../decorators/user.decorator';
import { JoinRoomDto } from '../dto/join-room.dto';
import { LeaveRoomDto } from '../dto/leave-room.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { TypingDto } from '../dto/typing.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      sub: string;
      email?: string;
      [key: string]: any;
    };
  };
}

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/ws',
})
@UseGuards(ThrottlerGuard)
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private readonly userRooms = new Map<string, Set<string>>(); // userId -> Set of roomIds
  private readonly typingUsers = new Map<string, Map<string, NodeJS.Timeout>>(); // roomId -> Map<userId, timeout>
  private readonly messageRateLimits = new Map<string, number[]>(); // userId -> timestamps

  constructor(
    private readonly messageService: MessageService,
    private readonly connectionService: WebSocketConnectionService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    // Apply authentication middleware
    server.use(async (socket: Socket, next) => {
      try {
        const token = this.extractToken(socket);

        if (!token) {
          return next(new Error('No token provided'));
        }

        const secret = this.configService.get<string>('JWT_SECRET') || 'secret';
        const payload = await this.jwtService.verifyAsync(token, { secret });
        socket.data.user = payload;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    this.logger.log('WebSocket Gateway initialized with authentication middleware');
  }

  private extractToken(socket: Socket): string | undefined {
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const token = socket.handshake.query.token as string;
    if (token) {
      return token;
    }

    return undefined;
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Authentication is handled by middleware
      const userId = client.data.user?.sub;
      if (!userId) {
        this.logger.warn(`Connection rejected: No user data`);
        client.disconnect();
        return;
      }

      // Store connection in database
      await this.connectionService.createConnection(userId, client.id);
      this.userRooms.set(userId, new Set());

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    try {
      const userId = client.data.user?.sub;
      if (!userId) {
        return;
      }

      // Leave all rooms
      const rooms = this.userRooms.get(userId);
      if (rooms) {
        rooms.forEach((freightJobId) => {
          const roomId = `freight-job:${freightJobId}`;
          client.leave(roomId);
          
          // Clear typing indicator
          this.clearTypingIndicator(freightJobId, userId);
          
          // Notify others in the room
          client.to(roomId).emit('user_left', {
            userId,
            freightJobId,
            timestamp: new Date(),
          });
        });
        this.userRooms.delete(userId);
      }

      // Remove connection from database
      await this.connectionService.removeConnection(client.id);

      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Disconnect error: ${error.message}`, error.stack);
    }
  }

  @SubscribeMessage('join_room')
  @UseGuards(WsJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() joinRoomDto: JoinRoomDto,
    @WsUser() user: any,
  ) {
    const userId = user.sub;
    const roomId = `freight-job:${joinRoomDto.freightJobId}`;

    // Verify user has access to this freight job (you should implement this check)
    // For now, we'll allow joining any room

    client.join(roomId);

    // Track user's rooms
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(joinRoomDto.freightJobId);

    // Notify others in the room
    client.to(roomId).emit('user_joined', {
      userId,
      freightJobId: joinRoomDto.freightJobId,
      timestamp: new Date(),
    });

    this.logger.log(`User ${userId} joined room ${roomId}`);
  }

  @SubscribeMessage('leave_room')
  @UseGuards(WsJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() leaveRoomDto: LeaveRoomDto,
    @WsUser() user: any,
  ) {
    const userId = user.sub;
    const roomId = `freight-job:${leaveRoomDto.freightJobId}`;

    client.leave(roomId);

    // Remove from tracking
    const rooms = this.userRooms.get(userId);
    if (rooms) {
      rooms.delete(leaveRoomDto.freightJobId);
    }

    // Clear typing indicator
    this.clearTypingIndicator(leaveRoomDto.freightJobId, userId);

    // Notify others in the room
    client.to(roomId).emit('user_left', {
      userId,
      freightJobId: leaveRoomDto.freightJobId,
      timestamp: new Date(),
    });

    this.logger.log(`User ${userId} left room ${roomId}`);
  }

  @SubscribeMessage('send_message')
  @UseGuards(WsJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() sendMessageDto: SendMessageDto,
    @WsUser() user: any,
  ) {
    const userId = user.sub;

    // Rate limiting check
    if (!this.checkRateLimit(userId)) {
      client.emit('error', {
        message: 'Rate limit exceeded. Please wait before sending another message.',
      });
      return;
    }

    try {
      // Save message to database
      const message = await this.messageService.createMessage(
        {
          freightJobId: sendMessageDto.freightJobId,
          messageContent: sendMessageDto.messageContent,
        },
        userId,
      );

      const roomId = `freight-job:${sendMessageDto.freightJobId}`;

      // Broadcast message to room
      this.server.to(roomId).emit('message', {
        id: message.id,
        freightJobId: message.freightJobId,
        senderId: message.senderId,
        messageContent: message.messageContent,
        sentAt: message.sentAt,
      });

      // Clear typing indicator
      this.clearTypingIndicator(sendMessageDto.freightJobId, userId);

      this.logger.log(
        `Message sent by ${userId} in room ${sendMessageDto.freightJobId}`,
      );
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      client.emit('error', {
        message: 'Failed to send message. Please try again.',
      });
    }
  }

  @SubscribeMessage('typing')
  @UseGuards(WsJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() typingDto: TypingDto,
    @WsUser() user: any,
  ) {
    const userId = user.sub;
    const roomId = `freight-job:${typingDto.freightJobId}`;

    if (typingDto.isTyping) {
      // Clear existing timeout
      this.clearTypingIndicator(typingDto.freightJobId, userId);

      // Set new timeout (3 seconds)
      const timeout = setTimeout(() => {
        this.clearTypingIndicator(typingDto.freightJobId, userId);
        client.to(roomId).emit('typing_indicator', {
          userId,
          freightJobId: typingDto.freightJobId,
          isTyping: false,
        });
      }, 3000);

      if (!this.typingUsers.has(typingDto.freightJobId)) {
        this.typingUsers.set(typingDto.freightJobId, new Map());
      }
      this.typingUsers.get(typingDto.freightJobId)!.set(userId, timeout);

      // Broadcast typing indicator
      client.to(roomId).emit('typing_indicator', {
        userId,
        freightJobId: typingDto.freightJobId,
        isTyping: true,
      });
    } else {
      this.clearTypingIndicator(typingDto.freightJobId, userId);
      client.to(roomId).emit('typing_indicator', {
        userId,
        freightJobId: typingDto.freightJobId,
        isTyping: false,
      });
    }
  }

  // Method to broadcast shipment status updates
  broadcastStatusUpdate(freightJobId: string, status: any) {
    const roomId = `freight-job:${freightJobId}`;
    this.server.to(roomId).emit('status_update', {
      freightJobId,
      status,
      timestamp: new Date(),
    });
  }

  private clearTypingIndicator(freightJobId: string, userId: string) {
    const roomTyping = this.typingUsers.get(freightJobId);
    if (roomTyping) {
      const timeout = roomTyping.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        roomTyping.delete(userId);
      }
    }
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxMessages = 30; // 30 messages per minute

    if (!this.messageRateLimits.has(userId)) {
      this.messageRateLimits.set(userId, []);
    }

    const timestamps = this.messageRateLimits.get(userId)!;
    const recentTimestamps = timestamps.filter(
      (ts) => now - ts < windowMs,
    );

    if (recentTimestamps.length >= maxMessages) {
      return false;
    }

    recentTimestamps.push(now);
    this.messageRateLimits.set(userId, recentTimestamps);

    return true;
  }
}

