import { EmailNotificationsService } from '../src/email-notifications.service';

const mockMailer = { sendMail: jest.fn() } as any;

describe('EmailNotificationsService', () => {
  let svc: EmailNotificationsService;

  beforeEach(() => {
    mockMailer.sendMail.mockClear();
    svc = new EmailNotificationsService(mockMailer);
  });

  const data = {
    to: 'user@example.com',
    trackingNumber: 'TN123',
    route: 'A -> B',
    shipmentId: 'ship1',
  };

  it('sends bid-placed', async () => {
    await svc.sendBidPlaced(data);
    expect(mockMailer.sendMail).toHaveBeenCalledWith(expect.objectContaining({ template: 'bid-placed' }));
  });

  it('sends bid-accepted', async () => {
    await svc.sendBidAccepted(data);
    expect(mockMailer.sendMail).toHaveBeenCalledWith(expect.objectContaining({ template: 'bid-accepted' }));
  });

  it('sends shipment-picked-up', async () => {
    await svc.sendShipmentPickedUp(data);
    expect(mockMailer.sendMail).toHaveBeenCalledWith(expect.objectContaining({ template: 'shipment-picked-up' }));
  });

  it('sends shipment-delivered', async () => {
    await svc.sendShipmentDelivered(data);
    expect(mockMailer.sendMail).toHaveBeenCalledWith(expect.objectContaining({ template: 'shipment-delivered' }));
  });

  it('sends shipment-cancelled', async () => {
    await svc.sendShipmentCancelled(data);
    expect(mockMailer.sendMail).toHaveBeenCalledWith(expect.objectContaining({ template: 'shipment-cancelled' }));
  });
});
