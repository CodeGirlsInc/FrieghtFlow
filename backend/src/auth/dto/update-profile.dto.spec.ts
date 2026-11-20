import { validate } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

const VALID_PUBLIC_KEY =
  'GAGD6MFNQ5IZQQQW6MOS6JWZALYR5P7ITCZP3NUQPNYLHWYBQVC6NNXB';

async function getValidationErrors(dto: object): Promise<string[]> {
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('UpdateProfileDto', () => {
  it('accepts a valid Stellar Ed25519 public key', async () => {
    const dto = new UpdateProfileDto();
    dto.walletAddress = VALID_PUBLIC_KEY;

    expect(await getValidationErrors(dto)).toHaveLength(0);
  });

  it.each([
    'not-a-stellar-key',
    'SAGD6MFNQ5IZQQQW6MOS6JWZALYR5P7ITCZP3NUQPNYLHWYBQVC6NNXB',
    'GAGD6MFNQ5IZQQQW6MOS6JWZALYR5P7ITCZP3NUQPNYLHWYBQVC6NNX',
    // Same length/prefix as the valid key, but with a bad checksum.
    'GAGD6MFNQ5IZQQQW6MOS6JWZALYR5P7ITCZP3NUQPNYLHWYBQVC6NNXC',
  ])('rejects invalid Stellar public key %s', async (walletAddress) => {
    const dto = new UpdateProfileDto();
    dto.walletAddress = walletAddress;

    const messages = await getValidationErrors(dto);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('valid Stellar Ed25519 public key'),
      ]),
    );
  });

  it('keeps the field optional when it is omitted or null', async () => {
    const omitted = new UpdateProfileDto();
    const cleared = new UpdateProfileDto();
    cleared.walletAddress = null;

    expect(await getValidationErrors(omitted)).toHaveLength(0);
    expect(await getValidationErrors(cleared)).toHaveLength(0);
  });

  it('rejects non-string values when the field is supplied', async () => {
    const dto = new UpdateProfileDto();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (dto as any).walletAddress = 123;

    expect(await getValidationErrors(dto)).not.toHaveLength(0);
  });
});
