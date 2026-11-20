import React from 'react';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import ToastContainer from './ToastContainer';
import { useToastStore, type ToastType } from '../../stores/toast.store';

function resetToasts() {
  act(() => {
    useToastStore.setState({ toasts: [] });
  });
}

function addToast(type: ToastType, message: string) {
  act(() => {
    useToastStore.getState().add(type, message);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  resetToasts();
});

afterEach(() => {
  resetToasts();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('ToastContainer', () => {
  it('renders nothing visible but keeps a live region when there are no toasts', () => {
    const { container } = render(<ToastContainer />);
    const region = container.querySelector('[aria-live]');
    expect(region).toBeInTheDocument();
    expect(region).toBeEmptyDOMElement();
  });

  it('exposes toast content inside an aria-live region so assistive tech announces it', () => {
    render(<ToastContainer />);
    addToast('success', 'Shipment SHP-1 is now in transit');

    // The live region wrapper must carry a polite announcement politeness.
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();

    // The toast text must live *inside* that region, otherwise SRs never see it.
    expect(
      within(liveRegion as HTMLElement).getByText('Shipment SHP-1 is now in transit'),
    ).toBeInTheDocument();
  });

  it('marks each toast as an alert for immediate announcement', () => {
    render(<ToastContainer />);
    addToast('error', 'Delivery failed');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Delivery failed');
    // Alert sits within the polite live region wrapper.
    expect(alert.closest('[aria-live="polite"]')).not.toBeNull();
  });

  it('stacks multiple concurrent toasts, newest first', () => {
    render(<ToastContainer />);
    addToast('info', 'First');
    addToast('info', 'Second');
    addToast('info', 'Third');

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);
    expect(alerts.map((a) => a.textContent)).toEqual([
      expect.stringContaining('Third'),
      expect.stringContaining('Second'),
      expect.stringContaining('First'),
    ]);
  });

  it('dismisses a single toast without removing the others', () => {
    render(<ToastContainer />);
    addToast('info', 'Keep me');
    addToast('warning', 'Dismiss me');

    const dismissMe = screen.getByText('Dismiss me').closest('[role="alert"]') as HTMLElement;
    fireEvent.click(within(dismissMe).getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
    expect(screen.getByText('Keep me')).toBeInTheDocument();
  });

  it('auto-dismisses toasts after the timeout while leaving the live region mounted', () => {
    const { container } = render(<ToastContainer />);
    addToast('info', 'Temporary');

    expect(screen.getByText('Temporary')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Temporary')).not.toBeInTheDocument();
    // Region stays in the tree so the next announcement is picked up.
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });
});
