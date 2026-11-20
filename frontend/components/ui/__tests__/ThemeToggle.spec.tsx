// frontend/components/ui/__tests__/ThemeToggle.spec.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import '@testing-library/jest-dom';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should toggle and persist theme selection in localStorage', async () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /toggle theme/i });
    
    // Switch to dark mode
    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    // Simulate page reload by re-rendering component
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});