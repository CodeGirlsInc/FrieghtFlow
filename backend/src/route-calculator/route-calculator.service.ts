import { Injectable } from '@nestjs/common';

@Injectable()
export class RouteCalculatorService {
  private readonly EARTH_RADIUS_KM = 6371;

  /**
   * Calculates the great-circle distance between two points on the Earth's surface
   * using the Haversine formula.
   *
   * @param originCoords The coordinates of the origin [lat, lon].
   * @param destinationCoords The coordinates of the destination [lat, lon].
   * @returns The distance in kilometers.
   */
  calculateDistance(
    originCoords: [number, number],
    destinationCoords: [number, number],
  ): number {
    const [lat1, lon1] = originCoords;
    const [lat2, lon2] = destinationCoords;

    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_KM * c;
  }

  /**
   * Estimates the travel duration for a given distance and average speed.
   *
   * @param distanceKm The distance in kilometers.
   * @param avgSpeedKmh The average speed in kilometers per hour.
   * @returns The estimated travel duration in hours.
   */
  estimateDuration(distanceKm: number, avgSpeedKmh = 80): number {
    return distanceKm / avgSpeedKmh;
  }

  /**
   * Estimates the carbon footprint for a shipment.
   *
   * @param distanceKm The distance in kilometers.
   * @param weightTonnes The weight of the shipment in tonnes.
   * @returns The estimated carbon footprint in kilograms of CO₂.
   */
  estimateCarbonFootprint(distanceKm: number, weightTonnes: number): number {
    // Carbon emission factor: 0.1 kg CO₂ per km per tonne
    const carbonFactor = 0.1;
    return distanceKm * weightTonnes * carbonFactor;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}