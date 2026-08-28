import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentUploadModal } from './DocumentUploadModal';

jest.mock('../../lib/api/client', () => ({
  apiClient: jest.fn(),
}));

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

function getHiddenFileInput(): HTMLInputElement {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

/**
 * Fires a native change event with the given files, bypassing the input's
 * `accept` attribute. userEvent.upload() simulates a real OS file picker,
 * which *does* honor `accept` and silently drops non-matching files before
 * they ever reach our code — but drag-and-drop (which this component also
 * supports) does not honor `accept` in real browsers, so the JS-level
 * validation still needs to run and be tested for those files.
 */
function dropFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, 'files', {
    value: files,
    configurable: true,
  });
  fireEvent.change(input);
}

describe('DocumentUploadModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the upload dialog when open', () => {
    render(<DocumentUploadModal open onOpenChange={jest.fn()} />);
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeDisabled();
  });

  it('adds a valid file to the list and enables the Upload button', async () => {
    const user = userEvent.setup();
    render(<DocumentUploadModal open onOpenChange={jest.fn()} />);

    const validFile = makeFile('invoice.pdf', 1024, 'application/pdf');
    await user.upload(getHiddenFileInput(), validFile);

    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeEnabled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('rejects a file with a disallowed extension and does not add it to the list', () => {
    render(<DocumentUploadModal open onOpenChange={jest.fn()} />);

    const invalidFile = makeFile('script.exe', 1024, 'application/x-msdownload');
    dropFiles(getHiddenFileInput(), [invalidFile]);

    expect(screen.queryByText('script.exe')).not.toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeDisabled();
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining('unsupported file type'),
    );
  });

  it('rejects a file that exceeds the maximum size and does not add it to the list', async () => {
    const user = userEvent.setup();
    render(<DocumentUploadModal open onOpenChange={jest.fn()} />);

    const oversizedFile = makeFile('huge.pdf', 11 * 1024 * 1024, 'application/pdf');
    await user.upload(getHiddenFileInput(), oversizedFile);

    expect(screen.queryByText('huge.pdf')).not.toBeInTheDocument();
    expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('too large'));
  });

  it('adds only the valid files from a mixed multi-file selection', () => {
    render(<DocumentUploadModal open onOpenChange={jest.fn()} />);

    const valid = makeFile('ok.pdf', 1024, 'application/pdf');
    const invalid = makeFile('bad.exe', 1024, 'application/x-msdownload');
    dropFiles(getHiddenFileInput(), [valid, invalid]);

    expect(screen.getByText('ok.pdf')).toBeInTheDocument();
    expect(screen.queryByText('bad.exe')).not.toBeInTheDocument();
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });
});
