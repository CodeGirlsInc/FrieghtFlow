// __tests__/new-shipment-validation.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NewShipmentPage from '@/app/(dashboard)/shipments/new/page';

jest.mock('@/services/shipmentService', () => ({
  createShipment: jest.fn(),
}));

import { createShipment } from '@/services/shipmentService';

describe('NewShipmentPage Form Validation & Submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders validation errors for missing required fields on submit', async () => {
    render(<NewShipmentPage />);

    const submitButton = screen.getByRole('button', { name: /create shipment/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/origin is required/i)).toBeInTheDocument();
    expect(screen.getByText(/destination is required/i)).toBeInTheDocument();
    expect(screen.getByText(/weight must be a positive number/i)).toBeInTheDocument();
  });

  it('maps server-side validation error back to the correct form field', async () => {
    (createShipment as jest.Mock).mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: [
            { field: 'weight', error: 'weight must not exceed 50000 kg matching create-shipment.dto constraints' }
          ]
        }
      }
    });

    render(<NewShipmentPage />);

    fireEvent.change(screen.getByLabelText(/origin/i), { target: { value: 'Chicago, IL' } });
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Dallas, TX' } });
    fireEvent.change(screen.getByLabelText(/weight/i), { target: { value: '60000' } });

    fireEvent.click(screen.getByRole('button', { name: /create shipment/i }));

    await waitFor(() => {
      expect(screen.getByText(/weight must not exceed 50000 kg/i)).toBeInTheDocument();
    });
  });
});