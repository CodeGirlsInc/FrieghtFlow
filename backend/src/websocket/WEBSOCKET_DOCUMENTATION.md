# WebSocket Communication Module Documentation

## Overview

The WebSocket module provides real-time communication capabilities for the FreightFlow application, enabling:
- Real-time chat between shippers and carriers
- Live shipment status updates
- Typing indicators
- Online/offline user status

## Connection

### Endpoint
```
ws://localhost:6000/ws
```

### Authentication

WebSocket connections require JWT authentication. The token can be provided in two ways:

1. **Authorization Header** (Recommended):
   ```
   Authorization: Bearer <your-jwt-token>
   ```

2. **Query Parameter**:
   ```
   ws://localhost:6000/ws?token=<your-jwt-token>
   ```

### Connection Example (Client-side)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:6000/ws', {
  auth: {
    token: 'your-jwt-token'
  },
  // Or use query parameter:
  // query: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});
```

## Client → Server Events

### `join_room`

Join a freight job chat room to receive messages and updates for a specific freight job.

**Payload:**
```typescript
{
  freightJobId: string; // UUID of the freight job
}
```

**Example:**
```typescript
socket.emit('join_room', {
  freightJobId: '123e4567-e89b-12d3-a456-426614174000'
});
```

**Response Events:**
- `user_joined` - Broadcasted to other users in the room

**Error Handling:**
- If the user doesn't have access to the freight job, the connection may be rejected
- Invalid payload will result in validation error

---

### `leave_room`

Leave a freight job chat room.

**Payload:**
```typescript
{
  freightJobId: string; // UUID of the freight job
}
```

**Example:**
```typescript
socket.emit('leave_room', {
  freightJobId: '123e4567-e89b-12d3-a456-426614174000'
});
```

**Response Events:**
- `user_left` - Broadcasted to other users in the room

---

### `send_message`

Send a chat message to a freight job room.

**Payload:**
```typescript
{
  freightJobId: string; // UUID of the freight job
  messageContent: string; // Message text (max 5000 characters)
}
```

**Example:**
```typescript
socket.emit('send_message', {
  freightJobId: '123e4567-e89b-12d3-a456-426614174000',
  messageContent: 'Hello, when will the shipment arrive?'
});
```

**Response Events:**
- `message` - Broadcasted to all users in the room (including sender)
- `error` - If rate limit exceeded or validation fails

**Rate Limiting:**
- Maximum 30 messages per minute per user
- Exceeding the limit will result in an error event

**Security:**
- Message content is automatically sanitized to prevent XSS attacks
- Script tags and dangerous HTML are removed

---

### `typing`

Send typing indicator to other users in the room.

**Payload:**
```typescript
{
  freightJobId: string; // UUID of the freight job
  isTyping: boolean; // true when typing, false when stopped
}
```

**Example:**
```typescript
// Start typing
socket.emit('typing', {
  freightJobId: '123e4567-e89b-12d3-a456-426614174000',
  isTyping: true
});

// Stop typing (or automatically after 3 seconds)
socket.emit('typing', {
  freightJobId: '123e4567-e89b-12d3-a456-426614174000',
  isTyping: false
});
```

**Response Events:**
- `typing_indicator` - Broadcasted to other users in the room

**Note:**
- Typing indicator automatically clears after 3 seconds of inactivity
- Only other users in the room receive the typing indicator (not the sender)

---

## Server → Client Events

### `message`

Received when a new message is sent to a room you're in.

**Payload:**
```typescript
{
  id: string; // Message UUID
  freightJobId: string; // UUID of the freight job
  senderId: string; // UUID of the message sender
  messageContent: string; // Message text
  sentAt: Date; // Timestamp when message was sent
}
```

**Example Handler:**
```typescript
socket.on('message', (data) => {
  console.log('New message:', data);
  // Update UI with new message
});
```

---

### `status_update`

Received when a shipment status is updated for a freight job you're monitoring.

**Payload:**
```typescript
{
  freightJobId: string; // UUID of the freight job
  status: any; // Status update object (structure depends on your status schema)
  timestamp: Date; // Timestamp of the status update
}
```

**Example Handler:**
```typescript
socket.on('status_update', (data) => {
  console.log('Status update:', data);
  // Update UI with new status
});
```

**Note:**
- This event is broadcasted by the server when shipment status changes
- You must be in the room for the freight job to receive updates

---

### `user_joined`

Received when another user joins a room you're in.

**Payload:**
```typescript
{
  userId: string; // UUID of the user who joined
  freightJobId: string; // UUID of the freight job
  timestamp: Date; // Timestamp when user joined
}
```

**Example Handler:**
```typescript
socket.on('user_joined', (data) => {
  console.log('User joined:', data.userId);
  // Update UI to show user is online
});
```

---

### `user_left`

Received when another user leaves a room you're in.

**Payload:**
```typescript
{
  userId: string; // UUID of the user who left
  freightJobId: string; // UUID of the freight job
  timestamp: Date; // Timestamp when user left
}
```

**Example Handler:**
```typescript
socket.on('user_left', (data) => {
  console.log('User left:', data.userId);
  // Update UI to show user is offline
});
```

---

### `typing_indicator`

Received when another user starts or stops typing in a room you're in.

**Payload:**
```typescript
{
  userId: string; // UUID of the user who is typing
  freightJobId: string; // UUID of the freight job
  isTyping: boolean; // true if typing, false if stopped
}
```

**Example Handler:**
```typescript
socket.on('typing_indicator', (data) => {
  if (data.isTyping) {
    console.log(`User ${data.userId} is typing...`);
    // Show typing indicator in UI
  } else {
    console.log(`User ${data.userId} stopped typing`);
    // Hide typing indicator in UI
  }
});
```

---

### `error`

Received when an error occurs.

**Payload:**
```typescript
{
  message: string; // Error message
}
```

**Example Handler:**
```typescript
socket.on('error', (error) => {
  console.error('WebSocket error:', error.message);
  // Display error to user
});
```

**Common Errors:**
- `"No token provided"` - Missing authentication token
- `"Invalid token"` - Invalid or expired JWT token
- `"Rate limit exceeded. Please wait before sending another message."` - Too many messages sent
- `"Failed to send message. Please try again."` - Server error when saving message

---

## REST API Endpoints

### GET `/api/v1/messages/freight-job/:jobId`

Retrieve message history for a freight job with pagination.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20, max: 100) - Items per page

**Example:**
```bash
curl -X GET \
  'http://localhost:6000/api/v1/messages/freight-job/123e4567-e89b-12d3-a456-426614174000?page=1&limit=20' \
  -H 'Authorization: Bearer your-jwt-token'
