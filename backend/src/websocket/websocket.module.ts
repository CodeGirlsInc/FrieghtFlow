import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { WebSocketGateway } from './gateways/websocket.gateway';
import { MessageService } from './services/message.service';
import { WebSocketConnectionService } from './services/websocket-connection.service';
import { MessagesController } from './controllers/messages.controller';
import { Message } from './entities/message.entity';
import { WebSocketConnection } from './entities/websocket-connection.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, WebSocketConnection]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1d',
        },
      }) as any,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
  ],
  controllers: [MessagesController],
  providers: [
    WebSocketGateway,
    MessageService,
    WebSocketConnectionService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [WebSocketGateway, MessageService],
})
export class WebSocketModule {}

