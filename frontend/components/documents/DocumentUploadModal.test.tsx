import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentType } from '../../lib/api/documents.api';

const mockUpload = jest.fn();
jest.mock('../../lib/api/documents.api', () => ({
  DocumentType: {
    BILL_OF_LADING: 'bill_of_lading',
    PROOF_OF_DELIVERY: 'proof_of_delivery',
    INVOICE: 'invoice',
    CUSTOMS_DECLARATION: 'customs_declaration',
    INSURANCE_CERTIFICATE: 'insurance_certificate',
    PHOTO: 'photo',
    OTHER: 'other',
  },
  documentsApi: { upload: (...args: unknown[]) => mockUpload(...args) },
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

function renderModal(overrides: { onOpenChange?: jest.Mock } = {}) {
  return render(
    <DocumentUploadModal
      open
      onOpenChange={overrides.onOpenChange ?? jest.fn()}
      shipmentId="ship-1"
    />,
  );
}

/** The per-file document type `<select>` for a given file name. */
function fileTypeSelect(fileName: string): HTMLSelectElement {
  return screen.getByLabelText(`Document type for ${fileName}`) as HTMLSelectElement;
}

function selectDefaultType(type: DocumentType) {
  fireEvent.change(screen.getByLabelText('Default Document Type'), { target: { value: type } });
}

function queueFiles(files: File[]) {
  dropFiles(getHiddenFileInput(), files);
}

describe('DocumentUploadModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpload.mockResolvedValue({ id: 'doc-1' });
  });

  it('renders the upload dialog when open', () => {
    renderModal();
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeDisabled();
  });

  it('adds a valid file to the list and enables the Upload button', async () => {
    const user = userEvent.setup();
    renderModal();

    const validFile = makeFile('invoice.pdf', 1024, 'application/pdf');
    await user.upload(getHiddenFileInput(), validFile);

    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeEnabled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('rejects a file with a disallowed extension and does not add it to the list', () => {
    renderModal();

    const invalidFile = makeFile('script.exe', 1024, 'application/x-msdownload');
    queueFiles([invalidFile]);

    expect(screen.queryByText('script.exe')).not.toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeDisabled();
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining('unsupported file type'),
    );
  });

  it('rejects a file that exceeds the maximum size and does not add it to the list', async () => {
    const user = userEvent.setup();
    renderModal();

    const oversizedFile = makeFile('huge.pdf', 11 * 1024 * 1024, 'application/pdf');
    await user.upload(getHiddenFileInput(), oversizedFile);

    expect(screen.queryByText('huge.pdf')).not.toBeInTheDocument();
    expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('too large'));
  });

  it('adds only the valid files from a mixed multi-file selection', () => {
    renderModal();

    const valid = makeFile('ok.pdf', 1024, 'application/pdf');
    const invalid = makeFile('bad.exe', 1024, 'application/x-msdownload');
    queueFiles([valid, invalid]);

    expect(screen.getByText('ok.pdf')).toBeInTheDocument();
    expect(screen.queryByText('bad.exe')).not.toBeInTheDocument();
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });

  describe('per-file document type', () => {
    it('defaults every queued file to the modal selection in effect when it was added', () => {
      renderModal();

      selectDefaultType(DocumentType.BILL_OF_LADING);
      queueFiles([makeFile('bol.pdf', 1024, 'application/pdf')]);

      // Changing the default only affects files added *after* it changed.
      selectDefaultType(DocumentType.PHOTO);
      queueFiles([makeFile('pod.jpg', 2048, 'image/jpeg')]);

      expect(fileTypeSelect('bol.pdf')).toHaveValue(DocumentType.BILL_OF_LADING);
      expect(fileTypeSelect('pod.jpg')).toHaveValue(DocumentType.PHOTO);
    });

    it('sends each file with its own document type rather than one type for the batch', async () => {
      renderModal();
      selectDefaultType(DocumentType.BILL_OF_LADING);
      queueFiles([
        makeFile('bol.pdf', 1024, 'application/pdf'),
        makeFile('pod.jpg', 2048, 'image/jpeg'),
        makeFile('customs.pdf', 1024, 'application/pdf'),
      ]);

      fireEvent.change(fileTypeSelect('pod.jpg'), {
        target: { value: DocumentType.PROOF_OF_DELIVERY },
      });
      fireEvent.change(fileTypeSelect('customs.pdf'), {
        target: { value: DocumentType.CUSTOMS_DECLARATION },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

      await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(3));
      expect(mockUpload).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ name: 'bol.pdf' }),
        { shipmentId: 'ship-1', documentType: DocumentType.BILL_OF_LADING },
        expect.any(Function),
      );
      expect(mockUpload).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ name: 'pod.jpg' }),
        { shipmentId: 'ship-1', documentType: DocumentType.PROOF_OF_DELIVERY },
        expect.any(Function),
      );
      expect(mockUpload).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ name: 'customs.pdf' }),
        { shipmentId: 'ship-1', documentType: DocumentType.CUSTOMS_DECLARATION },
        expect.any(Function),
      );
    });

    it('changing one file’s type leaves the other files’ types untouched', () => {
      renderModal();
      selectDefaultType(DocumentType.INVOICE);
      queueFiles([
        makeFile('a.pdf', 1024, 'application/pdf'),
        makeFile('b.pdf', 1024, 'application/pdf'),
        makeFile('c.pdf', 1024, 'application/pdf'),
      ]);

      fireEvent.change(fileTypeSelect('b.pdf'), { target: { value: DocumentType.PHOTO } });

      expect(fileTypeSelect('a.pdf')).toHaveValue(DocumentType.INVOICE);
      expect(fileTypeSelect('b.pdf')).toHaveValue(DocumentType.PHOTO);
      expect(fileTypeSelect('c.pdf')).toHaveValue(DocumentType.INVOICE);
    });

    it('removing a file preserves the remaining files’ types', async () => {
      renderModal();
      queueFiles([
        makeFile('bol.pdf', 1024, 'application/pdf'),
        makeFile('invoice.pdf', 1024, 'application/pdf'),
        makeFile('pod.jpg', 2048, 'image/jpeg'),
      ]);
      fireEvent.change(fileTypeSelect('bol.pdf'), {
        target: { value: DocumentType.BILL_OF_LADING },
      });
      fireEvent.change(fileTypeSelect('pod.jpg'), {
        target: { value: DocumentType.PROOF_OF_DELIVERY },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Remove invoice.pdf' }));

      expect(screen.queryByText('invoice.pdf')).not.toBeInTheDocument();
      expect(fileTypeSelect('bol.pdf')).toHaveValue(DocumentType.BILL_OF_LADING);
      expect(fileTypeSelect('pod.jpg')).toHaveValue(DocumentType.PROOF_OF_DELIVERY);

      fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
      await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(2));
      expect(mockUpload).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ name: 'bol.pdf' }),
        { shipmentId: 'ship-1', documentType: DocumentType.BILL_OF_LADING },
        expect.any(Function),
      );
      expect(mockUpload).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ name: 'pod.jpg' }),
        { shipmentId: 'ship-1', documentType: DocumentType.PROOF_OF_DELIVERY },
        expect.any(Function),
      );
    });

    it('bulk-applies the current default to all queued files', async () => {
      renderModal();
      queueFiles([
        makeFile('a.pdf', 1024, 'application/pdf'),
        makeFile('b.pdf', 1024, 'application/pdf'),
      ]);
      fireEvent.change(fileTypeSelect('a.pdf'), { target: { value: DocumentType.PHOTO } });

      selectDefaultType(DocumentType.CUSTOMS_DECLARATION);
      fireEvent.click(screen.getByRole('button', { name: 'Apply to all files' }));

      expect(fileTypeSelect('a.pdf')).toHaveValue(DocumentType.CUSTOMS_DECLARATION);
      expect(fileTypeSelect('b.pdf')).toHaveValue(DocumentType.CUSTOMS_DECLARATION);

      fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
      await waitFor(() => expect(mockUpload).toHaveBeenCalledTimes(2));
      expect(mockUpload).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ name: 'b.pdf' }),
        { shipmentId: 'ship-1', documentType: DocumentType.CUSTOMS_DECLARATION },
        expect.any(Function),
      );
    });

    it('hides the bulk-apply control until more than one file is queued', () => {
      renderModal();
      expect(screen.queryByRole('button', { name: 'Apply to all files' })).not.toBeInTheDocument();

      queueFiles([makeFile('a.pdf', 1024, 'application/pdf')]);
      expect(screen.queryByRole('button', { name: 'Apply to all files' })).not.toBeInTheDocument();

      queueFiles([makeFile('b.pdf', 1024, 'application/pdf')]);
      expect(screen.getByRole('button', { name: 'Apply to all files' })).toBeInTheDocument();
    });
  });
});
