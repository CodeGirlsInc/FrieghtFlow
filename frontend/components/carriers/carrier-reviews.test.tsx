import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CarrierReviews } from './carrier-reviews';
import { apiClient } from '../../lib/api/client';

jest.mock('../../lib/api/client');
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockReviewsResponse = {
  data: [
    {
      id: 'r1',
      reviewerId: 'u1',
      reviewerName: 'John Doe',
      rating: 5,
      comment: 'Excellent service!',
      createdAt: '2026-08-01T12:00:00.000Z',
    },
    {
      id: 'r2',
      reviewerId: 'u2',
      reviewerName: 'Jane Smith',
      rating: 4,
      comment: 'On time, very professional.',
      createdAt: '2026-08-02T12:00:00.000Z',
    },
  ],
  total: 2,
  averageRating: 4.5,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
  page: 1,
  totalPages: 1,
};

describe('CarrierReviews Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeletons initially', () => {
    mockApiClient.mockReturnValue(new Promise(() => {})); // Never resolves
    const queryClient = createTestQueryClient();

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <CarrierReviews carrierId="c1" />
      </QueryClientProvider>
    );

    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBe(3);
  });

  it('renders reviews, distribution, and summary statistics correctly', async () => {
    mockApiClient.mockResolvedValue(mockReviewsResponse);
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <CarrierReviews carrierId="c1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('2 reviews')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Excellent service!')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('On time, very professional.')).toBeInTheDocument();

    // Verify star breakdown counts are rendered
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders empty state when there are no reviews', async () => {
    mockApiClient.mockResolvedValue({
      data: [],
      total: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      page: 1,
      totalPages: 1,
    });
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <CarrierReviews carrierId="c1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No reviews yet for this carrier.')).toBeInTheDocument();
    });
  });

  it('renders error state when api fails', async () => {
    mockApiClient.mockRejectedValue(new Error('Network Error'));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <CarrierReviews carrierId="c1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to load reviews.')).toBeInTheDocument();
    });
  });

  it('supports pagination through multiple pages', async () => {
    const paginatedResponsePage1 = {
      ...mockReviewsResponse,
      totalPages: 2,
    };
    const paginatedResponsePage2 = {
      ...mockReviewsResponse,
      page: 2,
      totalPages: 2,
      data: [
        {
          id: 'r3',
          reviewerId: 'u3',
          reviewerName: 'Bob Builder',
          rating: 3,
          comment: 'Could be better.',
          createdAt: '2026-08-03T12:00:00.000Z',
        },
      ],
    };

    mockApiClient
      .mockResolvedValueOnce(paginatedResponsePage1)
      .mockResolvedValueOnce(paginatedResponsePage2);

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <CarrierReviews carrierId="c1" />
      </QueryClientProvider>
    );

    // Page 1
    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).not.toBeDisabled();

    // Click Next to fetch page 2
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
      expect(screen.getByText('Bob Builder')).toBeInTheDocument();
      expect(screen.getByText('Could be better.')).toBeInTheDocument();
    });

    expect(mockApiClient).toHaveBeenCalledTimes(2);
    expect(mockApiClient).toHaveBeenNthCalledWith(1, '/carriers/c1/reviews?page=1&limit=5');
    expect(mockApiClient).toHaveBeenNthCalledWith(2, '/carriers/c1/reviews?page=2&limit=5');
  });
});
