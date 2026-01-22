# WebSocket Communication Module

## Overview

This module implements real-time communication for the FreightFlow application using WebSockets (Socket.io). It provides:

- Real-time chat between shippers and carriers
- Live shipment status updates
- Typing indicators
- Online/offline user status tracking
- Message persistence and history

## Features

✅ WebSocket gateway with Socket.io  
✅ JWT authentication for WebSocket connections  
✅ Room-based messaging (per freight job)  
✅ Message persistence to database  
✅ Message history endpoint with pagination  
✅ Typing indicators  
✅ Online/offline user status  
✅ Connection cleanup on disconnect  
✅ Rate limiting for messages (30 messages/minute)  
✅ XSS prevention (message sanitization)  
✅ Unit tests for services  
✅ Integration tests for WebSocket events  
✅ Comprehensive documentation  

## Module Structure

```
websocket/
├── controllers/
│   └── messages.controller.ts          # REST API endpoints
├── decorators/
│   └── user.decorator.ts                # WebSocket user decorator
├── dto/
│   ├── create-message.dto.ts           # Create message DTO
│   ├── join-room.dto.ts                # Join room DTO
│   ├── leave-room.dto.ts               # Leave room DTO
│   ├── message-history-query.dto.ts    # Pagination DTO
│   ├── message-response.dto.ts          # Message response DTO
│   ├── send-message.dto.ts             # Send message DTO
│   └── typing.dto.ts                   # Typing indicator DTO
├── entities/
│   ├── message.entity.ts                # Message entity
│   └── websocket-connection.entity.ts  # Connection entity
├── gateways/
│   ├── websocket.gateway.ts            # Main WebSocket gateway
│   └── websocket.gateway.spec.ts       # Gateway tests
├── guards/
│   ├── jwt-auth.guard.ts               # REST JWT guard
│   └── ws-jwt-auth.guard.ts            # WebSocket JWT guard
├── middleware/
│   └── ws-auth.middleware.ts           # WebSocket auth middleware
├── services/
│   ├── message.service.ts              # Message service
│   ├── message.service.spec.ts         # Message service tests
│   ├── websocket-connection.service.ts # Connection service
│   └── websocket-connection.service.spec.ts # Connection service tests
├── strategies/
│   └── jwt.strategy.ts                 # JWT strategy
├── websocket.module.ts                 # Module definition
├── README.md                           # This file
└── WEBSOCKET_DOCUMENTATION.md         # Detailed API documentation
```

## Quick Start

### 1. Environment Variables

Ensure these environment variables are set:

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=freightflow
FRONTEND_URL=http://localhost:3000
```

### 2. Database Tables

The module automatically creates these tables via TypeORM:

- `messages` - Stores chat messages
- `websocket_connections` - Tracks active WebSocket connections

### 3. WebSocket Connection

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:6000/ws', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join a room
socket.emit('join_room', {
  freightJobId: '123e4567-e89b-12d3-a456-426614174000'
});

// Send a message
socket.emit('send_message', {
  freightJobId: '123e4567-e89b-12d3-a456-426614174000',
  messageContent: 'Hello!'
});

// Listen for messages
socket.on('message', (data) => {
  console.log('New message:', data);
});
```

### 4. REST API

```bash
# Get message history
GET /api/v1/messages/freight-job/:jobId?page=1&limit=20

# Create a message
POST /api/v1/messages
{
  "freightJobId": "123e4567-e89b-12d3-a456-426614174000",
  "messageContent": "Hello!"
}
```

## WebSocket Events

### Client → Server

- `join_room` - Join a freight job chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a chat message
- `typing` - Send typing indicator

### Server → Client

- `message` - Receive chat message
- `status_update` - Receive shipment status change
- `user_joined` - User joined room
- `user_left` - User left room
- `typing_indicator` - Someone is typing
- `error` - Error occurred

See [WEBSOCKET_DOCUMENTATION.md](./WEBSOCKET_DOCUMENTATION.md) for detailed event documentation.

## Security Features

1. **JWT Authentication**: All connections require valid JWT tokens
2. **Rate Limiting**: 30 messages per minute per user
3. **XSS Prevention**: Message content is automatically sanitized
4. **Input Validation**: All payloads validated using class-validator
5. **Room Access Control**: Users can only access rooms for their freight jobs (to be implemented based on your business logic)

## Testing

Run unit tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:cov
```

## Future Enhancements

- [ ] Redis adapter for horizontal scaling
- [ ] Message encryption for sensitive data
- [ ] File attachments in messages
- [ ] Message reactions/emojis
- [ ] Read receipts
- [ ] Message search
- [ ] Push notifications for offline users

## Notes

- The module uses in-memory maps for tracking rooms and typing indicators. For production with multiple instances, consider using Redis.
- Room access verification is currently a placeholder. Implement based on your freight job access control logic.
- Connection cleanup runs automatically, but you may want to add a scheduled job for stale connection cleanup.

