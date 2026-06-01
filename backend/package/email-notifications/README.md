Email Notifications

This package provides `EmailNotificationsService` exposing methods for these events:

- `sendBidPlaced`
- `sendBidAccepted`
- `sendShipmentPickedUp`
- `sendShipmentDelivered`
- `sendShipmentCancelled`

Templates are in `templates/` and expect `trackingNumber`, `route`, and `shipmentId`.
