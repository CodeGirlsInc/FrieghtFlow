import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { UserRole } from '../common/enums/role.enum';

describe('AddressesController', () => {
  let controller: AddressesController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const user = { id: 'user-1', role: UserRole.SHIPPER } as never;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [{ provide: AddressesService, useValue: service }],
    }).compile();

    controller = module.get(AddressesController);
  });

  it('passes the current user through to the service', async () => {
    const dto = {
      label: 'HQ',
      address: '1 Main St',
      city: 'Lagos',
      country: 'Nigeria',
    };

    await controller.create(user, dto);
    controller.findAll(user);
    controller.update('address-1', user, dto);
    controller.remove('address-1', user);

    expect(service.create).toHaveBeenCalledWith('user-1', dto);
    expect(service.findAll).toHaveBeenCalledWith('user-1');
    expect(service.update).toHaveBeenCalledWith('address-1', 'user-1', dto);
    expect(service.remove).toHaveBeenCalledWith('address-1', 'user-1');
  });
});
