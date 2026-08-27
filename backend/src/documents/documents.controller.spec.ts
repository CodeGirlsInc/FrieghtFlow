import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { UserRole } from '../common/enums/role.enum';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: {
    upload: jest.Mock;
    listByShipment: jest.Mock;
    findOne: jest.Mock;
    getFilePath: jest.Mock;
    delete: jest.Mock;
  };

  const user = { id: 'user-1', role: UserRole.SHIPPER } as never;

  beforeEach(async () => {
    service = {
      upload: jest.fn(),
      listByShipment: jest.fn(),
      findOne: jest.fn(),
      getFilePath: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [{ provide: DocumentsService, useValue: service }],
    }).compile();

    controller = module.get(DocumentsController);
  });

  it('rejects unsupported file types before calling the service', async () => {
    await expect(
      controller.upload(
        {
          mimetype: 'application/x-msdownload',
        } as Express.Multer.File,
        { shipmentId: 'shipment-1' } as never,
        user,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(service.upload).not.toHaveBeenCalled();
  });

  it('delegates valid uploads and reads to the service', async () => {
    const file = {
      mimetype: 'application/pdf',
      originalname: 'invoice.pdf',
    } as Express.Multer.File;
    const dto = { shipmentId: 'shipment-1', documentType: 'invoice' } as never;
    service.getFilePath.mockResolvedValue({
      filePath: '/uploads/stored.pdf',
      originalName: 'invoice.pdf',
    });

    await controller.upload(file, dto, user);
    controller.listByShipment('shipment-1', user);
    controller.findOne('doc-1', user);
    await controller.download(
      'doc-1',
      user,
      { download: jest.fn() } as never,
    );
    controller.remove('doc-1', user);

    expect(service.upload).toHaveBeenCalledWith(file, dto, user);
    expect(service.listByShipment).toHaveBeenCalledWith('shipment-1', user);
    expect(service.findOne).toHaveBeenCalledWith('doc-1', user);
    expect(service.getFilePath).toHaveBeenCalledWith('doc-1', user);
    expect(service.delete).toHaveBeenCalledWith('doc-1', user);
  });
});
