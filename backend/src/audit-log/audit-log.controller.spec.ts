import { RequestMethod } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

const METHODS_METADATA = 'method';

describe('AuditLogController', () => {
  let controller: AuditLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        { provide: AuditLogService, useValue: { findAll: jest.fn() } },
      ],
    }).compile();

    controller = module.get(AuditLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should not have a DELETE endpoint', () => {
    const prototype = Object.getPrototypeOf(controller);
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter((name) => name !== 'constructor' && typeof prototype[name] === 'function');

    for (const methodName of methodNames) {
      const httpMethod = Reflect.getMetadata(METHODS_METADATA, prototype[methodName]);
      expect(httpMethod).not.toBe(RequestMethod.DELETE);
    }
  });
});
