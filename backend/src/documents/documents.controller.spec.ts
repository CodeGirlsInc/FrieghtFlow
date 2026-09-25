import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { UserRole } from '../common/enums/role.enum';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: {
    upload: jest.Mock;
    uploadCertificationDocument: jest.Mock;
    listByShipment: jest.Mock;
    findOne: jest.Mock;
    getFilePath: jest.Mock;
    delete: jest.Mock;
    cleanupUpload: jest.Mock;
  };

  const user = { id: 'user-1', role: UserRole.SHIPPER } as never;

  beforeEach(async () => {
    service = {
      upload: jest.fn(),
      uploadCertificationDocument: jest.fn(),
      listByShipment: jest.fn(),
      findOne: jest.fn(),
      getFilePath: jest.fn(),
      delete: jest.fn(),
      cleanupUpload: jest.fn(),
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
    expect(service.cleanupUpload).toHaveBeenCalled();
  });

  it('cleans up a controller-stage failure after a file was accepted', async () => {
    const file = {
      mimetype: 'application/pdf',
      originalname: 'license.pdf',
      path: '/uploads/pending.pdf',
    } as Express.Multer.File;
    service.upload.mockRejectedValue(new Error('validation failed'));

    await expect(
      controller.upload(file, { shipmentId: 'shipment-1' } as never, user),
    ).rejects.toThrow('validation failed');
    expect(service.cleanupUpload).toHaveBeenCalledWith(file);
  });

  it('delegates a carrier certification upload to the platform document service', async () => {
    const file = {
      mimetype: 'application/pdf',
      originalname: 'license.pdf',
    } as Express.Multer.File;
    const carrier = { id: 'carrier-1', role: UserRole.CARRIER } as never;

    await controller.uploadCertification(file, carrier);

    expect(service.uploadCertificationDocument).toHaveBeenCalledWith(
      file,
      carrier,
    );
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
    await controller.listByShipment('shipment-1', user);
    await controller.findOne('doc-1', user);
    await controller.download('doc-1', user, { download: jest.fn() } as never);
    await controller.remove('doc-1', user);

    expect(service.upload).toHaveBeenCalledWith(file, dto, user);
    expect(service.listByShipment).toHaveBeenCalledWith('shipment-1', user);
    expect(service.findOne).toHaveBeenCalledWith('doc-1', user);
    expect(service.getFilePath).toHaveBeenCalledWith('doc-1', user);
    expect(service.delete).toHaveBeenCalledWith('doc-1', user);
  });
});
