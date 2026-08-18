import { Injectable, BadRequestException } from '@nestjs/common';

interface EtaRequest {
  origin: string;
  destination: string;
  weightKg: number;
}

interface EtaResponse {
  estimatedTransitDays: number;
  estimatedDeliveryDate: string;
}

const ZONE_MAP: Record<string, number> = {
  'US-US': 3,
  'US-CA': 4,
  'US-MX': 5,
  'EU-EU': 2,
  'EU-US': 7,
  'AS-AS': 4,
  'AS-EU': 9,
  'AS-US': 12,
};

function resolveZone(location: string): string {
  const l = location.toUpperCase();
  if (/\b(US|CA|MX|BR|AR)\b/.test(l)) return l.includes('CA') ? 'CA' : l.includes('MX') ? 'MX' : 'US';
  if (/\b(UK|DE|FR|IT|ES|NL|PL|SE)\b/.test(l)) return 'EU';
  if (/\b(CN|JP|KR|IN|SG|TH|VN)\b/.test(l)) return 'AS';
  return 'US';
}

@Injectable()
export class EtaService {
  estimate(dto: EtaRequest): EtaResponse {
    if (!dto.origin || !dto.destination || dto.weightKg <= 0) {
      throw new BadRequestException('Invalid input');
    }

    const oZone = resolveZone(dto.origin);
    const dZone = resolveZone(dto.destination);
    const key = `${oZone}-${dZone}`;
    const reverseKey = `${dZone}-${oZone}`;

    let baseDays = ZONE_MAP[key] ?? ZONE_MAP[reverseKey] ?? 7;

    // Heavy cargo adds transit time
    if (dto.weightKg > 500) baseDays += 2;
    else if (dto.weightKg > 100) baseDays += 1;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + baseDays);

    return {
      estimatedTransitDays: baseDays,
      estimatedDeliveryDate: deliveryDate.toISOString().split('T')[0],
    };
  }
}
