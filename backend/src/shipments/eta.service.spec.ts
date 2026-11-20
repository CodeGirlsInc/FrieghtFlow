import { BadRequestException } from '@nestjs/common';
import { EtaService, ShipmentZone } from './eta.service';

describe('EtaService', () => {
  const service = new EtaService();

  describe('estimate()', () => {
    it('calculates ETA based on route and cargo weight', () => {
      const result = service.estimate({
        origin: 'Lagos, Nigeria',
        destination: 'Abuja, Nigeria',
        weightKg: 120,
      });

      expect(result.estimatedTransitDays).toBeGreaterThan(0);
      expect(result.estimatedDeliveryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('charges no weight surcharge below 100kg', () => {
      const result = service.estimate({
        origin: 'Lagos, Nigeria',
        destination: 'Abuja, Nigeria',
        weightKg: 100,
      });

      expect(result.estimatedTransitDays).toBe(3);
    });

    it('adds a one-day surcharge over 100kg and two days over 500kg', () => {
      const mid = service.estimate({
        origin: 'Lagos, Nigeria',
        destination: 'Abuja, Nigeria',
        weightKg: 300,
      });
      const heavy = service.estimate({
        origin: 'Lagos, Nigeria',
        destination: 'Abuja, Nigeria',
        weightKg: 900,
      });

      expect(mid.estimatedTransitDays).toBe(4);
      expect(heavy.estimatedTransitDays).toBe(5);
    });

    // `estimatedDeliveryDate` is derived from "now", so an unfrozen clock
    // makes this flaky: crossing a midnight (or a DST boundary) mid-test
    // changes the expected date. Fake timers pin it.
    it('estimates the delivery date from today', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-03-01T09:00:00Z'));
      try {
        const result = service.estimate({
          origin: 'Lagos, Nigeria',
          destination: 'Abuja, Nigeria',
          weightKg: 10,
        });

        const expected = new Date();
        expected.setDate(expected.getDate() + result.estimatedTransitDays);

        expect(result.estimatedDeliveryDate).toBe(
          expected.toISOString().split('T')[0],
        );
        expect(result.estimatedDeliveryDate).toBe('2026-03-04');
      } finally {
        jest.useRealTimers();
      }
    });

    it('rolls the delivery date across a month boundary', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-30T12:00:00Z'));
      try {
        const result = service.estimate({
          origin: 'Lagos, Nigeria',
          destination: 'Abuja, Nigeria',
          weightKg: 10,
        });

        expect(result.estimatedDeliveryDate).toBe('2026-02-02');
      } finally {
        jest.useRealTimers();
      }
    });

    it('rejects invalid shipment inputs', () => {
      expect(() =>
        service.estimate({ origin: '', destination: 'Abuja', weightKg: 0 }),
      ).toThrow(BadRequestException);
    });

    it.each([
      ['missing origin', { origin: '', destination: 'Abuja', weightKg: 5 }],
      [
        'missing destination',
        { origin: 'Lagos', destination: '  ', weightKg: 5 },
      ],
      ['zero weight', { origin: 'Lagos', destination: 'Abuja', weightKg: 0 }],
      [
        'negative weight',
        { origin: 'Lagos', destination: 'Abuja', weightKg: -1 },
      ],
      [
        'non-finite weight',
        {
          origin: 'Lagos, Nigeria',
          destination: 'Abuja, Nigeria',
          weightKg: Number.NaN,
        },
      ],
    ])('rejects %s', (_label, dto) => {
      expect(() => service.estimate(dto)).toThrow(BadRequestException);
    });
  });

  // ── Zone resolution (issue #1545) ─────────────────────────────────────────
  //
  // The previous implementation resolved *every* unrecognised region to
  // `US`, so Nigerian and other unsupported routes were quoted US transit
  // times without any signal that the zone was wrong.

  describe('resolveLocationZone()', () => {
    it('resolves Nigerian locations to the Africa zone', () => {
      expect(service.resolveLocationZone('Lagos, Nigeria')).toBe(
        ShipmentZone.AF,
      );
      expect(service.resolveLocationZone('Abuja, Nigeria')).toBe(
        ShipmentZone.AF,
      );
      expect(service.resolveLocationZone('Lagos, NG')).toBe(ShipmentZone.AF);
      expect(service.resolveLocationZone('Lagos, NGA')).toBe(ShipmentZone.AF);
      expect(service.resolveLocationZone('Port Harcourt')).toBe(
        ShipmentZone.AF,
      );
    });

    it('resolves other African locations to the Africa zone', () => {
      expect(service.resolveLocationZone('Nairobi, Kenya')).toBe(
        ShipmentZone.AF,
      );
      expect(service.resolveLocationZone('Accra, Ghana')).toBe(ShipmentZone.AF);
      expect(service.resolveLocationZone('Cape Town, South Africa')).toBe(
        ShipmentZone.AF,
      );
      expect(service.resolveLocationZone('Africa')).toBe(ShipmentZone.AF);
    });

    it('still resolves the previously supported zones', () => {
      expect(service.resolveLocationZone('New York, US')).toBe(ShipmentZone.US);
      expect(service.resolveLocationZone('Toronto, CA')).toBe(ShipmentZone.CA);
      expect(service.resolveLocationZone('Mexico City, MX')).toBe(
        ShipmentZone.MX,
      );
      expect(service.resolveLocationZone('Frankfurt, Germany')).toBe(
        ShipmentZone.EU,
      );
      expect(service.resolveLocationZone('Shanghai, China')).toBe(
        ShipmentZone.AS,
      );
    });

    it('accepts ISO alpha-2, alpha-3 and full country names interchangeably', () => {
      expect(service.resolveLocationZone('DE')).toBe(ShipmentZone.EU);
      expect(service.resolveLocationZone('DEU')).toBe(ShipmentZone.EU);
      expect(service.resolveLocationZone('Germany')).toBe(ShipmentZone.EU);
      expect(service.resolveLocationZone('United Kingdom')).toBe(
        ShipmentZone.EU,
      );
    });

    it('matches whole tokens only, never a code inside a longer word', () => {
      // "Cape" must not read as CA (Canada) and "Delhi" must not read as DE.
      expect(service.resolveLocationZone('Cape Town, South Africa')).toBe(
        ShipmentZone.AF,
      );
      expect(service.resolveLocationZone('New Delhi, India')).toBe(
        ShipmentZone.AS,
      );
      // "AUS" (Australia) is not a supported zone and must not be guessed.
      expect(() => service.resolveLocationZone('Sydney, Australia')).toThrow(
        BadRequestException,
      );
    });

    it('rejects locations with no recognisable country or region', () => {
      expect(() => service.resolveLocationZone('Nowhereville')).toThrow(
        BadRequestException,
      );
      expect(() => service.resolveLocationZone('12345')).toThrow(
        BadRequestException,
      );
    });

    // ── Conflicting locations (issue #1545 follow-up) ─────────────────────
    //
    // First-match-wins silently priced "Lagos, Canada" as US/whatever the
    // first matching token happened to be. A location whose parts disagree
    // about the zone is a data-entry error, not a route to estimate.

    it('rejects a city and country that resolve to different zones', () => {
      // Lagos is in Africa; Canada is North America.
      expect(() => service.resolveLocationZone('Lagos, Canada')).toThrow(
        BadRequestException,
      );
      // Same class of error, reversed order.
      expect(() => service.resolveLocationZone('Toronto, Nigeria')).toThrow(
        BadRequestException,
      );
      expect(() => service.resolveLocationZone('Lagos, US')).toThrow(
        BadRequestException,
      );
    });

    it('rejects conflicting ISO codes and names', () => {
      expect(() => service.resolveLocationZone('Lagos, NG vs CA')).toThrow(
        BadRequestException,
      );
    });

    it('names every conflicting token so the caller can correct the input', () => {
      let message = '';
      try {
        service.resolveLocationZone('Lagos, Canada');
      } catch (error) {
        message = (error as Error).message;
      }

      expect(message).toContain('Conflicting location');
      expect(message).toContain('Lagos');
      expect(message).toContain('CANADA');
      expect(message).toContain(ShipmentZone.AF);
      expect(message).toContain(ShipmentZone.CA);
    });

    it('accepts a location whose tokens all agree on one zone', () => {
      // Two independent matches (city + country) that agree must not be
      // treated as a conflict.
      expect(service.resolveLocationZone('Lagos, Nigeria')).toBe(
        ShipmentZone.AF,
      );
      expect(service.resolveLocationZone('Lagos, NG')).toBe(ShipmentZone.AF);
      expect(service.resolveLocationZone('New York, US')).toBe(
        ShipmentZone.US,
      );
      expect(service.resolveLocationZone('Germany, France')).toBe(
        ShipmentZone.EU,
      );
    });

    it('does not treat a multi-word region as a conflict with its own parts', () => {
      // "South Africa" and "Africa" both map to AF.
      expect(service.resolveLocationZone('Cape Town, South Africa')).toBe(
        ShipmentZone.AF,
      );
    });

    it('rejects a conflicting route end to end rather than quoting a guess', () => {
      expect(() =>
        service.estimate({
          origin: 'Lagos, Canada',
          destination: 'Abuja, Nigeria',
          weightKg: 50,
        }),
      ).toThrow(/Conflicting location/);
    });

    it('names the offending location in the error so the caller can fix it', () => {
      expect(() => service.resolveLocationZone('Sydney, Australia')).toThrow(
        /Sydney, Australia/,
      );
    });
  });

  describe('unsupported routes', () => {
    it('does not silently quote US transit days for a Nigerian route', () => {
      const result = service.estimate({
        origin: 'Lagos, Nigeria',
        destination: 'Abuja, Nigeria',
        weightKg: 50,
      });

      expect(result.originZone).toBe(ShipmentZone.AF);
      expect(result.destinationZone).toBe(ShipmentZone.AF);
      // The old implementation resolved both to US and answered 3 days
      // for a cross-country trip; AF-AF is also 3, so assert the zones —
      // the days alone could not tell the difference.
      expect(result.estimatedTransitDays).toBe(3);
    });

    it('rejects an unresolvable location instead of defaulting to US', () => {
      expect(() =>
        service.estimate({
          origin: 'Sydney, Australia',
          destination: 'Lagos, Nigeria',
          weightKg: 50,
        }),
      ).toThrow(BadRequestException);
    });

    it('rejects a recognised zone pair that is not a served lane', () => {
      // CA → EU has no published transit rate; guessing one would be wrong.
      expect(() =>
        service.estimate({
          origin: 'Toronto, CA',
          destination: 'Paris, France',
          weightKg: 50,
        }),
      ).toThrow(/CA → EU/);
    });
  });

  describe('transitDays()', () => {
    it('preserves the published rates for previously supported zones', () => {
      expect(service.transitDays(ShipmentZone.US, ShipmentZone.US)).toBe(3);
      expect(service.transitDays(ShipmentZone.US, ShipmentZone.CA)).toBe(4);
      expect(service.transitDays(ShipmentZone.US, ShipmentZone.MX)).toBe(5);
      expect(service.transitDays(ShipmentZone.EU, ShipmentZone.EU)).toBe(2);
      expect(service.transitDays(ShipmentZone.EU, ShipmentZone.US)).toBe(7);
      expect(service.transitDays(ShipmentZone.AS, ShipmentZone.AS)).toBe(4);
      expect(service.transitDays(ShipmentZone.AS, ShipmentZone.EU)).toBe(9);
      expect(service.transitDays(ShipmentZone.AS, ShipmentZone.US)).toBe(12);
    });

    it('is symmetric in both directions', () => {
      expect(service.transitDays(ShipmentZone.CA, ShipmentZone.US)).toBe(4);
      expect(service.transitDays(ShipmentZone.MX, ShipmentZone.US)).toBe(5);
      expect(service.transitDays(ShipmentZone.US, ShipmentZone.EU)).toBe(7);
      expect(service.transitDays(ShipmentZone.EU, ShipmentZone.AS)).toBe(9);
    });

    it('serves the Africa zone against itself and every other zone', () => {
      expect(service.transitDays(ShipmentZone.AF, ShipmentZone.AF)).toBe(3);
      expect(service.transitDays(ShipmentZone.AF, ShipmentZone.EU)).toBe(8);
      expect(service.transitDays(ShipmentZone.AF, ShipmentZone.US)).toBe(10);
      expect(service.transitDays(ShipmentZone.AF, ShipmentZone.AS)).toBe(11);
    });

    it('returns null for an unserved lane rather than a default', () => {
      expect(service.transitDays(ShipmentZone.CA, ShipmentZone.EU)).toBeNull();
      expect(service.transitDays(ShipmentZone.MX, ShipmentZone.AF)).toBeNull();
    });
  });
});
