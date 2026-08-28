import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DisputeForm } from './DisputeForm';
import { apiClient } from '../../lib/api/client';

jest.mock('../../lib/api/client');
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

function makeFile(name: string, sizeBytes: number, type = 'application/octet-stream'): File {
  const file = new File(['x'.repeat(Math.min(sizeBytes, 1024))], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

/**
 * Fires a native change event with the given files, bypassing the input's
 * `accept` attribute (userEvent.upload() simulates a real OS file picker,
 * which honors `accept` and silently drops non-matching files before they
 * reach our validation code at all).
 */
function dropFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  fireEvent.change(input);
}

describe('DisputeForm', () => {
  beforeEach(() => {
    // resetAllMocks (not clearAllMocks) so a mockRejectedValue/mockResolvedValue
    // set by one test can't leak its implementation into the next.
    jest.resetAllMocks();
  });

  it('shows a validation error and does not submit when the reason is too short', async () => {
    const user = userEvent.setup();
    render(<DisputeForm shipmentId="s1" />);

    await user.type(screen.getByLabelText('Reason'), 'too short');
    await user.click(screen.getByText('Submit Dispute'));

    expect(
      await screen.findByText('Please describe the issue (min 10 characters)'),
    ).toBeInTheDocument();
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it('submits successfully with a valid reason and calls onSuccess', async () => {
    mockApiClient.mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<DisputeForm shipmentId="s1" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText('Reason'), 'The shipment arrived damaged.');
    await user.click(screen.getByText('Submit Dispute'));

    await waitFor(() => expect(mockApiClient).toHaveBeenCalledTimes(1));
    expect(mockApiClient).toHaveBeenCalledWith(
      '/shipments/s1/dispute',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(mockToastSuccess).toHaveBeenCalledWith('Dispute filed successfully.');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows an error toast and stays open when submission fails', async () => {
    mockApiClient.mockRejectedValue(new Error('Network error'));
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<DisputeForm shipmentId="s1" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText('Reason'), 'The shipment arrived damaged.');
    await user.click(screen.getByText('Submit Dispute'));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Network error'));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('rejects an invalid evidence attachment and does not submit', async () => {
    const user = userEvent.setup();
    render(<DisputeForm shipmentId="s1" />);

    await user.type(screen.getByLabelText('Reason'), 'The shipment arrived damaged.');
    dropFiles(screen.getByLabelText('Upload evidence files'), [
      makeFile('malware.exe', 1024, 'application/x-msdownload'),
    ]);
    await user.click(screen.getByText('Submit Dispute'));

    expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('unsupported file type'));
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it('submits successfully with a valid evidence attachment', async () => {
    mockApiClient.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<DisputeForm shipmentId="s1" />);

    await user.type(screen.getByLabelText('Reason'), 'The shipment arrived damaged.');
    await user.upload(
      screen.getByLabelText('Upload evidence files'),
      makeFile('photo.png', 1024, 'image/png'),
    );
    await user.click(screen.getByText('Submit Dispute'));

    await waitFor(() => expect(mockApiClient).toHaveBeenCalledTimes(1));
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    render(<DisputeForm shipmentId="s1" onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalled();
  });
});
