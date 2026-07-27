import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DocumentsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest
              .fn()
              .mockResolvedValue({ id: '1', title: 'Test Document' }),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of documents', async () => {
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});
