import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationPreferencesService } from './notification-preferences.service';
import {
  NotificationChannel,
  NotificationEventType,
  NotificationPreference,
} from './entities/notification-preference.entity';

const EVENT_TYPES = Object.values(NotificationEventType);
const CHANNELS = Object.values(NotificationChannel);

function buildDefaults(userId = 'user-1'): NotificationPreference[] {
  return EVENT_TYPES.flatMap((eventType) =>
    CHANNELS.map((channel) =>
      Object.assign(new NotificationPreference(), { id: `${eventType}-${channel}`, userId, eventType, channel, enabled: true }),
    ),
  );
}

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((dto: Partial<NotificationPreference>) => Object.assign(new NotificationPreference(), dto)),
  save: jest.fn(async (entity: NotificationPreference | NotificationPreference[]) => entity),
});

describe('NotificationPreferencesService', () => {
  let service: NotificationPreferencesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferencesService,
        { provide: getRepositoryToken(NotificationPreference), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(NotificationPreferencesService);
    repo = module.get(getRepositoryToken(NotificationPreference));
  });

  describe('getPreferences – default creation', () => {
    it('returns existing preferences when they exist', async () => {
      const existing = buildDefaults();
      repo.find.mockResolvedValue(existing);
      const result = await service.getPreferences('user-1');
      expect(result).toHaveLength(existing.length);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('creates defaults (all enabled) when no preferences exist', async () => {
      repo.find
        .mockResolvedValueOnce([])          // first call: empty → triggers creation
        .mockResolvedValueOnce(buildDefaults()); // second call: after save
      repo.save.mockResolvedValue(buildDefaults());

      const result = await service.getPreferences('user-1');
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result.every((p) => p.enabled)).toBe(true);
    });
  });

  describe('updatePreferences – bulk update', () => {
    it('updates existing preferences', async () => {
      const existing = buildDefaults();
      const target = existing[0];
      repo.find.mockResolvedValue(existing);
      repo.findOne.mockResolvedValue(target);
      repo.save.mockResolvedValue({ ...target, enabled: false });

      await service.updatePreferences('user-1', {
        preferences: [{ eventType: target.eventType, channel: target.channel, enabled: false }],
      });

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    });

    it('creates a new preference record when it does not exist yet', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.find.mockResolvedValue(buildDefaults());

      await service.updatePreferences('user-1', {
        preferences: [
          { eventType: NotificationEventType.BID_PLACED, channel: NotificationChannel.PUSH, enabled: false },
        ],
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false }),
      );
    });
  });
});
