import {
  emailSchema,
  passwordSchema,
  PASSWORD_MIN_LENGTH,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} from './auth';

describe('PASSWORD_MIN_LENGTH', () => {
  it('is 8, matching the length the pages validated before the extraction', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
  });
});

describe('emailSchema', () => {
  it('accepts a normal address', () => {
    expect(emailSchema.safeParse('you@example.com').success).toBe(true);
  });

  it('reports the exact pre-refactor message for an invalid address', () => {
    const result = emailSchema.safeParse('not-an-email');
    expect(result.error?.issues[0].message).toBe('Invalid email address');
  });

  it('rejects an empty string with the same message', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Invalid email address');
  });
});

describe('passwordSchema', () => {
  it('accepts a password one character above the minimum', () => {
    expect(passwordSchema.safeParse('a'.repeat(PASSWORD_MIN_LENGTH + 1)).success).toBe(true);
  });

  it('rejects a password one character below the minimum with the pre-refactor message', () => {
    const result = passwordSchema.safeParse('a'.repeat(PASSWORD_MIN_LENGTH - 1));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Password must be at least 8 characters');
  });

  it('accepts a password exactly at the minimum length', () => {
    expect(passwordSchema.safeParse('a'.repeat(PASSWORD_MIN_LENGTH)).success).toBe(true);
  });
});

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(
      loginSchema.safeParse({ email: 'you@example.com', password: 'password123' }).success,
    ).toBe(true);
  });

  it('keeps the original per-field messages', () => {
    const result = loginSchema.safeParse({ email: 'nope', password: 'short' });
    expect(result.error?.issues.map((i) => [i.path[0], i.message])).toEqual([
      ['email', 'Invalid email address'],
      ['password', 'Password must be at least 8 characters'],
    ]);
  });
});

describe('registerSchema', () => {
  const valid = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'you@example.com',
    password: 'password123',
    role: 'shipper',
  };

  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('requires first and last name with their original messages', () => {
    const result = registerSchema.safeParse({ ...valid, firstName: '', lastName: '' });
    expect(result.error?.issues.map((i) => [i.path[0], i.message])).toEqual([
      ['firstName', 'First name is required'],
      ['lastName', 'Last name is required'],
    ]);
  });

  it('reuses the shared email and password rules verbatim', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'nope', password: 'short' });
    expect(result.error?.issues.map((i) => [i.path[0], i.message])).toEqual([
      ['email', 'Invalid email address'],
      ['password', 'Password must be at least 8 characters'],
    ]);
  });

  it('still constrains the role to the two known values', () => {
    const result = registerSchema.safeParse({ ...valid, role: 'admin' });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('only validates the email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'you@example.com' }).success).toBe(true);
    expect(Object.keys(forgotPasswordSchema.shape)).toEqual(['email']);
  });

  it('keeps the original email message', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'nope' });
    expect(result.error?.issues[0].message).toBe('Invalid email address');
  });
});

describe('changePasswordSchema', () => {
  const valid = {
    currentPassword: 'old-password',
    newPassword: 'new-password',
    confirmPassword: 'new-password',
  };

  it('accepts a matching, long-enough new password', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('requires the current password but does not impose a length on it', () => {
    const result = changePasswordSchema.safeParse({ ...valid, currentPassword: '' });
    expect(result.error?.issues.map((i) => [i.path[0], i.message])).toEqual([
      ['currentPassword', 'Current password is required'],
    ]);
    expect(
      changePasswordSchema.safeParse({ ...valid, currentPassword: 'x' }).success,
    ).toBe(true);
  });

  it('keeps its own new-password message, distinct from the shared one', () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: 'short',
      confirmPassword: 'short',
    });
    expect(result.error?.issues[0].message).toBe('New password must be at least 8 characters');
    expect(passwordSchema.safeParse('short').error?.issues[0].message).toBe(
      'Password must be at least 8 characters',
    );
  });

  it('reports a mismatch on the confirmation field', () => {
    const result = changePasswordSchema.safeParse({ ...valid, confirmPassword: 'different' });
    expect(result.error?.issues.map((i) => [i.path[0], i.message])).toEqual([
      ['confirmPassword', 'Passwords do not match'],
    ]);
  });
});
