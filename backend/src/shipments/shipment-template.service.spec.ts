import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ShipmentTemplateService } from './shipment-template.service';
import { ShipmentTemplate } from './entities/shipment-template.entity';
import { CreateShipmentTemplateDto } from './dto/create-shipment-template.dto';

const OWNER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';

function makeDto(
  overrides: Partial<CreateShipmentTemplateDto> = {},
): CreateShipmentTemplateDto {
  return {
    name: 'Weekly Lagos route',
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Electronics',
    weightKg: 100,
    price: 5000,
    currency: 'USD',
    ...overrides,
  };
}

function makeTemplate(
  overrides: Partial<ShipmentTemplate> = {},
): ShipmentTemplate {
  return {
    id: 'template-1',
    userId: OWNER_ID,
    name: 'Weekly Lagos route',
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Electronics',
    // Postgres returns `numeric` columns as strings — the service must
    // cope with either representation.
    weightKg: 100,
    price: 5000,
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as ShipmentTemplate;
}

function mockRepo() {
  return {
    create: jest.fn<ShipmentTemplate, [Partial<ShipmentTemplate>]>(),
    save: jest.fn<Promise<ShipmentTemplate>, [ShipmentTemplate]>(),
    find: jest.fn<Promise<ShipmentTemplate[]>, [unknown]>(),
    findOne: jest.fn<Promise<ShipmentTemplate | null>, [unknown]>(),
    remove: jest.fn<Promise<ShipmentTemplate>, [ShipmentTemplate]>(),
  };
}

/** Echoes whatever `repo.create` was handed, with a generated id. */
function echoCreate(data: Partial<ShipmentTemplate>): ShipmentTemplate {
  return { id: 'template-1', ...data } as ShipmentTemplate;
}

describe('ShipmentTemplateService', () => {
  let service: ShipmentTemplateService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentTemplateService,
        {
          provide: getRepositoryToken(ShipmentTemplate),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<ShipmentTemplateService>(ShipmentTemplateService);
  });

  describe('create()', () => {
    it('persists a template owned by the authenticated user', async () => {
      const dto = makeDto();
      repo.create.mockImplementation(echoCreate);
      repo.save.mockImplementation((t) => Promise.resolve(t));

      const created = await service.create(OWNER_ID, dto);

      expect(repo.create).toHaveBeenCalledWith({
        userId: OWNER_ID,
        name: 'Weekly Lagos route',
        origin: 'Lagos',
        destination: 'Abuja',
        cargoDescription: 'Electronics',
        weightKg: 100,
        price: 5000,
        currency: 'USD',
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(created).toEqual(
        expect.objectContaining({ id: 'template-1', userId: OWNER_ID }),
      );
    });

    it('stores the template under the caller, never a client-supplied owner', async () => {
      repo.create.mockImplementation(echoCreate);
      repo.save.mockImplementation((t) => Promise.resolve(t));

      // The DTO carries no userId at all — ownership can only come from
      // the authenticated user passed as the first argument.
      await service.create(OWNER_ID, makeDto());

      const [persisted] = repo.create.mock.calls[0];
      expect(persisted).toEqual(expect.objectContaining({ userId: OWNER_ID }));
      expect(persisted).not.toHaveProperty('userId', OTHER_USER_ID);
    });

    it('defaults the currency to USD', async () => {
      repo.create.mockImplementation(echoCreate);
      repo.save.mockImplementation((t) => Promise.resolve(t));

      await service.create(OWNER_ID, makeDto({ currency: undefined }));

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'USD' }),
      );
    });

    it('maps a duplicate (user_id, name) to ConflictException', async () => {
      repo.create.mockImplementation(echoCreate);
      repo.save.mockRejectedValue(
        new QueryFailedError('INSERT', [], {
          code: '23505',
          driverError: { code: '23505' },
        } as never),
      );

      await expect(service.create(OWNER_ID, makeDto())).rejects.toThrow(
        ConflictException,
      );
    });

    it('propagates non-constraint database failures untouched', async () => {
      const boom = new Error('connection terminated');
      repo.create.mockImplementation(echoCreate);
      repo.save.mockRejectedValue(boom);

      await expect(service.create(OWNER_ID, makeDto())).rejects.toThrow(boom);
    });
  });

  describe('findAll()', () => {
    it('scopes the listing to the requesting user', async () => {
      const templates = [makeTemplate()];
      repo.find.mockResolvedValue(templates);

      await expect(service.findAll(OWNER_ID)).resolves.toEqual(templates);
      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: OWNER_ID },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne()', () => {
    it('returns a template the caller owns', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());

      await expect(service.findOne('template-1', OWNER_ID)).resolves.toEqual(
        makeTemplate(),
      );
    });

    it('rejects cross-user access', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());

      await expect(
        service.findOne('template-1', OTHER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('reports a missing template as NotFound', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing', OWNER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('applies only the supplied fields', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());
      repo.save.mockImplementation((t) => Promise.resolve(t));

      const updated = await service.update('template-1', OWNER_ID, {
        price: 7500,
      });

      expect(updated).toEqual(
        expect.objectContaining({
          id: 'template-1',
          userId: OWNER_ID,
          name: 'Weekly Lagos route',
          origin: 'Lagos',
          price: 7500,
        }),
      );
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('can rename a template', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());
      repo.save.mockImplementation((t) => Promise.resolve(t));

      const updated = await service.update('template-1', OWNER_ID, {
        name: 'Fortnightly Lagos route',
      });

      expect(updated.name).toBe('Fortnightly Lagos route');
    });

    it('never lets ownership be reassigned through the payload', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());
      repo.save.mockImplementation((t) => Promise.resolve(t));

      const updated = await service.update('template-1', OWNER_ID, {
        name: 'Renamed',
        // @ts-expect-error — userId is not part of UpdateShipmentTemplateDto
        userId: OTHER_USER_ID,
      });

      expect(updated.userId).toBe(OWNER_ID);
    });

    it('rejects cross-user updates', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());

      await expect(
        service.update('template-1', OTHER_USER_ID, { price: 1 }),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('maps a duplicate (user_id, name) to ConflictException', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());
      repo.save.mockRejectedValue(
        new QueryFailedError('UPDATE', [], {
          code: '23505',
          driverError: { code: '23505' },
        } as never),
      );

      await expect(
        service.update('template-1', OWNER_ID, { name: 'Taken' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove()', () => {
    it('deletes a template the caller owns', async () => {
      const template = makeTemplate();
      repo.findOne.mockResolvedValue(template);
      repo.remove.mockResolvedValue(template);

      await expect(
        service.remove('template-1', OWNER_ID),
      ).resolves.toBeUndefined();
      expect(repo.remove).toHaveBeenCalledWith(template);
    });

    it('rejects cross-user deletes', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());

      await expect(service.remove('template-1', OTHER_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('reports a missing template as NotFound', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('missing', OWNER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('buildShipmentFromTemplate()', () => {
    it('projects a template into a shipment draft for the owning user', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());

      const draft = await service.buildShipmentFromTemplate(
        'template-1',
        OWNER_ID,
      );

      expect(draft).toEqual({
        origin: 'Lagos',
        destination: 'Abuja',
        cargoDescription: 'Electronics',
        weightKg: 100,
        price: 5000,
        currency: 'USD',
      });
    });

    it('strips the template bookkeeping fields', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());

      const draft = await service.buildShipmentFromTemplate(
        'template-1',
        OWNER_ID,
      );

      expect(draft).not.toHaveProperty('id');
      expect(draft).not.toHaveProperty('userId');
      expect(draft).not.toHaveProperty('name');
    });

    it('coerces stringified numeric columns back to numbers', async () => {
      repo.findOne.mockResolvedValue(
        makeTemplate({
          weightKg: '100.00' as never,
          price: '5000.00' as never,
        }),
      );

      const draft = await service.buildShipmentFromTemplate(
        'template-1',
        OWNER_ID,
      );

      expect(draft.weightKg).toBe(100);
      expect(draft.price).toBe(5000);
    });

    it('rejects cross-user access', async () => {
      repo.findOne.mockResolvedValue(makeTemplate());

      await expect(
        service.buildShipmentFromTemplate('template-1', OTHER_USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── Regression guard for the original in-memory behaviour ────────────────

  describe('persistence', () => {
    it('stores templates through TypeORM rather than process-local state', async () => {
      repo.create.mockImplementation(echoCreate);
      repo.save.mockImplementation((t) => Promise.resolve(t));
      repo.find.mockResolvedValue([makeTemplate()]);

      await service.create(OWNER_ID, makeDto());
      await service.findAll(OWNER_ID);

      // A second service instance sharing the same repository sees the
      // same data — impossible with the previous in-process Map.
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: OWNER_ID },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
