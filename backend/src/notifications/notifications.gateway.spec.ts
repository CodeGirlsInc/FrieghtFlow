import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { ShipmentEvent } from '../shipments/events/shipment.events';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtService: { verify: jest.Mock };
  let server: { to: jest.Mock };

  const shipment = {
    id: 'shipment-1',
    trackingNumber: 'FF-001',
    shipperId: 'shipper-1',
    carrierId: 'carrier-1',
    shipper: { id: 'shipper-1', email: 'shipper@example.com' } as User,
    carrier: { id: 'carrier-1', email: 'carrier@example.com' } as User,
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Electronics',
    weightKg: 100,
    currency: 'USD',
    price: 5000,
    status: ShipmentStatus.ACCEPTED,
    cargoCategory: null,
    volumeCbm: null,
    isInsured: false,
    onChainShipmentId: null,
    insurancePremium: null,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Shipment;

  beforeEach(() => {
    jwtService = { verify: jest.fn().mockReturnValue({ sub: 'user-1' }) };
    server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };
    gateway = new NotificationsGateway(
      jwtService as unknown as JwtService,
      { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService,
    );
    (gateway as unknown as { server: typeof server }).server = server;
  });

  it('accepts a valid token and joins the user room', async () => {
    const client = {
      id: 'socket-1',
      handshake: { auth: { token: 'jwt-token' } },
      data: {},
      join: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
      disconnect: jest.fn(),
    } as never;

    await gateway.handleConnection(client);

    expect(jwtService.verify).toHaveBeenCalledWith('jwt-token', {
      secret: 'secret',
    });
    expect((client as { join: jest.Mock }).join).toHaveBeenCalledWith('user:user-1');
  });

  it('disconnects when the token is missing', async () => {
    const client = {
      id: 'socket-1',
      handshake: { auth: {} },
      data: {},
      join: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    } as never;

    await gateway.handleConnection(client);

    expect((client as { emit: jest.Mock }).emit).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({ message: 'No token provided' }),
    );
    expect((client as { disconnect: jest.Mock }).disconnect).toHaveBeenCalledWith(true);
  });

  it('disconnects when the token is invalid or expired', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const client = {
      id: 'socket-2',
      handshake: { auth: { token: 'bad-token' } },
      data: {},
      join: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    } as never;

    await gateway.handleConnection(client);

    expect(jwtService.verify).toHaveBeenCalledWith('bad-token', {
      secret: 'secret',
    });
    expect((client as { emit: jest.Mock }).emit).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({ message: 'Invalid or expired token' }),
    );
    expect((client as { disconnect: jest.Mock }).disconnect).toHaveBeenCalledWith(true);
    expect((client as { join: jest.Mock }).join).not.toHaveBeenCalled();
  });

  it('emits shipment updates to the intended user room', () => {
    const emit = jest.fn();
    (server.to as jest.Mock).mockReturnValue({ emit });

    gateway.onCreated(new ShipmentEvent(shipment, 'actor-1'));

    expect(server.to).toHaveBeenCalledWith('user:shipper-1');
    expect(emit).toHaveBeenCalledWith(
      'shipment:updated',
      expect.objectContaining({
        shipmentId: 'shipment-1',
        trackingNumber: 'FF-001',
      }),
    );
  });

  it('emits to both shipper and carrier for accepted events but not to unrelated users', () => {
    const shipperEmit = jest.fn();
    const carrierEmit = jest.fn();
    const unrelatedEmit = jest.fn();

    (server.to as jest.Mock).mockImplementation((room: string) => {
      if (room === 'user:shipper-1') return { emit: shipperEmit };
      if (room === 'user:carrier-1') return { emit: carrierEmit };
      return { emit: unrelatedEmit };
    });

    gateway.onAccepted(new ShipmentEvent(shipment, 'actor-1'));

    expect(server.to).toHaveBeenCalledWith('user:shipper-1');
    expect(server.to).toHaveBeenCalledWith('user:carrier-1');
    expect(shipperEmit).toHaveBeenCalledWith(
      'shipment:updated',
      expect.objectContaining({ shipmentId: 'shipment-1' }),
    );
    expect(carrierEmit).toHaveBeenCalledWith(
      'shipment:updated',
      expect.objectContaining({ shipmentId: 'shipment-1' }),
    );
    expect(server.to).not.toHaveBeenCalledWith('user:unrelated-user');
  });

  it('does not emit to carrier room when carrierId is null', () => {
    const shipperEmit = jest.fn();
    const carrierEmit = jest.fn();

    (server.to as jest.Mock).mockImplementation((room: string) => {
      if (room === 'user:shipper-1') return { emit: shipperEmit };
      if (room === 'user:carrier-1') return { emit: carrierEmit };
      return { emit: jest.fn() };
    });

    const shipmentNoCarrier = { ...shipment, carrierId: null } as Shipment;
    gateway.onCreated(new ShipmentEvent(shipmentNoCarrier, 'actor-1'));

    expect(server.to).toHaveBeenCalledWith('user:shipper-1');
    expect(server.to).not.toHaveBeenCalledWith('user:carrier-1');
    expect(shipperEmit).toHaveBeenCalled();
  });
});
