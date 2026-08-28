import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProfilePage from './page';
import { useAuthStore } from '../../../stores/auth.store';
import { updateProfile } from '../../../lib/api/auth.api';
import type { User } from '../../../types/auth.types';

jest.mock('../../../lib/api/auth.api', () => ({
  updateProfile: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockUpdateProfile = updateProfile as jest.Mock;

const user: User = {
  id: 'u-1',
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'shipper',
  isEmailVerified: true,
  isActive: true,
  walletAddress: null,
  verificationToken: null,
  verificationTokenExpiry: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const VALID_STELLAR = 'G' + 'A'.repeat(55);
const WALLET_ERROR = 'Invalid Stellar address (must start with G and be 56 characters)';

beforeEach(() => {
  jest.clearAllMocks();
  act(() => {
    useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
  });
  mockUpdateProfile.mockResolvedValue(user);
});

describe('/profile — the canonical profile editor', () => {
  it('is the single place to edit name and wallet, alongside read-only account details', () => {
    render(<ProfilePage />);

    // Editable
    expect(screen.getByLabelText('First name')).toHaveValue('Jane');
    expect(screen.getByLabelText('Last name')).toHaveValue('Doe');
    expect(screen.getByLabelText(/Stellar wallet address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save changes/i })).toBeInTheDocument();

    // Read-only identity
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('shipper')).toBeInTheDocument();
  });

  it('rejects a malformed Stellar wallet address', async () => {
    render(<ProfilePage />);

    fireEvent.change(screen.getByLabelText(/Stellar wallet address/i), {
      target: { value: 'not-a-real-key' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(await screen.findByText(WALLET_ERROR)).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('accepts a well-formed Stellar wallet address and submits it', async () => {
    mockUpdateProfile.mockResolvedValue({ ...user, walletAddress: VALID_STELLAR });
    render(<ProfilePage />);

    fireEvent.change(screen.getByLabelText(/Stellar wallet address/i), {
      target: { value: VALID_STELLAR },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ walletAddress: VALID_STELLAR }),
      ),
    );
    expect(screen.queryByText(WALLET_ERROR)).not.toBeInTheDocument();
  });

  it('treats an empty wallet field as "no wallet" (optional), not an error', async () => {
    render(<ProfilePage />);

    // Make the form dirty via a name change, leave wallet blank.
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Janet' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledTimes(1));
    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Janet', walletAddress: undefined }),
    );
    expect(screen.queryByText(WALLET_ERROR)).not.toBeInTheDocument();
  });
});
