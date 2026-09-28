import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  manager: {
    connection: {
      createQueryRunner: jest.fn(),
    },
  },
});

const ADVISORY_LOCK_SQL = 'SELECT pg_advisory_xact_lock(hashtext($1))';

const mockQueryRunner = () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  manager: {
    query: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
  },
});

describe('AddressesService', () => {
  let service: AddressesService;
  let repo: ReturnType<typeof mockRepo>;
  let queryRunner: ReturnType<typeof mockQueryRunner>;

  beforeEach(async () => {
    queryRunner = mockQueryRunner();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: getRepositoryToken(Address),
          useFactory: () => {
            const r = mockRepo();
            r.manager.connection.createQueryRunner.mockReturnValue(queryRunner);
            return r;
          },
        },
      ],
    }).compile();

    service = module.get(AddressesService);
    repo = module.get(getRepositoryToken(Address));
  });

  describe('create', () => {
    it('creates an address', async () => {
      const dto = {
        label: 'HQ',
        address: '1 Main St',
        city: 'Lagos',
        country: 'Nigeria',
      };
      const saved = { id: 'uuid', userId: 'user1', ...dto, isDefault: false };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create('user1', dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });

    it('clears other defaults and sets the new one in one transaction', async () => {
      const dto = {
        label: 'HQ',
        address: '1 Main St',
        city: 'Lagos',
        country: 'Nigeria',
        isDefault: true,
      };
      const saved = { id: 'uuid', userId: 'user1', ...dto };
      repo.create.mockReturnValue(saved);
      queryRunner.manager.save.mockResolvedValue(saved);

      const result = await service.create('user1', dto);

      // One transaction wraps both statements.
      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalledTimes(1);

      // The advisory lock is keyed on the user, so concurrent requests for the
      // same user serialize instead of both ending up default.
      expect(queryRunner.manager.query).toHaveBeenCalledWith(ADVISORY_LOCK_SQL, [
        'address:default:user1',
      ]);

      // Both writes go through the transaction manager: writing through the
      // injected repository would escape the transaction (and the lock).
      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        Address,
        { userId: 'user1' },
        { isDefault: false },
      );
      expect(queryRunner.manager.save).toHaveBeenCalledWith(saved);
      expect(repo.update).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
      expect(result).toEqual(saved);
    });

    it('does not open a transaction when isDefault is not requested', async () => {
      const dto = {
        label: 'HQ',
        address: '1 Main St',
        city: 'Lagos',
        country: 'Nigeria',
      };
      const saved = { id: 'uuid', userId: 'user1', ...dto, isDefault: false };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      await service.create('user1', dto);

      expect(queryRunner.connect).not.toHaveBeenCalled();
      expect(queryRunner.startTransaction).not.toHaveBeenCalled();
      expect(queryRunner.manager.query).not.toHaveBeenCalled();
      expect(queryRunner.manager.update).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledWith(saved);
    });

    it('rolls back and rethrows when setting the default fails, leaving the user their old default', async () => {
      const dto = {
        label: 'HQ',
        address: '1 Main St',
        city: 'Lagos',
        country: 'Nigeria',
        isDefault: true,
      };
      const saved = { id: 'uuid', userId: 'user1', ...dto };
      repo.create.mockReturnValue(saved);
      queryRunner.manager.save.mockRejectedValue(new Error('db down'));

      await expect(service.create('user1', dto)).rejects.toThrow('db down');

      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('returns addresses for user', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll('user1');
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('id', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when wrong owner', async () => {
      repo.findOne.mockResolvedValue({ id: 'id', userId: 'other' });
      await expect(service.findOne('id', 'user1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const dto = {
      label: 'Warehouse',
      address: '2 Main St',
      city: 'Lagos',
      country: 'Nigeria',
    };

    it('clears other defaults and saves through the transaction manager', async () => {
      const address = { id: 'uuid', userId: 'user1', isDefault: false, ...dto };
      repo.findOne.mockResolvedValue(address);
      queryRunner.manager.save.mockImplementation(async (entity: unknown) => entity);

      const result = await service.update('uuid', 'user1', { isDefault: true });

      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.manager.query).toHaveBeenCalledWith(ADVISORY_LOCK_SQL, [
        'address:default:user1',
      ]);
      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        Address,
        { userId: 'user1' },
        { isDefault: false },
      );
      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'uuid', isDefault: true }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
      expect(repo.update).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ id: 'uuid', isDefault: true }));
    });

    it('rolls back and rethrows when the save fails', async () => {
      const address = { id: 'uuid', userId: 'user1', isDefault: false, ...dto };
      repo.findOne.mockResolvedValue(address);
      queryRunner.manager.save.mockRejectedValue(new Error('db down'));

      await expect(service.update('uuid', 'user1', { isDefault: true })).rejects.toThrow('db down');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('does not open a transaction or take a lock when isDefault is falsy', async () => {
      const address = { id: 'uuid', userId: 'user1', isDefault: false, ...dto };
      repo.findOne.mockResolvedValue(address);
      repo.save.mockImplementation(async (entity: unknown) => entity);

      const result = await service.update('uuid', 'user1', { label: 'New label' });

      expect(queryRunner.connect).not.toHaveBeenCalled();
      expect(queryRunner.startTransaction).not.toHaveBeenCalled();
      expect(queryRunner.manager.query).not.toHaveBeenCalled();
      expect(queryRunner.manager.update).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'uuid', label: 'New label' }),
      );
      expect(result).toEqual(expect.objectContaining({ label: 'New label' }));
    });

    it('does not re-clear defaults when the address is already the default', async () => {
      const address = { id: 'uuid', userId: 'user1', isDefault: true, ...dto };
      repo.findOne.mockResolvedValue(address);
      repo.save.mockImplementation(async (entity: unknown) => entity);

      await service.update('uuid', 'user1', { isDefault: true, label: 'Still HQ' });

      expect(queryRunner.startTransaction).not.toHaveBeenCalled();
      expect(queryRunner.manager.update).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'uuid', isDefault: true, label: 'Still HQ' }),
      );
    });

    it('throws NotFoundException before touching any default', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing', 'user1', { isDefault: true }),
      ).rejects.toThrow(NotFoundException);

      expect(queryRunner.connect).not.toHaveBeenCalled();
      expect(queryRunner.manager.update).not.toHaveBeenCalled();
      expect(queryRunner.manager.save).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException before touching any default', async () => {
      repo.findOne.mockResolvedValue({ id: 'uuid', userId: 'someone-else' });

      await expect(
        service.update('uuid', 'user1', { isDefault: true }),
      ).rejects.toThrow(ForbiddenException);

      expect(queryRunner.connect).not.toHaveBeenCalled();
      expect(queryRunner.manager.update).not.toHaveBeenCalled();
      expect(queryRunner.manager.save).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes address owned by user', async () => {
      const addr = { id: 'id', userId: 'user1' };
      repo.findOne.mockResolvedValue(addr);
      repo.remove.mockResolvedValue(undefined);
      await service.remove('id', 'user1');
      expect(repo.remove).toHaveBeenCalledWith(addr);
    });
  });
});
