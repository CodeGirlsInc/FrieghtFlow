import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { EmptyMarketplace, EmptyShipments } from './empty-state';

describe('shared empty states accessibility', () => {
  it('has no automated accessibility violations', async () => {
    const { container } = render(
      <main>
        <EmptyShipments onCreate={() => undefined} />
        <EmptyMarketplace />
      </main>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
