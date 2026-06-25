import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities/audit-log.entity';

const mockQb = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[], 0] as [unknown[], number]),
};

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQb),
});

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: getRepositoryToken(AuditLog), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(AuditLogService);
    repo = module.get(getRepositoryToken(AuditLog));
  });

  describe('log', () => {
    it('saves an audit log entry', async () => {
      const entry = { adminId: 'admin1', action: 'POST /admin/users' };
      repo.create.mockReturnValue(entry);
      repo.save.mockResolvedValue(entry);

      await service.log({ adminId: 'admin1', action: 'POST /admin/users' });
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns paginated results', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toMatchObject({ data: [], total: 0, page: 1, limit: 10 });
    });

    it('filters by action when provided', async () => {
      await service.findAll({ action: 'PATCH /admin/users/:id/role' });
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'log.action = :action',
        expect.objectContaining({ action: 'PATCH /admin/users/:id/role' }),
      );
    });
  });
});
