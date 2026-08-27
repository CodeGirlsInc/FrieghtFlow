import { validate } from 'class-validator';
import { RegisterDto } from '../../auth/dto/register.dto';
import { ChangePasswordDto } from '../../auth/dto/change-password.dto';
import { ResetPasswordDto } from '../../auth/dto/reset-password.dto';
import { IsStrongPassword } from './is-strong-password.decorator';

// ── Passwords used across tests ──────────────────────────────────────────────

const VALID_PASSWORD = 'SecurePass123!';

/** Each entry is a password that should FAIL validation and the reason why. */
const WEAK_PASSWORDS: { password: string; missing: string }[] = [
  { password: 'short', missing: 'too short (< 8 chars)' },
  { password: 'onlylongpassword', missing: 'no uppercase letter' },
  { password: 'ONLYUPPERCASE1!', missing: 'no lowercase letter' },
  { password: 'NoDigitsHere!!', missing: 'no digit' },
  { password: 'NoSpecial123Ab', missing: 'no special character' },
  { password: 'Ab1!', missing: 'too short + missing chars' },
  { password: '12345678', missing: 'digits only, no letters or special' },
  { password: 'abcdefgh', missing: 'lowercase only, no digit or special' },
];

// ── Helper ───────────────────────────────────────────────────────────────────

/** Return the list of validation error messages for a given DTO instance. */
async function getValidationErrors(dto: object): Promise<string[]> {
  const errors = await validate(dto as any, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

// ── Unit tests for the decorator ─────────────────────────────────────────────

class TestDto {
  @IsStrongPassword()
  password: string;
}

describe('IsStrongPassword decorator', () => {
  it.each(WEAK_PASSWORDS)(
    'rejects "$password" ($missing)',
    async ({ password }) => {
      const dto = new TestDto();
      dto.password = password;
      const messages = await getValidationErrors(dto);
      expect(messages).toEqual(
        expect.arrayContaining([expect.stringContaining('uppercase')]),
      );
    },
  );

  it('accepts a valid strong password', async () => {
    const dto = new TestDto();
    dto.password = VALID_PASSWORD;
    const messages = await getValidationErrors(dto);
    expect(messages).toHaveLength(0);
  });

  it('accepts a password with unicode special chars', async () => {
    const dto = new TestDto();
    dto.password = 'Str0ng\u00a7Pass'; // § is non-alphanumeric
    const messages = await getValidationErrors(dto);
    expect(messages).toHaveLength(0);
  });

  it('rejects non-string values', async () => {
    const dto = new TestDto();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (dto as any).password = 12345678;
    const messages = await getValidationErrors(dto);
    expect(messages.length).toBeGreaterThan(0);
  });
});

// ── RegisterDto ──────────────────────────────────────────────────────────────

describe('RegisterDto – password policy', () => {
  function makeDto(password: string): RegisterDto {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = password;
    dto.firstName = 'Jane';
    dto.lastName = 'Doe';
    return dto;
  }

  it('accepts a valid strong password', async () => {
    const messages = await getValidationErrors(makeDto(VALID_PASSWORD));
    expect(messages).toHaveLength(0);
  });

  it.each(WEAK_PASSWORDS)(
    'rejects weak password: $missing',
    async ({ password }) => {
      const messages = await getValidationErrors(makeDto(password));
      expect(messages).toEqual(
        expect.arrayContaining([expect.stringContaining('uppercase')]),
      );
    },
  );
});

// ── ChangePasswordDto ────────────────────────────────────────────────────────

describe('ChangePasswordDto – password policy', () => {
  function makeDto(newPassword: string): ChangePasswordDto {
    const dto = new ChangePasswordDto();
    dto.currentPassword = 'OldPass123!';
    dto.newPassword = newPassword;
    return dto;
  }

  it('accepts a valid strong password', async () => {
    const messages = await getValidationErrors(makeDto(VALID_PASSWORD));
    expect(messages).toHaveLength(0);
  });

  it.each(WEAK_PASSWORDS)(
    'rejects weak new password: $missing',
    async ({ password }) => {
      const messages = await getValidationErrors(makeDto(password));
      expect(messages).toEqual(
        expect.arrayContaining([expect.stringContaining('uppercase')]),
      );
    },
  );
});

// ── ResetPasswordDto ─────────────────────────────────────────────────────────

describe('ResetPasswordDto – password policy', () => {
  function makeDto(newPassword: string): ResetPasswordDto {
    const dto = new ResetPasswordDto();
    dto.token = 'some-reset-token';
    dto.newPassword = newPassword;
    return dto;
  }

  it('accepts a valid strong password', async () => {
    const messages = await getValidationErrors(makeDto(VALID_PASSWORD));
    expect(messages).toHaveLength(0);
  });

  it.each(WEAK_PASSWORDS)(
    'rejects weak new password: $missing',
    async ({ password }) => {
      const messages = await getValidationErrors(makeDto(password));
      expect(messages).toEqual(
        expect.arrayContaining([expect.stringContaining('uppercase')]),
      );
    },
  );
});
