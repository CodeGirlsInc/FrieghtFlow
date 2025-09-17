// __tests__/customs-compliance.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CustomsComplianceController } from '../customs-compliance.controller';
import { CustomsComplianceService } from '../customs-compliance.service';

describe('CustomsComplianceController', () => {
  let controller: CustomsComplianceController;
  let service: CustomsComplianceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomsComplianceController],
      providers: [
        {
          provide: CustomsComplianceService,
          useValue: {
            uploadDocument: jest.fn(),
            updateDocument: jest.fn(),
            createComplianceCheck: jest.fn(),
            updateComplianceCheck: jest.fn(),
            getComplianceHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomsComplianceController>(
      CustomsComplianceController,
    );
    service = module.get<CustomsComplianceService>(CustomsComplianceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