```

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-123",
      "freightJobId": "123e4567-e89b-12d3-a456-426614174000",
      "senderId": "user-123",
      "messageContent": "Hello, when will the shipment arrive?",
      "isRead": false,
      "sentAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

### POST `/api/v1/messages`

Create a new message (alternative to WebSocket `send_message` event).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "freightJobId": "123e4567-e89b-12d3-a456-426614174000",
  "messageContent": "Hello, when will the shipment arrive?"
}
```

**Example:**
```bash
curl -X POST \
  'http://localhost:6000/api/v1/messages' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "freightJobId": "123e4567-e89b-12d3-a456-426614174000",
    "messageContent": "Hello, when will the shipment arrive?"
  }'
```

**Response:**
```json
{
  "id": "msg-123",
  "freightJobId": "123e4567-e89b-12d3-a456-426614174000",
  "senderId": "user-123",
  "messageContent": "Hello, when will the shipment arrive?",
  "isRead": false,
  "sentAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:**
- Messages created via REST API will also be broadcasted via WebSocket to users in the room
- The sender ID is automatically extracted from the JWT token

---

## Complete Client Example

```typescript
import { io, Socket } from 'socket.io-client';

class FreightFlowWebSocket {
  private socket: Socket;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.socket = io('http://localhost:6000/ws', {
      auth: {
        token: token
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    this.socket.on('message', (data) => {
      console.log('New message:', data);
      // Handle new message
    });

    this.socket.on('status_update', (data) => {
      console.log('Status update:', data);
      // Handle status update
    });

    this.socket.on('user_joined', (data) => {
      console.log('User joined:', data.userId);
      // Handle user joined
    });

    this.socket.on('user_left', (data) => {
      console.log('User left:', data.userId);
      // Handle user left
    });

    this.socket.on('typing_indicator', (data) => {
      console.log('Typing:', data);
      // Handle typing indicator
    });

    this.socket.on('error', (error) => {
      console.error('Error:', error.message);
      // Handle error
    });
  }

  joinRoom(freightJobId: string) {
    this.socket.emit('join_room', { freightJobId });
  }

  leaveRoom(freightJobId: string) {
    this.socket.emit('leave_room', { freightJobId });
  }

  sendMessage(freightJobId: string, messageContent: string) {
    this.socket.emit('send_message', {
      freightJobId,
      messageContent
    });
  }

  setTyping(freightJobId: string, isTyping: boolean) {
    this.socket.emit('typing', {
      freightJobId,
      isTyping
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Usage
const ws = new FreightFlowWebSocket('your-jwt-token');
ws.joinRoom('123e4567-e89b-12d3-a456-426614174000');
ws.sendMessage('123e4567-e89b-12d3-a456-426614174000', 'Hello!');
```

---

## Security Considerations

1. **Authentication**: All WebSocket connections require valid JWT tokens
2. **Authorization**: Users can only join rooms for freight jobs they have access to
3. **XSS Prevention**: Message content is automatically sanitized
4. **Rate Limiting**: Message sending is rate-limited to prevent abuse
5. **Input Validation**: All event payloads are validated using class-validator

---

## Database Schema

### Messages Table
- `id` (UUID) - Primary key
- `freight_job_id` (UUID) - Foreign key to freight job
- `sender_id` (UUID) - Foreign key to user
- `message_content` (TEXT) - Message text
- `is_read` (BOOLEAN) - Read status
- `sent_at` (TIMESTAMP) - Message timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### WebSocket Connections Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to user
- `socket_id` (VARCHAR) - Socket.io socket ID
- `connected_at` (TIMESTAMP) - Connection timestamp
- `last_heartbeat` (TIMESTAMP) - Last heartbeat timestamp

---

## Error Codes

| Error Message | Description | Solution |
|--------------|-------------|----------|
| `No token provided` | Missing authentication token | Provide JWT token in Authorization header or query parameter |
| `Invalid token` | Invalid or expired JWT token | Refresh token or re-authenticate |
| `Rate limit exceeded` | Too many messages sent | Wait before sending another message |
| `Failed to send message` | Server error | Retry the request |

---

## Performance Considerations

1. **Connection Pooling**: Use connection pooling for database operations
2. **Redis Adapter**: For horizontal scaling, use Redis adapter for Socket.io
3. **Message Pagination**: Always use pagination when fetching message history
4. **Connection Cleanup**: Stale connections are automatically cleaned up after 30 minutes of inactivity

---

## Testing

Unit tests and integration tests are available in:
- `src/websocket/services/*.spec.ts` - Service unit tests
- `src/websocket/gateways/*.spec.ts` - Gateway unit tests

Run tests with:
```bash
npm test
```

---

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

