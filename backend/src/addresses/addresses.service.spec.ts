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
});

describe('AddressesService', () => {
  let service: AddressesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        { provide: getRepositoryToken(Address), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(AddressesService);
    repo = module.get(getRepositoryToken(Address));
  });

  describe('create', () => {
    it('creates an address', async () => {
      const dto = { label: 'HQ', address: '1 Main St', city: 'Lagos', country: 'Nigeria' };
      const saved = { id: 'uuid', userId: 'user1', ...dto, isDefault: false };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      const result = await service.create('user1', dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });

    it('clears other defaults when isDefault=true', async () => {
      const dto = { label: 'HQ', address: '1 Main St', city: 'Lagos', country: 'Nigeria', isDefault: true };
      const saved = { id: 'uuid', userId: 'user1', ...dto };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      await service.create('user1', dto);
      expect(repo.update).toHaveBeenCalledWith({ userId: 'user1' }, { isDefault: false });
    });
  });

  describe('findAll', () => {
    it('returns addresses for user', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll('user1');
      expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user1' } }));
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('id', 'user1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when wrong owner', async () => {
      repo.findOne.mockResolvedValue({ id: 'id', userId: 'other' });
      await expect(service.findOne('id', 'user1')).rejects.toThrow(ForbiddenException);
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
