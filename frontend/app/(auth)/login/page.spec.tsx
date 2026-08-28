// frontend/app/(auth)/login/page.spec.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';

describe('LoginPage Rate Limiting', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should display specific throttle error message when receiving a 429 response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 429,
      ok: false,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/too many attempts, please try again in 60 seconds/i)).toBeInTheDocument();
    });
  });
});