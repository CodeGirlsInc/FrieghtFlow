import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Shipping zones used to price transit time.
 *
 * North America is split per country because the published rates
 * distinguish domestic (US→US) from cross-border (US→CA, US→MX) moves.
 * `EU` and `AS` are multi-country regions, and `AF` covers Africa —
 * including Nigeria, which is FreightFlow's primary market.
 */
export enum ShipmentZone {
  US = 'US',
  CA = 'CA',
  MX = 'MX',
  EU = 'EU',
  AS = 'AS',
  AF = 'AF',
}

export interface EtaRequest {
  origin: string;
  destination: string;
  weightKg: number;
}

export interface EtaResponse {
  estimatedTransitDays: number;
  /** ISO-8601 calendar date (UTC), `YYYY-MM-DD`. */
  estimatedDeliveryDate: string;
  originZone: ShipmentZone;
  destinationZone: ShipmentZone;
}

/**
 * Baseline transit days per zone pair. Routes are direction-agnostic: a
 * lookup falls back to the reversed key, so only one direction needs to be
 * listed. A pair that is absent here is NOT servable — `estimate()` throws
 * rather than guessing a duration.
 */
const ZONE_MAP: Readonly<Record<string, number>> = Object.freeze({
  // North America
  'US-US': 3,
  'US-CA': 4,
  'US-MX': 5,

  // Europe
  'EU-EU': 2,

  // Asia
  'AS-AS': 4,

  // Africa
  'AF-AF': 3,

  // Inter-zone
  'US-EU': 7,
  'US-AS': 12,
  'US-AF': 10,
  'EU-AS': 9,
  'EU-AF': 8,
  'AS-AF': 11,
});

/**
 * Country / region tokens → zone.
 *
 * Keys are matched against whole, upper-cased tokens of the location
 * string, so an entry can never fire from inside a longer word (the old
 * implementation matched bare `US`/`IN`/`IT` substrings against free text
 * and mis-classified routes as a result). Both ISO 3166-1 alpha-2 and
 * alpha-3 codes are accepted, plus the English country/region names that
 * shippers actually type.
 */
const LOCATION_TOKENS: Readonly<Record<string, ShipmentZone>> = Object.freeze({
  // ── North America ──────────────────────────────────────────────────────
  US: ShipmentZone.US,
  USA: ShipmentZone.US,
  'UNITED STATES': ShipmentZone.US,
  'UNITED STATES OF AMERICA': ShipmentZone.US,
  AMERICA: ShipmentZone.US,
  CA: ShipmentZone.CA,
  CAN: ShipmentZone.CA,
  CANADA: ShipmentZone.CA,
  MX: ShipmentZone.MX,
  MEX: ShipmentZone.MX,
  MEXICO: ShipmentZone.MX,

  // ── Europe ─────────────────────────────────────────────────────────────
  EU: ShipmentZone.EU,
  EUROPE: ShipmentZone.EU,
  UK: ShipmentZone.EU,
  GB: ShipmentZone.EU,
  GBR: ShipmentZone.EU,
  'UNITED KINGDOM': ShipmentZone.EU,
  DE: ShipmentZone.EU,
  DEU: ShipmentZone.EU,
  GERMANY: ShipmentZone.EU,
  FR: ShipmentZone.EU,
  FRA: ShipmentZone.EU,
  FRANCE: ShipmentZone.EU,
  IT: ShipmentZone.EU,
  ITA: ShipmentZone.EU,
  ITALY: ShipmentZone.EU,
  ES: ShipmentZone.EU,
  ESP: ShipmentZone.EU,
  SPAIN: ShipmentZone.EU,
  NL: ShipmentZone.EU,
  NLD: ShipmentZone.EU,
  NETHERLANDS: ShipmentZone.EU,
  PL: ShipmentZone.EU,
  POL: ShipmentZone.EU,
  POLAND: ShipmentZone.EU,
  SE: ShipmentZone.EU,
  SWE: ShipmentZone.EU,
  SWEDEN: ShipmentZone.EU,
  BE: ShipmentZone.EU,
  BEL: ShipmentZone.EU,
  BELGIUM: ShipmentZone.EU,

  // ── Asia ───────────────────────────────────────────────────────────────
  AS: ShipmentZone.AS,
  ASIA: ShipmentZone.AS,
  CN: ShipmentZone.AS,
  CHN: ShipmentZone.AS,
  CHINA: ShipmentZone.AS,
  JP: ShipmentZone.AS,
  JPN: ShipmentZone.AS,
  JAPAN: ShipmentZone.AS,
  KR: ShipmentZone.AS,
  KOR: ShipmentZone.AS,
  'SOUTH KOREA': ShipmentZone.AS,
  IN: ShipmentZone.AS,
  IND: ShipmentZone.AS,
  INDIA: ShipmentZone.AS,
  SG: ShipmentZone.AS,
  SGP: ShipmentZone.AS,
  SINGAPORE: ShipmentZone.AS,
  TH: ShipmentZone.AS,
  THA: ShipmentZone.AS,
  THAILAND: ShipmentZone.AS,
  VN: ShipmentZone.AS,
  VNM: ShipmentZone.AS,
  VIETNAM: ShipmentZone.AS,
  AE: ShipmentZone.AS,
  ARE: ShipmentZone.AS,
  'UNITED ARAB EMIRATES': ShipmentZone.AS,
  DUBAI: ShipmentZone.AS,

  // ── Africa ─────────────────────────────────────────────────────────────
  AF: ShipmentZone.AF,
  AFRICA: ShipmentZone.AF,
  NG: ShipmentZone.AF,
  NGA: ShipmentZone.AF,
  NIGERIA: ShipmentZone.AF,
  GH: ShipmentZone.AF,
  GHA: ShipmentZone.AF,
  GHANA: ShipmentZone.AF,
  KE: ShipmentZone.AF,
  KEN: ShipmentZone.AF,
  KENYA: ShipmentZone.AF,
  ZA: ShipmentZone.AF,
  ZAF: ShipmentZone.AF,
  'SOUTH AFRICA': ShipmentZone.AF,
  EG: ShipmentZone.AF,
  EGY: ShipmentZone.AF,
  EGYPT: ShipmentZone.AF,
  MA: ShipmentZone.AF,
  MAR: ShipmentZone.AF,
  MOROCCO: ShipmentZone.AF,
  TN: ShipmentZone.AF,
  TUN: ShipmentZone.AF,
  TUNISIA: ShipmentZone.AF,
  ET: ShipmentZone.AF,
  ETH: ShipmentZone.AF,
  ETHIOPIA: ShipmentZone.AF,
});

