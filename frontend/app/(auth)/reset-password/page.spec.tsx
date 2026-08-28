// frontend/app/(auth)/reset-password/page.spec.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPasswordPage from './page';

describe('ResetPasswordPage Expired Token Handling', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should display actionable error message and request new link button when token is expired or invalid', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
      ok: false,
      json: async () => ({ message: 'Token has expired or is invalid' }),
    });

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'NewPassword123!' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/link has expired or is invalid/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /request new link/i })).toBeInTheDocument();
    });
  });
});