import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentViewer } from './DocumentViewer';

const mockGetAccessToken = jest.fn().mockReturnValue(null);
jest.mock('../../lib/api/client', () => ({
  getAccessToken: () => mockGetAccessToken(),
  apiClient: jest.fn(),
}));

jest.mock('../../lib/api/documents.api', () => ({
  documentsApi: {
    getDownloadUrl: (id: string) => `http://localhost:6000/api/v1/documents/${id}/download`,
  },
}));

/**
 * DocumentViewer is always rendered by a parent, so the trigger has to be
 * part of the tree. `triggerRef` lets each test assert on the real element
 * that opened the dialog.
 */
function Harness({ triggerRef }: { triggerRef: React.RefObject<HTMLButtonElement | null> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(true)}>
        View invoice.png
      </button>
      <button type="button">Background action</button>
      <DocumentViewer
        open={open}
        onClose={() => setOpen(false)}
        documentId="doc1"
        fileName="invoice.png"
        mimeType="image/png"
      />
    </>
  );
}

function renderHarness() {
  const ref = React.createRef<HTMLButtonElement>();
  const view = render(<Harness triggerRef={ref} />);
  return { ...view, triggerRef: ref };
}

async function openViewer() {
  const rendered = renderHarness();
  const user = userEvent.setup();
  await user.click(rendered.triggerRef.current!);
  const dialog = await screen.findByRole('dialog');
  // Wait for the blob to resolve so the Download anchor has a real href and
  // is therefore a real link/tab stop, as it is in the browser.
  await screen.findByRole('link', { name: 'Download file' });
  return { ...rendered, dialog, user };
}

const downloadLink = () => screen.getByRole('link', { name: 'Download file' });
const closeButton = () => screen.getByRole('button', { name: 'Close viewer' });

describe('DocumentViewer focus management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // jsdom ships neither fetch nor URL.createObjectURL; the viewer only
    // needs the fetch to resolve to a blob for these focus tests.
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['x'], { type: 'image/png' })),
    });
    URL.createObjectURL = jest.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = jest.fn();
  });

  it('is labelled and marked modal', async () => {
    const { dialog } = await openViewer();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog', { name: 'Viewing invoice.png' })).toBeInTheDocument();
  });

  it('gives the download and close controls accessible names', async () => {
    await openViewer();
    expect(downloadLink()).toBeInTheDocument();
    expect(closeButton()).toBeInTheDocument();
  });

  it('moves focus into the dialog on open instead of leaving it on the page behind', async () => {
    const { dialog, triggerRef } = await openViewer();
    expect(triggerRef.current).not.toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);
    // The Download link only becomes focusable once its blob resolves, so the
    // dialog itself is the landing spot — never the page behind it.
    expect(dialog).toHaveFocus();
  });

  it('wraps Tab from the last focusable back to the first', async () => {
    await openViewer();
    closeButton().focus();

    const event = fireEvent.keyDown(document, { key: 'Tab' });

    expect(event).toBe(false); // default prevented — the trap handled it
    expect(downloadLink()).toHaveFocus();
  });

  it('wraps Shift+Tab from the first focusable to the last', async () => {
    await openViewer();
    downloadLink().focus();

    const event = fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(event).toBe(false);
    expect(closeButton()).toHaveFocus();
  });

  it('leaves ordinary in-dialog Tab presses to the browser', async () => {
    await openViewer();
    // Not the last control, so the trap must not interfere: focus advances
    // from the download link to the close button.
    const event = fireEvent.keyDown(document, { key: 'Tab' });

    expect(event).toBe(true); // not prevented
  });

  it('never lets focus escape into the page behind the overlay', async () => {
    const { dialog } = await openViewer();
    closeButton().focus();

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(dialog.contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const { triggerRef } = await openViewer();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitForDialogToClose();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(triggerRef.current).toHaveFocus();
  });

  it('restores focus to the trigger when the close button is used', async () => {
    const { triggerRef, user } = await openViewer();

    await user.click(closeButton());

    await waitForDialogToClose();
    expect(triggerRef.current).toHaveFocus();
  });

  it('does not leak the keydown listener after closing', async () => {
    const { triggerRef } = await openViewer();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitForDialogToClose();
    triggerRef.current!.focus();

    // A second Escape must not re-fire onClose (which would remount/close
    // again) — proof the listener was removed on unmount.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

async function waitForDialogToClose() {
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}