/**
 * Major freight hubs that carry no country token of their own (a city on
 * its own, e.g. "Lagos"). Kept deliberately small — it exists so the
 * common single-city inputs resolve, not to act as a gazetteer. Anything
 * not listed here and not carrying a recognised country token is rejected.
 */
const CITY_TOKENS: Readonly<Record<string, ShipmentZone>> = Object.freeze({
  // Nigeria
  LAGOS: ShipmentZone.AF,
  ABUJA: ShipmentZone.AF,
  KANO: ShipmentZone.AF,
  'PORT HARCOURT': ShipmentZone.AF,
  WARRI: ShipmentZone.AF,
  IBADAN: ShipmentZone.AF,

  // North America
  'NEW YORK': ShipmentZone.US,
  'LOS ANGELES': ShipmentZone.US,
  CHICAGO: ShipmentZone.US,
  HOUSTON: ShipmentZone.US,
  SEATTLE: ShipmentZone.US,
  TORONTO: ShipmentZone.CA,
  VANCOUVER: ShipmentZone.CA,

  // Europe
  LONDON: ShipmentZone.EU,
  PARIS: ShipmentZone.EU,
  BERLIN: ShipmentZone.EU,
  MADRID: ShipmentZone.EU,
  AMSTERDAM: ShipmentZone.EU,

  // Asia
  SHANGHAI: ShipmentZone.AS,
  TOKYO: ShipmentZone.AS,
  MUMBAI: ShipmentZone.AS,
});

/** Splits free-form location text into comparable upper-case tokens. */
function tokenize(location: string): string[] {
  return (
    location
      .toUpperCase()
      // Treat "/", "-", "." and "_" as separators so "MEXICO-CITY" tokenizes
      // the same way as "Mexico City".
      .replace(/[._/-]+/g, ' ')
      .split(/[^A-Z]+/)
      .filter(Boolean)
  );
}

/** The longest multi-word place name either table can hold. */
const MAX_PLACE_PHRASE_TOKENS = 3;

interface ZoneMatch {
  zone: ShipmentZone;
  /** The exact text that matched, for error messages. */
  phrase: string;
  kind: 'city' | 'country';
}

/**
 * Every zone the location's tokens resolve to, tagged with what matched.
 *
 * Longer phrases are considered first so "South Africa" is not shadowed by
 * "Africa", and each token window is scanned at most once per length, so a
 * single location can legitimately yield several *agreeing* matches
 * ("Lagos, Nigeria" → AF from both the city and the country).
 */
