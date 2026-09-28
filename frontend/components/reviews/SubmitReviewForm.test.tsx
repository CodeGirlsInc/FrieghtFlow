import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitReviewForm } from './SubmitReviewForm';
import { reviewsApi } from '../../lib/api/reviews.api';

jest.mock('../../lib/api/reviews.api', () => ({
  reviewsApi: { submit: jest.fn() },
}));
const mockSubmit = reviewsApi.submit as jest.MockedFunction<typeof reviewsApi.submit>;

const mockToast = { success: jest.fn(), error: jest.fn() };
jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToast.error(...args),
    success: (...args: unknown[]) => mockToast.success(...args),
  },
}));

const stars = () => screen.getAllByRole('radio') as HTMLButtonElement[];
const star = (n: number) => screen.getByRole('radio', { name: n === 1 ? '1 star' : `${n} stars` });

/** Roving tabindex: exactly one star is in the Tab order. */
const tabStops = () => stars().filter((s) => s.tabIndex === 0);

const checkedStars = () => stars().filter((s) => s.getAttribute('aria-checked') === 'true');

beforeEach(() => {
  jest.resetAllMocks();
  mockSubmit.mockResolvedValue(undefined);
});

describe('SubmitReviewForm star radiogroup — roving tabindex (FE-193)', () => {
  it('exposes a radiogroup of five radios with human-readable names', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);

    expect(screen.getByRole('radiogroup', { name: 'Rating' })).toBeInTheDocument();
    expect(stars()).toHaveLength(5);
    expect(star(1)).toHaveAccessibleName('1 star');
    expect(star(3)).toHaveAccessibleName('3 stars');
  });

  it('is a single Tab stop — the first star is tabbable until something is selected', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);

    expect(tabStops()).toEqual([star(1)]);
  });

  it('moves the single Tab stop to the selected star after a click', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);

    fireEvent.click(star(4));

    expect(tabStops()).toEqual([star(4)]);
  });

  it('marks exactly one radio as checked, and none before a selection', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);

    expect(checkedStars()).toHaveLength(0);

    fireEvent.click(star(2));

    expect(checkedStars()).toEqual([star(2)]);
    expect(star(2)).toHaveAttribute('aria-checked', 'true');
    expect(star(1)).toHaveAttribute('aria-checked', 'false');
    expect(star(3)).toHaveAttribute('aria-checked', 'false');
  });
});

describe('SubmitReviewForm star radiogroup — arrow keys', () => {
  it('ArrowRight and ArrowDown increment, and selection follows focus', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);
    star(1).focus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });

    expect(checkedStars()).toEqual([star(2)]);
    expect(star(2)).toHaveFocus();
    expect(tabStops()).toEqual([star(2)]);

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });

    expect(checkedStars()).toEqual([star(3)]);
    expect(star(3)).toHaveFocus();
  });

  it('ArrowLeft and ArrowUp decrement', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);
    fireEvent.click(star(4));
    star(4).focus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    expect(checkedStars()).toEqual([star(3)]);
    expect(star(3)).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowUp' });
    expect(checkedStars()).toEqual([star(2)]);
    expect(star(2)).toHaveFocus();
  });

  it('clamps at the last star instead of wrapping', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);
    fireEvent.click(star(5));
    star(5).focus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    expect(checkedStars()).toEqual([star(5)]);

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    expect(checkedStars()).toEqual([star(5)]);
    expect(star(5)).toHaveFocus();
  });

  it('clamps at the first star instead of wrapping', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);
    fireEvent.click(star(1));
    star(1).focus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    expect(checkedStars()).toEqual([star(1)]);

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowUp' });
    expect(checkedStars()).toEqual([star(1)]);
    expect(star(1)).toHaveFocus();
  });

  it('Home selects the first star and End the last', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);
    fireEvent.click(star(3));
    star(3).focus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' });
    expect(checkedStars()).toEqual([star(5)]);
    expect(star(5)).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' });
    expect(checkedStars()).toEqual([star(1)]);
    expect(star(1)).toHaveFocus();
  });

  it('ignores keys that are not part of the radio pattern', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);
    fireEvent.click(star(2));

    fireEvent.keyDown(star(2), { key: 'ArrowUp', altKey: true });
    fireEvent.keyDown(star(2), { key: 'a' });
    fireEvent.keyDown(star(2), { key: 'Tab' });

    expect(checkedStars()).toEqual([star(2)]);
  });

  it('walks the whole group with ArrowRight from nothing selected', () => {
    render(<SubmitReviewForm shipmentId="s-1" />);

    star(1).focus();
    for (let expected = 2; expected <= 5; expected += 1) {
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
      expect(checkedStars()).toEqual([star(expected)]);
    }
  });
});

describe('SubmitReviewForm — mouse and submit still work (FE-193)', () => {
  it('clicking a star still selects it', async () => {
    const user = userEvent.setup();
    render(<SubmitReviewForm shipmentId="s-1" />);

    await user.click(star(4));

    expect(checkedStars()).toEqual([star(4)]);
  });

  it('submits the rating selected by the keyboard', async () => {
    const user = userEvent.setup();
    render(<SubmitReviewForm shipmentId="s-1" />);

    star(1).focus();
    fireEvent.keyDown(star(1), { key: 'ArrowRight' });
    fireEvent.keyDown(star(2), { key: 'ArrowRight' });
    await user.click(screen.getByRole('button', { name: 'Submit Review' }));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledWith('s-1', {
      rating: 3,
      comment: undefined,
    }));
  });

  it('still refuses to submit with no rating', async () => {
    const user = userEvent.setup();
    render(<SubmitReviewForm shipmentId="s-1" />);

    await user.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(mockToast.error).toHaveBeenCalledWith('Please select a star rating');
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
