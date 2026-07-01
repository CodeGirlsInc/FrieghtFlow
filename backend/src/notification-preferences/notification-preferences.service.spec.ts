import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationPreferences } from './entities/notification-preferences.entity';

const defaultPrefs = (userId = 'user1'): Partial<NotificationPreferences> => ({
  id: 'pref1',
  userId,
  shipmentAccepted: true,
  shipmentInTransit: true,
  shipmentDelivered: true,
  shipmentCompleted: true,
  shipmentCancelled: true,
  shipmentDisputed: true,
  disputeResolved: true,
});

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('NotificationPreferencesService', () => {
  let service: NotificationPreferencesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferencesService,
        {
          provide: getRepositoryToken(NotificationPreferences),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get(NotificationPreferencesService);
    repo = module.get(getRepositoryToken(NotificationPreferences));
  });

  describe('getOrCreate', () => {
    it('returns existing preferences', async () => {
      repo.findOne.mockResolvedValue(defaultPrefs());
      const result = await service.getOrCreate('user1');
      expect(result.userId).toBe('user1');
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('creates preferences if none exist', async () => {
      repo.findOne.mockResolvedValue(null);
      const prefs = defaultPrefs();
      repo.create.mockReturnValue(prefs);
      repo.save.mockResolvedValue(prefs);

      const result = await service.getOrCreate('user1');
      expect(repo.create).toHaveBeenCalledWith({ userId: 'user1' });
      expect(result).toEqual(prefs);
    });
  });

  describe('update', () => {
    it('updates preferences', async () => {
      const prefs = defaultPrefs();
      repo.findOne.mockResolvedValue(prefs);
      repo.save.mockResolvedValue({ ...prefs, shipmentAccepted: false });

      const result = await service.update('user1', { shipmentAccepted: false });
      expect(result.shipmentAccepted).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('returns true for enabled preference', async () => {
      repo.findOne.mockResolvedValue(defaultPrefs());
      const result = await service.isEnabled('user1', 'shipmentAccepted');
      expect(result).toBe(true);
    });

    it('returns false for disabled preference', async () => {
      repo.findOne.mockResolvedValue({ ...defaultPrefs(), shipmentDisputed: false });
      const result = await service.isEnabled('user1', 'shipmentDisputed');
      expect(result).toBe(false);
    });
  });
});
