import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ShipmentMap from './ShipmentMap';

function mockGeocodeResponses(responses: unknown[]) {
  const fetchMock = jest.fn();
  responses.forEach((r) => {
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve(r),
    } as Response);
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('ShipmentMap', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a loading placeholder before geocoding resolves', () => {
    global.fetch = jest.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    render(<ShipmentMap origin="New York" destination="Los Angeles" />);

    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders an embedded map iframe once both locations geocode successfully', async () => {
    mockGeocodeResponses([
      [{ lat: '40.7128', lon: '-74.0060' }],
      [{ lat: '34.0522', lon: '-118.2437' }],
    ]);
    render(<ShipmentMap origin="New York" destination="Los Angeles" />);

    await waitFor(() =>
      expect(screen.getByTitle('Route from New York to Los Angeles')).toBeInTheDocument(),
    );
    expect(screen.getByRole('img', { name: /Map from New York to Los Angeles/i })).toBeInTheDocument();
  });

  it('shows a text-based fallback instead of a blank area when geocoding fails for one location', async () => {
    mockGeocodeResponses([
      [{ lat: '40.7128', lon: '-74.0060' }],
      [], // destination not found
    ]);
    render(<ShipmentMap origin="New York" destination="Nowhereville" />);

    await waitFor(() => expect(screen.getByText('Map unavailable')).toBeInTheDocument());
    expect(screen.getByText('New York → Nowhereville')).toBeInTheDocument();
    expect(document.querySelector('iframe')).not.toBeInTheDocument();
  });

  it('shows the text-based fallback when the geocoding request itself throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));
    render(<ShipmentMap origin="New York" destination="Los Angeles" />);

    await waitFor(() => expect(screen.getByText('Map unavailable')).toBeInTheDocument());
    expect(screen.getByText('New York → Los Angeles')).toBeInTheDocument();
  });
});
