// __tests__/customs-compliance.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CustomsComplianceService } from '../customs-compliance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomsDocument } from '../entities/customs-document.entity';
import { ComplianceCheck } from '../entities/compliance-check.entity';
import { Repository } from 'typeorm';

describe('CustomsComplianceService', () => {
  let service: CustomsComplianceService;
  let customsDocRepo: Repository<CustomsDocument>;
  let complianceRepo: Repository<ComplianceCheck>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomsComplianceService,
        {
          provide: getRepositoryToken(CustomsDocument),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ComplianceCheck),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CustomsComplianceService>(CustomsComplianceService);
    customsDocRepo = module.get<Repository<CustomsDocument>>(
      getRepositoryToken(CustomsDocument),
    );
    complianceRepo = module.get<Repository<ComplianceCheck>>(
      getRepositoryToken(ComplianceCheck),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
