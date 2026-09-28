import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './pagination';

function renderPagination(overrides: Partial<React.ComponentProps<typeof Pagination>> = {}) {
  const onPageChange = jest.fn();
  render(
    <Pagination
      page={2}
      totalPages={7}
      currentCount={20}
      total={134}
      itemLabel="users"
      onPageChange={onPageChange}
      label="Users pagination"
      {...overrides}
    />,
  );
  return { onPageChange };
}

describe('Pagination', () => {
  it('renders a labelled nav landmark with a polite live region', () => {
    renderPagination();

    const nav = screen.getByRole('navigation', { name: 'Users pagination' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('names the items in the caption and states the page position', () => {
    renderPagination();

    const caption = screen.getByRole('status');
    expect(caption).toHaveTextContent('Showing 20 of 134 users (page 2 of 7)');
  });

  it('uses whatever noun the caller passes', () => {
    renderPagination({ itemLabel: 'disputes', currentCount: 3, total: 41 });

    expect(screen.getByRole('status')).toHaveTextContent('Showing 3 of 41 disputes (page 2 of 7)');
  });

  it('disables Previous on the first page and Next on the last', () => {
    const onPageChange = jest.fn();
    const { unmount } = render(
      <Pagination
        page={1}
        totalPages={3}
        currentCount={20}
        total={55}
        itemLabel="shipments"
        onPageChange={onPageChange}
        label="Shipments pagination"
      />,
    );

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    unmount();

    renderPagination({ page: 7, currentCount: 14, total: 134 });

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
  });

  it('marks the current page with aria-current and navigates from the page list', () => {
    const { onPageChange } = renderPagination();

    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Page 3' })).not.toHaveAttribute('aria-current');

    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('collapses long result sets into a window with the first and last page reachable', () => {
    renderPagination({ page: 10, totalPages: 40 });

    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 40' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 8' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Page 4' })).not.toBeInTheDocument();
  });

  it('lists every page control in a list', () => {
    renderPagination({ page: 1, totalPages: 3 });

    const list = screen.getByRole('navigation', { name: 'Users pagination' }).querySelector(
      'ul',
    );
    expect(list).toBeInTheDocument();
    // Previous + one button per page + Next
    expect(list!.querySelectorAll('li')).toHaveLength(5);
  });
});
