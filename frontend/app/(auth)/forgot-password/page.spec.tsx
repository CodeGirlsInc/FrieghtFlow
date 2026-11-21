import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPasswordPage from './page';

describe('ForgotPasswordPage error display (#1837)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('shows the server message on a 429 instead of the success state', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 429,
      ok: false,
      json: async () => ({ statusCode: 429, message: 'Too many requests' }),
    });

    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent('Too many requests, try again in 15 minutes');
    expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
  });

  it('shows the server message for other errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
      ok: false,
      json: async () => ({ statusCode: 400, message: 'Email is required' }),
    });

    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Email is required'));
    expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
  });

  it('shows a generic retry message on network failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
    expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
  });

  it('shows the success state only on a 2xx response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ message: 'Password reset email sent' }),
    });

    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => expect(screen.getByText(/check your inbox/i)).toBeInTheDocument());
  });
});
