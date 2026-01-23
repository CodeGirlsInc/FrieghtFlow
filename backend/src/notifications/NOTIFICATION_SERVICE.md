# Notification Service Module Documentation

## Overview

The Notification Service Module is a comprehensive, multi-channel notification system for FreightFlow that supports Email, SMS, and In-App notifications. It's built with NestJS using dependency injection for flexible provider selection and configuration.

## Features

- **Multi-Channel Support**: Email (NodeMailer), SMS (Twilio), and In-App notifications
- **User Preferences**: Granular control over notification channels and types
- **Template System**: Dynamic HTML templates for each notification type
- **Event-Driven Architecture**: Easy integration with business logic
- **Retry Logic**: Error handling with logging
- **Database Persistence**: All notifications stored in PostgreSQL
- **Type Safety**: Full TypeScript support with DTOs

## Architecture

### Directory Structure

```
notifications/
├── controllers/
│   └── notification.controller.ts      # API endpoints
├── services/
│   └── notification.service.ts         # Core business logic
├── entities/
│   ├── notification.entity.ts          # Notification ORM model
│   ├── notification-preference.entity.ts # User preferences model
│   └── index.ts
├── providers/
│   ├── notification-provider.interface.ts  # Provider contract
│   ├── email.provider.ts               # Email implementation
│   ├── sms.provider.ts                 # SMS implementation (Twilio)
│   ├── in-app.provider.ts              # In-app implementation
│   └── index.ts
├── templates/
│   └── notification-template.service.ts # Template rendering
├── dto/
│   ├── notification.dto.ts
│   ├── notification-preference.dto.ts
│   ├── send-notification.dto.ts
│   └── index.ts
├── event-handlers/
│   └── notification.event-handler.ts   # Business event triggers
├── notifications.module.ts              # Module definition
└── notifications.e2e-spec.ts           # Integration tests
```

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### Notification Preferences Table

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  notification_types JSONB DEFAULT '["SHIPMENT_CREATED", "SHIPMENT_ASSIGNED", "STATUS_UPDATED", "DELIVERY_CONFIRMED", "PAYMENT_RECEIVED", "ISSUE_REPORTED"]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Notification Types

- **SHIPMENT_CREATED**: When a new shipment is created
- **SHIPMENT_ASSIGNED**: When a carrier is assigned to a shipment
- **STATUS_UPDATED**: When shipment status changes
- **DELIVERY_CONFIRMED**: When a shipment is delivered
- **PAYMENT_RECEIVED**: When payment is processed
- **ISSUE_REPORTED**: When an issue is reported on a shipment

## API Endpoints

### Get All Notifications
```http
GET /api/v1/notifications
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "SHIPMENT_CREATED",
    "title": "New Shipment Created",
    "message": "HTML content",
    "isRead": false,
    "metadata": {...},
    "createdAt": "2024-01-22T10:00:00Z",
    "updatedAt": "2024-01-22T10:00:00Z"
  }
]
```

### Get Specific Notification
```http
GET /api/v1/notifications/:id
Authorization: Bearer <token>

Response: Single notification object
```

### Mark as Read
```http
PATCH /api/v1/notifications/:id/read
Authorization: Bearer <token>

Response: Updated notification object with isRead: true
```

### Delete Notification
```http
DELETE /api/v1/notifications/:id
Authorization: Bearer <token>

Response: 204 No Content
```

### Get User Preferences
```http
GET /api/v1/notifications/preferences/current
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "emailEnabled": true,
  "smsEnabled": true,
  "inAppEnabled": true,
  "notificationTypes": ["SHIPMENT_CREATED", "SHIPMENT_ASSIGNED", ...],
  "createdAt": "2024-01-22T10:00:00Z",
  "updatedAt": "2024-01-22T10:00:00Z"
}
```

### Update User Preferences
```http
PATCH /api/v1/notifications/preferences/current
Authorization: Bearer <token>

Request:
{
  "emailEnabled": false,
  "smsEnabled": true,
  "notificationTypes": ["SHIPMENT_CREATED", "DELIVERY_CONFIRMED"]
}

Response: Updated preferences object
```

