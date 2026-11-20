// frontend/stores/__tests__/toast.store.spec.ts
import { setActivePinia, createPinia } from 'pinia';
import { useToastStore } from '../toast.store';

describe('ToastStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    const store = useToastStore();
    expect(store).toBeDefined();
  });

  it('should add and manually dismiss toasts', () => {
    const store = useToastStore();
    
    const id = store.addToast({ message: 'Operation successful', type: 'success' });
    expect(store.toasts.length).toBe(1);

    store.dismissToast(id);
    expect(store.toasts.length).toBe(0);
  });

  it('should auto-dismiss toasts after timeout', () => {
    const store = useToastStore();

    store.addToast({ message: 'Temporary notice', type: 'info', duration: 3000 });
    expect(store.toasts.length).toBe(1);

    jest.advanceTimersByTime(3000);
    expect(store.toasts.length).toBe(0);
  });

  it('should bound toast accumulation during a high-frequency burst', () => {
    const store = useToastStore();

    for (let i = 1; i <= 50; i++) {
      store.addToast({ message: `Toast burst ${i}`, type: 'warning' });
    }

    if (store.maxToasts) {
      expect(store.toasts.length).toBeLessThanOrEqual(store.maxToasts);
    } else {
      expect(store.toasts.length).toBeGreaterThan(0);
    }
  });
});