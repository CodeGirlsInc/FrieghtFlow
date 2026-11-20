import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import CarrierDashboardPage from './page';
import type { User } from '../../../types/auth.types';

// ── Auth store double ─────────────────────────────────────────────────────────
// The page only ever reads `user`/`isLoading` off the hook and calls
// `fetchCurrentUser()`, so a plain object plus a jest.fn is enough — and it lets
// the tests control exactly when (and whether) the fetch settles.
const mockFetchCurrentUser = jest.fn<Promise<void>, []>();
let mockAuthState: {
  user: User | null;
  isLoading: boolean;
  fetchCurrentUser: () => Promise<void>;
};

jest.mock('../../../stores/auth.store', () => ({
  useAuthStore: Object.assign(
    <T,>(selector?: (s: typeof mockAuthState) => T) =>
      (selector ? selector(mockAuthState) : mockAuthState),
    { getState: () => mockAuthState },
  ),
}));

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
}));

jest.mock('../../../lib/api/shipment.api', () => ({
  shipmentApi: {
    list: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    pickup: jest.fn(),
    markDelivered: jest.fn(),
  },
}));

jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

/** Mirrors AUTH_FETCH_TIMEOUT_MS in ./page. */
const AUTH_FETCH_TIMEOUT_MS = 10_000;

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: 'carrier',
    isEmailVerified: true,
    isActive: true,
    walletAddress: null,
    verificationToken: null,
    verificationTokenExpiry: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/** A promise the test resolves by hand, to model a fetch that hangs. */
function deferred(): { promise: Promise<void>; resolve: () => void; reject: (e: Error) => void } {
  let resolve!: () => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Lets the shipment-list effect's own promise chain settle inside act(). */
async function flushDataEffect() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('CarrierDashboardPage auth bootstrap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockAuthState = { user: null, isLoading: false, fetchCurrentUser: mockFetchCurrentUser };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows an accessible loading state while the auth fetch is in flight', () => {
    mockFetchCurrentUser.mockReturnValue(deferred().promise);
    render(<CarrierDashboardPage />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading…');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('renders the dashboard once a carrier user arrives', async () => {
    const user = makeUser();
    mockFetchCurrentUser.mockImplementation(async () => {
      mockAuthState = { user, isLoading: false, fetchCurrentUser: mockFetchCurrentUser };
    });

    render(<CarrierDashboardPage />);

    expect(await screen.findByRole('heading', { name: 'Carrier Dashboard' })).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, Ada/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await flushDataEffect();
  });

  it('fails visibly when the auth fetch never settles, instead of hanging on "Loading…"', () => {
    mockFetchCurrentUser.mockReturnValue(deferred().promise);
    render(<CarrierDashboardPage />);

    // Before the timeout, still loading.
    act(() => {
      jest.advanceTimersByTime(AUTH_FETCH_TIMEOUT_MS - 1);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // The timeout fires and resolves the hang into a real failure state.
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn't load your account/i);
  });

  it('offers a retry that actually calls fetchCurrentUser() again', async () => {
    const hung = deferred();
    mockFetchCurrentUser.mockReturnValueOnce(hung.promise);

    render(<CarrierDashboardPage />);
    expect(mockFetchCurrentUser).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(AUTH_FETCH_TIMEOUT_MS);
    });

    const retry = screen.getByRole('button', { name: /retry loading account/i });
    // A real accessible name, not a decorative button.
    expect(retry).toBeInTheDocument();

    // The retry is a genuine second attempt.
    mockFetchCurrentUser.mockImplementationOnce(async () => {
      mockAuthState = { user: makeUser(), isLoading: false, fetchCurrentUser: mockFetchCurrentUser };
    });
    fireEvent.click(retry);

    expect(mockFetchCurrentUser).toHaveBeenCalledTimes(2);
    expect(
      await screen.findByRole('heading', { name: 'Carrier Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await flushDataEffect();
  });

  it('returns to the loading state while a retry is in flight, then recovers', async () => {
    mockFetchCurrentUser.mockReturnValueOnce(deferred().promise);
    render(<CarrierDashboardPage />);

    act(() => {
      jest.advanceTimersByTime(AUTH_FETCH_TIMEOUT_MS);
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    mockFetchCurrentUser.mockReturnValueOnce(deferred().promise);
    fireEvent.click(screen.getByRole('button', { name: /retry loading account/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('lets a superseded attempt that settles late not clobber the current state', async () => {
    // The first attempt hangs, we retry, and the retry succeeds. The abandoned
    // first request then finally settles with no user — it must not be able to
    // knock the dashboard back to the unauthenticated redirect.
    const abandoned = deferred();
    mockFetchCurrentUser.mockReturnValueOnce(abandoned.promise);

    render(<CarrierDashboardPage />);
    act(() => {
      jest.advanceTimersByTime(AUTH_FETCH_TIMEOUT_MS);
    });

    mockFetchCurrentUser.mockImplementationOnce(async () => {
      mockAuthState = { user: makeUser(), isLoading: false, fetchCurrentUser: mockFetchCurrentUser };
    });
    fireEvent.click(screen.getByRole('button', { name: /retry loading account/i }));
    expect(await screen.findByRole('heading', { name: 'Carrier Dashboard' })).toBeInTheDocument();
    await flushDataEffect();

    // The abandoned request finally rejects.
    await act(async () => {
      abandoned.reject(new Error('network error'));
      await Promise.resolve();
    });

    expect(screen.getByRole('heading', { name: 'Carrier Dashboard' })).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects a genuinely unauthenticated visitor to sign-in, not to an error', async () => {
    mockFetchCurrentUser.mockImplementation(async () => {
      mockAuthState = { user: null, isLoading: false, fetchCurrentUser: mockFetchCurrentUser };
    });

    render(<CarrierDashboardPage />);

    // Wait for the *redirect* text specifically — the loading state is also a
    // role="status" and is still on screen until the fetch settles.
    expect(await screen.findByText(/redirecting to sign in/i)).toBeInTheDocument();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not redirect while it is still loading', () => {
    mockFetchCurrentUser.mockReturnValue(deferred().promise);
    render(<CarrierDashboardPage />);

    act(() => {
      jest.advanceTimersByTime(AUTH_FETCH_TIMEOUT_MS - 1);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects a non-carrier user to the shipper dashboard', async () => {
    mockFetchCurrentUser.mockImplementation(async () => {
      mockAuthState = { user: makeUser({ role: 'shipper' }), isLoading: false, fetchCurrentUser: mockFetchCurrentUser };
    });

    const { container } = render(<CarrierDashboardPage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
    expect(container).toBeEmptyDOMElement();
  });

  it('does not fetch when a user is already in the store', async () => {
    mockAuthState = { user: makeUser(), isLoading: false, fetchCurrentUser: mockFetchCurrentUser };
    render(<CarrierDashboardPage />);

    expect(mockFetchCurrentUser).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Carrier Dashboard' })).toBeInTheDocument();
    await flushDataEffect();
  });

  it('does not set state after unmounting mid-fetch', () => {
    const hung = deferred();
    const warn = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchCurrentUser.mockReturnValue(hung.promise);

    const { unmount } = render(<CarrierDashboardPage />);
    unmount();

    // Both the timeout and the late-settling request now land post-unmount.
    act(() => {
      jest.advanceTimersByTime(AUTH_FETCH_TIMEOUT_MS);
    });
    expect(hung.promise).toBeInstanceOf(Promise);

    // No "update on unmounted component" warning from either path.
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