### Get Unread Count
```http
GET /api/v1/notifications/unread/count
Authorization: Bearer <token>

Response:
{
  "unreadCount": 5
}
```

## Configuration

Set the following environment variables in your `.env` file:

### Email Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false
SMTP_FROM_EMAIL=noreply@freightflow.com
```

### SMS Configuration (Optional)
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Usage Examples

### Sending Notifications Programmatically

```typescript
import { NotificationEventHandler } from './notifications/event-handlers/notification.event-handler';

// In your service/controller
constructor(
  private notificationService: NotificationService,
) {}

async createShipment(shipmentData) {
  // Create shipment logic...
  
  // Send notification
  await this.notificationService.sendNotification({
    userId: shipmentData.userId,
    type: NotificationType.SHIPMENT_CREATED,
    title: 'New Shipment Created',
    message: 'Your shipment has been created',
    recipientEmail: user.email,
    recipientPhone: user.phone,
    metadata: {
      shipmentId: shipment.id,
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
    },
  });
}
```

### Using Event Handlers

```typescript
import { NotificationEventHandler } from './notifications/event-handlers/notification.event-handler';

// In your shipment service
constructor(
  private eventHandler: NotificationEventHandler,
) {}

async createShipment(shipmentData) {
  const shipment = await this.shipmentRepository.save({...});
  
  await this.eventHandler.onShipmentCreated({
    shipmentId: shipment.id,
    userId: shipment.userId,
    origin: shipment.origin,
    destination: shipment.destination,
    status: shipment.status,
    recipientEmail: user.email,
    recipientPhone: user.phone,
  });
}
```

## Provider Implementation Details

### Email Provider (NodeMailer)

- Uses NodeMailer for SMTP-based email sending
- Supports TLS/SSL encryption
- Logs all email attempts
- Falls back gracefully if not configured
- HTML email support with templates

### SMS Provider (Twilio)

- Uses Twilio REST API
- Requires Twilio account credentials
- Optional dependency (gracefully handles missing Twilio package)
- Falls back if not configured
- Phone number validation

### In-App Provider

- Always available and configured
- Stores notifications directly in database
- Accessible through REST API
- Real-time notification support

## Testing

### Running Unit Tests

```bash
npm run test -- notifications
```

### Running Integration Tests

```bash
npm run test:e2e -- notifications
```

### Test Coverage

All providers, services, and templates have comprehensive test coverage including:
- Configuration validation
- Notification sending
- Error handling
- Database operations
- Template rendering

## Error Handling & Logging

- All notification attempts are logged with timestamps
- Failures in one channel don't block other channels
- Retry logic automatically handled by database persistence
- Comprehensive error messages for debugging

## Best Practices

1. **Always provide contact information**: Include email/phone in notification request
2. **Use metadata wisely**: Store relevant context for templates
3. **Respect user preferences**: Always check user preferences before sending
4. **Handle failures gracefully**: Use async/await with try-catch
5. **Log important events**: Use the built-in logging for audit trails
6. **Test templates**: Ensure all template variables are provided

## Future Enhancements

- [ ] Push notifications support (FCM, APNs)
- [ ] Notification scheduling
- [ ] Notification batching
- [ ] A/B testing for templates
- [ ] Delivery tracking and analytics
- [ ] Webhook integration
- [ ] Custom provider support
- [ ] Notification history and archiving

## Troubleshooting

### Emails not sending
1. Check SMTP configuration in `.env`
2. Verify SMTP credentials
3. Check firewall/port 587 access
4. Enable "less secure apps" for Gmail

### SMS not sending
1. Verify Twilio credentials
2. Check account balance
3. Verify phone number format
4. Check Twilio logs

### Notifications not appearing in DB
1. Verify database connection
2. Check TypeORM migrations
3. Verify user ID exists

## Dependencies

- `@nestjs/core` - NestJS framework
- `@nestjs/typeorm` - Database ORM integration
- `nodemailer` - Email sending
- `typeorm` - Database ORM
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `@nestjs/config` - Configuration management

Optional:
- `twilio` - SMS support
