import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OnboardingChecklist from './OnboardingChecklist';
import { apiClient } from '../../lib/api/client';

jest.mock('../../lib/api/client');
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

const DISMISS_KEY = 'onboarding_checklist_dismissed';

const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderWithClient(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const shipperProfile = {
  role: 'SHIPPER' as const,
  emailVerified: true,
  profileComplete: false,
  hasShipment: false,
  hasDocument: false,
  hasRoutePreferences: false,
  hasCertifications: false,
  hasAcceptedShipment: false,
};

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders nothing while the profile is still loading', () => {
    mockApiClient.mockReturnValue(new Promise(() => {}));
    const { container } = renderWithClient(<OnboardingChecklist />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows partial progress for an in-progress shipper', async () => {
    mockApiClient.mockResolvedValue(shipperProfile);
    renderWithClient(<OnboardingChecklist />);

    await waitFor(() =>
      expect(screen.getByText('Get started — 1/4 complete')).toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Onboarding checklist')).toBeInTheDocument();
  });

  it('shows carrier-specific steps for a CARRIER profile', async () => {
    mockApiClient.mockResolvedValue({
      ...shipperProfile,
      role: 'CARRIER' as const,
      hasRoutePreferences: true,
    });
    renderWithClient(<OnboardingChecklist />);

    await waitFor(() =>
      expect(screen.getByText('Add route preferences')).toBeInTheDocument(),
    );
    expect(screen.getByText('Accept first shipment')).toBeInTheDocument();
    expect(screen.queryByText('Create first shipment')).not.toBeInTheDocument();
  });

  it('renders nothing once every step for the role is complete', async () => {
    mockApiClient.mockResolvedValue({
      ...shipperProfile,
      profileComplete: true,
      hasShipment: true,
      hasDocument: true,
    });
    const { container } = renderWithClient(<OnboardingChecklist />);

    await waitFor(() => expect(mockApiClient).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('persists dismissal in localStorage and hides the checklist', async () => {
    mockApiClient.mockResolvedValue(shipperProfile);
    renderWithClient(<OnboardingChecklist />);

    await waitFor(() => screen.getByLabelText('Dismiss checklist'));
    fireEvent.click(screen.getByLabelText('Dismiss checklist'));

    expect(localStorage.getItem(DISMISS_KEY)).toBe('true');
    expect(screen.queryByLabelText('Onboarding checklist')).not.toBeInTheDocument();
  });

  it('stays dismissed across a remount on the same device (localStorage)', async () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    mockApiClient.mockResolvedValue(shipperProfile);
    const { container } = renderWithClient(<OnboardingChecklist />);

    await waitFor(() => expect(mockApiClient).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('fetches step completion from the server rather than local storage, so a new device sees real progress', async () => {
    // No localStorage seeding at all — completion must come from the API.
    mockApiClient.mockResolvedValue({ ...shipperProfile, hasShipment: true });
    renderWithClient(<OnboardingChecklist />);

    await waitFor(() =>
      expect(screen.getByText('Get started — 2/4 complete')).toBeInTheDocument(),
    );
    expect(mockApiClient).toHaveBeenCalledWith('/users/me/onboarding');
  });
});
