// frontend/stores/__tests__/notification.store.spec.ts
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationStore } from '../notification.store';

describe('NotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    const store = useNotificationStore();
    expect(store).toBeDefined();
  });

  it('should maintain newest-first insertion order', () => {
    const store = useNotificationStore();
    
    store.addNotification({ id: '1', title: 'First', timestamp: 1000 });
    store.addNotification({ id: '2', title: 'Second', timestamp: 2000 });

    expect(store.notifications[0].id).toBe('2');
    expect(store.notifications[1].id).toBe('1');
  });

  it('should deduplicate notifications with the same id', () => {
    const store = useNotificationStore();

    store.addNotification({ id: '1', title: 'Event A', timestamp: 1000 });
    store.addNotification({ id: '1', title: 'Event A Duplicate', timestamp: 1500 });

    expect(store.notifications.length).toBe(1);
    expect(store.notifications[0].title).toBe('Event A Duplicate');
  });

  it('should respect maximum capacity bounds if configured', () => {
    const store = useNotificationStore();
    // Assuming max limit is set or test bounded list behavior
    for (let i = 1; i <= 150; i++) {
      store.addNotification({ id: `${i}`, title: `Event ${i}`, timestamp: i });
    }

    if (store.maxCapacity) {
      expect(store.notifications.length).toBeLessThanOrEqual(store.maxCapacity);
    }
  });
});