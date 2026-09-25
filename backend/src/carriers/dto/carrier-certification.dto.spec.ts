import { validate } from 'class-validator';
import {
  CreateCarrierCertificationDto,
  UpdateCertificationVerificationDto,
} from './carrier-certification.dto';
import { CertificationType } from '../entities/carrier-certification.entity';

const DOCUMENT_ID = '4c5e6f70-8b9a-4c1d-9e2f-1234567890ab';

function makeCreateDto(
  overrides: Partial<CreateCarrierCertificationDto> = {},
): CreateCarrierCertificationDto {
  const dto = new CreateCarrierCertificationDto();
  dto.documentType = CertificationType.OPERATING_LICENSE;
  dto.documentId = DOCUMENT_ID;
  dto.issuedBy = 'FMCSA';
  return Object.assign(dto, overrides);
}

async function errorsFor(
  dto: object,
  forbidNonWhitelisted = false,
): Promise<string[]> {
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted,
  });
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('CreateCarrierCertificationDto', () => {
  it('requires a platform document id rather than a client URL', async () => {
    const dto = makeCreateDto();
    // Simulate the old payload shape reaching the global ValidationPipe.
    (dto as unknown as { fileUrl: string }).fileUrl =
      'https://attacker.example/certificate.pdf';

    const messages = await errorsFor(dto, true);
    expect(messages).toEqual(
      expect.arrayContaining([expect.stringContaining('fileUrl')]),
    );
  });

  it('rejects a payload that only contains the legacy fileUrl', async () => {
    const dto = makeCreateDto();
    delete (dto as Partial<CreateCarrierCertificationDto>).documentId;
    (dto as unknown as { fileUrl: string }).fileUrl =
      'https://attacker.example/certificate.pdf';

    expect(await errorsFor(dto)).toEqual(
      expect.arrayContaining([expect.stringContaining('documentId')]),
    );
  });

  it('rejects a document id that is not a UUID', async () => {
    const messages = await errorsFor(
      makeCreateDto({ documentId: 'not-a-document-id' }),
    );
    expect(messages).not.toHaveLength(0);
  });

  it('accepts a future expiry date', async () => {
    const messages = await errorsFor(
      makeCreateDto({
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      }),
    );
    expect(messages).toHaveLength(0);
  });

  it('rejects a past expiry date', async () => {
    const messages = await errorsFor(
      makeCreateDto({
        expiresAt: new Date(Date.now() - 86_400_000).toISOString(),
      }),
    );
    expect(messages).toEqual(
      expect.arrayContaining([expect.stringContaining('date in the future')]),
    );
  });

  it('keeps expiry optional', async () => {
    expect(await errorsFor(makeCreateDto())).toHaveLength(0);
  });
});

describe('UpdateCertificationVerificationDto', () => {
  it('still validates the verification decision', async () => {
    const dto = new UpdateCertificationVerificationDto();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (dto as any).isVerified = 'yes';

    expect(await errorsFor(dto)).not.toHaveLength(0);
  });
});