function collectZoneMatches(location: string): ZoneMatch[] {
  const tokens = tokenize(location);
  const matches: ZoneMatch[] = [];
  const seenPhrases = new Set<string>();

  for (const [table, kind] of [
    [CITY_TOKENS, 'city'],
    [LOCATION_TOKENS, 'country'],
  ] as const) {
    for (
      let length = MAX_PLACE_PHRASE_TOKENS;
      length >= 1;
      length -= 1
    ) {
      for (let start = 0; start + length <= tokens.length; start += 1) {
        const phrase = tokens.slice(start, start + length).join(' ');
        // A phrase already matched by the city table must not be
        // re-reported by the country table.
        if (seenPhrases.has(phrase)) continue;
        const zone = table[phrase];
        if (zone) {
          seenPhrases.add(phrase);
          matches.push({ zone, phrase, kind });
        }
      }
    }
  }

  return matches;
}

/**
 * Resolves a free-form location ("Lagos, Nigeria", "US", "Frankfurt DE")
 * to a shipping zone.
 *
 * Only whole-token matches count, which is what keeps a location like
 * "Cape Town" or "Indianapolis" from being mis-read as a country code.
 *
 * When the tokens disagree about the zone — "Lagos, Canada" names a city in
 * one zone and a country in another — this rejects the input rather than
 * picking whichever token happened to be scanned first. Guessing there means
 * quoting the wrong transit time with no signal that anything was wrong.
 *
 * @throws BadRequestException when the location carries no recognised
 *   country/region/city token, or when its recognised tokens resolve to
 *   more than one zone.
 */
function resolveZone(location: string): ShipmentZone {
  const matches = collectZoneMatches(location);

  if (matches.length === 0) {
    throw new BadRequestException(
      `Unsupported location "${location}": no supported shipping zone could be determined. ` +
        `Provide a location including a country code or country name (e.g. "Lagos, Nigeria").`,
    );
  }

  const distinct = new Set(matches.map((match) => match.zone));
  if (distinct.size > 1) {
    const detail = matches
      .map((match) => `"${match.phrase}" → ${match.zone} (${match.kind})`)
      .join(', ');
    throw new BadRequestException(
      `Conflicting location "${location}": it resolves to more than one shipping zone ` +
        `(${detail}). Provide a location whose parts agree on a single zone.`,
    );
  }

  return matches[0].zone;
}

@Injectable()
export class EtaService {
  estimate(dto: EtaRequest): EtaResponse {
    this.assertValidRequest(dto);

    const oZone = resolveZone(dto.origin);
    const dZone = resolveZone(dto.destination);

    const laneDays = this.transitDays(oZone, dZone);
    if (laneDays === null) {
      throw new BadRequestException(
        `No transit estimate is available for route ${oZone} → ${dZone}`,
      );
    }

    let baseDays = laneDays;

    // Heavy cargo adds transit time
    if (dto.weightKg > 500) baseDays += 2;
    else if (dto.weightKg > 100) baseDays += 1;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + baseDays);

    return {
      estimatedTransitDays: baseDays,
      estimatedDeliveryDate: deliveryDate.toISOString().split('T')[0],
      originZone: oZone,
      destinationZone: dZone,
    };
  }

  /**
   * Transit days for a zone pair, or `null` when the lane is not served.
   * Routes are symmetric — the reversed key is consulted when the direct
   * one is absent.
   */
  transitDays(from: ShipmentZone, to: ShipmentZone): number | null {
    return ZONE_MAP[`${from}-${to}`] ?? ZONE_MAP[`${to}-${from}`] ?? null;
  }

  /**
   * Resolves a free-form location to its shipping zone. Exposed so callers
   * can validate/display a zone without running a full estimate.
   *
   * @throws BadRequestException when the location cannot be resolved.
   */
  resolveLocationZone(location: string): ShipmentZone {
    return resolveZone(location);
  }

  private assertValidRequest(dto: EtaRequest): void {
    const hasText = (value: unknown): value is string =>
      typeof value === 'string' && value.trim().length > 0;

    if (!hasText(dto?.origin) || !hasText(dto?.destination)) {
      throw new BadRequestException(
        'origin and destination are required and must be non-empty strings',
      );
    }
    if (
      typeof dto.weightKg !== 'number' ||
      !Number.isFinite(dto.weightKg) ||
      dto.weightKg <= 0
    ) {
      throw new BadRequestException(
        'weightKg must be a positive, finite number',
      );
    }
  }
}
