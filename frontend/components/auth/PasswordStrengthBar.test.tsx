import React from 'react';
import { render, screen } from '@testing-library/react';
import PasswordStrengthBar from './PasswordStrengthBar';

describe('PasswordStrengthBar', () => {
  it('renders nothing when password is empty', () => {
    const { container } = render(<PasswordStrengthBar password="" />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByText(/Weak|Fair|Strong|Very Strong/i)).not.toBeInTheDocument();
  });

  it('renders Weak tier for weak passwords', () => {
    // Score <= 2 (e.g. "abc" has length 3 and only lowercase. Score = 1)
    render(<PasswordStrengthBar password="abc" />);
    expect(screen.getByText('Weak')).toBeInTheDocument();
    expect(screen.getByText('Weak')).toHaveClass('text-red-500');
  });

  it('renders Fair tier for fair passwords', () => {
    // Score === 3 (e.g. "abcABC1" has length 7 (< 8), lowercase, uppercase, and digit. Score = 3)
    render(<PasswordStrengthBar password="abcABC1" />);
    expect(screen.getByText('Fair')).toBeInTheDocument();
    expect(screen.getByText('Fair')).toHaveClass('text-orange-400');
  });

  it('renders Strong tier for strong passwords', () => {
    // Score === 4 (e.g. "abcABC12" has length 8, lowercase, uppercase, and digit. Score = 4)
    render(<PasswordStrengthBar password="abcABC12" />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
    expect(screen.getByText('Strong')).toHaveClass('text-orange-400');
  });

  it('renders Very Strong tier for very strong passwords', () => {
    // Score === 5 (e.g. "abcABC12!" has length 9, lowercase, uppercase, digit, and special char. Score = 5)
    render(<PasswordStrengthBar password="abcABC12!" />);
    expect(screen.getByText('Very Strong')).toBeInTheDocument();
    expect(screen.getByText('Very Strong')).toHaveClass('text-green-500');
  });
});
