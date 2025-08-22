import { Test, TestingModule } from '@nestjs/testing';
import { PartnerService } from './partner.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { Repository } from 'typeorm';

describe('PartnerService', () => {
  let service: PartnerService;
  let repo: Repository<Partner>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerService,
        {
          provide: getRepositoryToken(Partner),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PartnerService>(PartnerService);
    repo = module.get<Repository<Partner>>(getRepositoryToken(Partner));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a partner', async () => {
    const dto = { name: 'DHL', serviceTypes: ['logistics'], rating: 5 };
    jest.spyOn(repo, 'create').mockReturnValue(dto as Partner);
    jest.spyOn(repo, 'save').mockResolvedValue(dto as Partner);

    const result = await service.create(dto);
    expect(result.name).toEqual('DHL');
  });
});
