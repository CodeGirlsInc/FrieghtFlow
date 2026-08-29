import { render, screen } from '@testing-library/react';
import { EmptyMarketplace, EmptyShipments } from './empty-state';

describe('shared empty states', () => {
  it('renders the shipment primitive with contextual copy and action', () => {
    const onCreate = jest.fn();
    render(
      <EmptyShipments
        title="No completed shipments"
        description="Completed shipments will appear here."
        onCreate={onCreate}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No completed shipments' })).toBeInTheDocument();
    expect(screen.getByText('Completed shipments will appear here.')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Create your first shipment' }).click();
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('renders the marketplace primitive', () => {
    render(<EmptyMarketplace />);
    expect(screen.getByRole('heading', { name: 'No available shipments' })).toBeInTheDocument();
  });
});