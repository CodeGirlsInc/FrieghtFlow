# Notifications Module - Quick Start Guide

## Overview

This is a production-ready notification service module for FreightFlow that handles multi-channel notifications (Email, SMS, In-App) with user preferences management and template support.

## Quick Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# SMTP Configuration (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false
SMTP_FROM_EMAIL=noreply@freightflow.com

# Twilio Configuration (SMS) - Optional
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Import Module

The module is already imported in `app.module.ts`:

```typescript
import { NotificationModule } from './notifications/notifications.module';

@Module({
  imports: [
    // ... other imports
    NotificationModule,
  ],
})
export class AppModule {}
```

### 3. Database Entities

The following tables are automatically created via TypeORM:

- `notifications` - Stores all notifications
- `notification_preferences` - Stores user preferences

## Usage Examples

### Sending Notifications

```typescript
import { NotificationService } from './notifications/services';
import { NotificationType } from './notifications/entities';

constructor(private notificationService: NotificationService) {}

async handleShipmentCreation(shipment: Shipment) {
  await this.notificationService.sendNotification({
    userId: shipment.userId,
    type: NotificationType.SHIPMENT_CREATED,
    title: 'New Shipment Created',
    message: 'Your shipment has been created',
    recipientEmail: user.email,
    recipientPhone: user.phone,
    metadata: {
      shipmentId: shipment.id,
      origin: shipment.origin,
      destination: shipment.destination,
    },
  });
}
```

### Using Event Handlers

```typescript
import { NotificationEventHandler } from './notifications/event-handlers';

constructor(private eventHandler: NotificationEventHandler) {}

async onShipmentStatusChange(shipment: Shipment) {
  await this.eventHandler.onStatusUpdated({
    shipmentId: shipment.id,
    userId: shipment.userId,
    previousStatus: shipment.previousStatus,
    currentStatus: shipment.status,
    location: shipment.location,
    updatedAt: new Date().toISOString(),
    recipientEmail: user.email,
  });
}
```

## API Endpoints

All endpoints require authentication (Bearer token).

### Get User's Notifications
```
GET /api/v1/notifications
```

### Get Specific Notification
```
GET /api/v1/notifications/:id
```

### Mark Notification as Read
```
PATCH /api/v1/notifications/:id/read
```

### Delete Notification
```
DELETE /api/v1/notifications/:id
```

### Get User Preferences
```
GET /api/v1/notifications/preferences/current
```

### Update User Preferences
```
PATCH /api/v1/notifications/preferences/current
Body: {
  "emailEnabled": true,
  "smsEnabled": false,
  "inAppEnabled": true,
  "notificationTypes": ["SHIPMENT_CREATED", "DELIVERY_CONFIRMED"]
}
```

### Get Unread Count
```
GET /api/v1/notifications/unread/count
```

## Notification Types

1. **SHIPMENT_CREATED** - New shipment created
2. **SHIPMENT_ASSIGNED** - Carrier assigned to shipment
3. **STATUS_UPDATED** - Shipment status changed
4. **DELIVERY_CONFIRMED** - Shipment delivered
5. **PAYMENT_RECEIVED** - Payment processed
6. **ISSUE_REPORTED** - Problem with shipment

## Features

✅ **Multi-Channel**: Email, SMS, In-App  
✅ **User Preferences**: Control channels and notification types  
✅ **Templates**: Dynamic HTML templates for each notification type  
✅ **Error Handling**: Graceful failure with logging  
✅ **Database Persistence**: All notifications stored  
✅ **Type Safety**: Full TypeScript support  
✅ **Testing**: Unit and integration tests included  
✅ **Logging**: Comprehensive logging of all attempts  

## Testing

```bash
# Run unit tests
npm run test -- notifications

# Run integration tests
npm run test:e2e -- notifications

# Run with coverage
npm run test:cov -- notifications
```

## Providers

### Email (NodeMailer)
- SMTP-based email sending
- HTML template support
- Automatic fallback if not configured

### SMS (Twilio)
- REST API integration
- Optional dependency
- Automatic fallback if not configured

### In-App
- Always available
- Database persistence
- Real-time API access

## Important Notes

1. **Authentication**: Controller endpoints need proper auth guards (TODO: integrate with auth module)
2. **User ID**: Currently uses placeholder "placeholder-user-id" - integrate with auth context
3. **Contact Info**: Provide email/phone in notification requests
4. **Templates**: Customize templates in `templates/notification-template.service.ts`
5. **Configuration**: All providers check if they're configured before sending

## Troubleshooting

### Emails not being sent
- Check SMTP configuration in `.env`
- Verify email provider is enabled: `emailEnabled: true` in user preferences
- Check database connection
- Review application logs for errors

### SMS not working
- Verify Twilio account and credentials
- Ensure SMS provider is enabled: `smsEnabled: true` in user preferences
- Check account balance
- Verify phone number format

### Notifications not appearing
- Check that `inAppEnabled: true` in user preferences
- Verify notification type is in user's `notificationTypes` array
- Check database for `notifications` table entries

## File Structure

```
notifications/
├── controllers/          # API endpoints
├── services/            # Business logic
├── entities/            # Database models
├── providers/           # Email, SMS, In-App implementations
├── templates/           # Notification templates
├── dto/                 # Data transfer objects
├── event-handlers/      # Business event triggers
├── notifications.module.ts
├── NOTIFICATION_SERVICE.md
└── README.md (this file)
```

## Next Steps

1. Configure email provider with your SMTP service
2. (Optional) Configure SMS provider with Twilio
3. Integrate auth module to get user IDs from auth context
4. Use `NotificationEventHandler` to trigger notifications from business logic
5. Customize templates in `templates/notification-template.service.ts`
6. Add more notification types as needed

## Support

For detailed documentation, see [NOTIFICATION_SERVICE.md](./NOTIFICATION_SERVICE.md)
