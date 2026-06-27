import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentPipelineService } from './document-pipeline.service';
import { DocumentProcessing, ProcessingStatus } from './entities/document-processing.entity';
import { Document } from '../documents/entities/document.entity';

describe('DocumentPipelineService', () => {
  let service: DocumentPipelineService;

  const mockProcRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDocRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentPipelineService,
        { provide: getRepositoryToken(DocumentProcessing), useValue: mockProcRepo },
        { provide: getRepositoryToken(Document), useValue: mockDocRepo },
      ],
    }).compile();
    service = module.get(DocumentPipelineService);
  });

  it('processes a document successfully', async () => {
    mockDocRepo.findOne.mockResolvedValue({ id: 'doc-1', fileName: 'test.pdf' });
    mockProcRepo.findOne.mockResolvedValue(null);
    mockProcRepo.create.mockReturnValue({});
    mockProcRepo.save.mockResolvedValue({ status: ProcessingStatus.READY });

    const result = await service.process('doc-1');
    expect(result.status).toBe(ProcessingStatus.READY);
  });
});
