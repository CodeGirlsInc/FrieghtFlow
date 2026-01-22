import { Test, TestingModule } from '@nestjs/testing';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationType } from '../entities';

describe('NotificationTemplateService', () => {
  let service: NotificationTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationTemplateService],
    }).compile();

    service = module.get<NotificationTemplateService>(NotificationTemplateService);
  });

  describe('renderTemplate', () => {
    it('should render SHIPMENT_CREATED template', () => {
      const result = service.renderTemplate(NotificationType.SHIPMENT_CREATED, {
        shipmentId: 'SHIP-001',
        origin: 'New York',
        destination: 'Los Angeles',
        status: 'Pending',
      });

      expect(result.subject).toBe('New Shipment Created');
      expect(result.body).toContain('SHIP-001');
      expect(result.body).toContain('New York');
    });

    it('should render SHIPMENT_ASSIGNED template', () => {
      const result = service.renderTemplate(NotificationType.SHIPMENT_ASSIGNED, {
        shipmentId: 'SHIP-001',
        carrierName: 'FedEx',
        carrierReference: 'FDX-123456',
      });

      expect(result.subject).toBe('Shipment Assigned to Carrier');
      expect(result.body).toContain('FedEx');
    });

    it('should render STATUS_UPDATED template', () => {
      const result = service.renderTemplate(NotificationType.STATUS_UPDATED, {
        shipmentId: 'SHIP-001',
        previousStatus: 'Pending',
        currentStatus: 'In Transit',
        location: 'Chicago',
      });

      expect(result.subject).toBe('Shipment Status Updated');
      expect(result.body).toContain('In Transit');
    });

    it('should render DELIVERY_CONFIRMED template', () => {
      const result = service.renderTemplate(NotificationType.DELIVERY_CONFIRMED, {
        shipmentId: 'SHIP-001',
        deliveredAt: '2024-01-22',
        recipient: 'John Doe',
      });

      expect(result.subject).toBe('Shipment Delivered');
      expect(result.body).toContain('John Doe');
    });

    it('should render PAYMENT_RECEIVED template', () => {
      const result = service.renderTemplate(NotificationType.PAYMENT_RECEIVED, {
        transactionId: 'TXN-001',
        amount: '100.00',
        currency: 'USD',
      });

      expect(result.subject).toBe('Payment Received');
      expect(result.body).toContain('100.00');
    });

    it('should render ISSUE_REPORTED template', () => {
      const result = service.renderTemplate(NotificationType.ISSUE_REPORTED, {
        shipmentId: 'SHIP-001',
        issueType: 'Damage',
        description: 'Package damaged during transit',
      });

      expect(result.subject).toBe('Issue Reported on Shipment');
      expect(result.body).toContain('Damage');
    });

    it('should handle unknown notification types', () => {
      const result = service.renderTemplate('UNKNOWN_TYPE' as any, {});

      expect(result.subject).toBe('Notification');
      expect(result.body).toBe('You have a new notification');
    });
  });
});
