import { Test, TestingModule } from '@nestjs/testing';
import { PartnerController } from './partner.controller';
import { PartnerService } from './partner.service';

describe('PartnerController', () => {
  let controller: PartnerController;
  let service: PartnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerController],
      providers: [
        {
          provide: PartnerService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PartnerController>(PartnerController);
    service = module.get<PartnerService>(PartnerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
