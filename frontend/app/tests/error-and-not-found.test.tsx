// __tests__/error-and-not-found.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import GlobalError from '@/app/error';
import NotFound from '@/app/not-found';

describe('Global Error and Not-Found Boundaries', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('NotFound (app/not-found.tsx)', () => {
    it('renders helpful 404 messaging and action links', () => {
      render(<NotFound />);
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument();
    });
  });

  describe('GlobalError (app/error.tsx)', () => {
    const mockError = new Error('Database connection failed at pg_connect (/var/app/db.ts:42:11)');
    const mockReset = jest.fn();

    it('renders generic message and hides raw error details in production', () => {
      process.env.NODE_ENV = 'production';
      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText(/database connection failed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\/var\/app\/db\.ts/i)).not.toBeInTheDocument();
    });

    it('exposes error message in development mode for debugging', () => {
      process.env.NODE_ENV = 'development';
      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(screen.getByText(/database connection failed/i)).toBeInTheDocument();
    });
  });
});