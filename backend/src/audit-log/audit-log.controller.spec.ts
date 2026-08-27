import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let service: { findAll: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [{ provide: AuditLogService, useValue: service }],
    }).compile();

    controller = module.get(AuditLogController);
  });

  it('delegates filtered queries to the audit log service', async () => {
    const result = await controller.findAll({ action: 'PATCH /admin/users/:id/role' });

    expect(service.findAll).toHaveBeenCalledWith({
      action: 'PATCH /admin/users/:id/role',
    });
    expect(result).toEqual({ data: [], total: 0 });
  });
});
