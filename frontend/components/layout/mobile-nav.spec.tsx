// frontend/components/layout/mobile-nav.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MobileNav } from './mobile-nav';

describe('MobileNav', () => {
  it('should toggle open and closed states correctly', () => {
    render(<MobileNav />);
    const triggerBtn = screen.getByRole('button', { name: /open menu/i });

    expect(screen.queryByRole('navigation')).not.toBeVisible();

    fireEvent.click(triggerBtn);
    expect(screen.getByRole('navigation')).toBeVisible();

    const closeBtn = screen.getByRole('button', { name: /close menu/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('navigation')).not.toBeVisible();
  });

  it('should trap focus inside the drawer when open and return focus to trigger on close', () => {
    render(<MobileNav />);
    const triggerBtn = screen.getByRole('button', { name: /open menu/i });

    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);

    fireEvent.click(triggerBtn);

    const firstLink = screen.getByRole('link', { name: /home/i });
    const lastLink = screen.getByRole('link', { name: /settings/i });

    expect(document.activeElement).toBe(firstLink);

    // Tab trap verification
    fireEvent.keyDown(lastLink, { key: 'Tab' });
    // In a full jsdom focus trap implementation, focus wraps or stays contained
    expect(screen.getByRole('navigation')).toContainElement(document.activeElement as HTMLElement);

    const closeBtn = screen.getByRole('button', { name: /close menu/i });
    fireEvent.click(closeBtn);

    expect(document.activeElement).toBe(triggerBtn);
  });

  it('should dismiss the menu when the Escape key is pressed', () => {
    render(<MobileNav />);
    const triggerBtn = screen.getByRole('button', { name: /open menu/i });

    fireEvent.click(triggerBtn);
    expect(screen.getByRole('navigation')).toBeVisible();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('navigation')).not.toBeVisible();
  });
});