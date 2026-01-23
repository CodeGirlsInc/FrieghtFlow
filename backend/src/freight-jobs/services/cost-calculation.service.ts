import { Injectable } from '@nestjs/common';
import { Address } from '../entities/freight-job.entity';

interface DistanceCalculationResult {
  distance: number; // in kilometers
  duration: number; // in hours (estimated)
}

@Injectable()
export class CostCalculationService {
  // Base rates per km
  private readonly BASE_RATE_PER_KM = 5; // $5 per km

  // Cargo type multipliers
  private readonly CARGO_TYPE_MULTIPLIERS: Record<string, number> = {
    electronics: 1.5,
    furniture: 1.2,
    fragile: 1.8,
    hazardous: 2.0,
    perishable: 1.6,
    general: 1.0,
  };

  // Weight multipliers
  private readonly WEIGHT_MULTIPLIER = 0.1; // $0.1 per kg

  // Minimum charge
  private readonly MINIMUM_CHARGE = 50; // $50

  /**
   * Calculate haversine distance between two coordinates
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Estimate distance and duration between two addresses
   * Using approximate coordinates based on major cities
   */
  estimateDistanceAndDuration(
    origin: Address,
    destination: Address,
  ): DistanceCalculationResult {
    // If coordinates are provided, use them
    if (
      origin.latitude !== undefined &&
      origin.longitude !== undefined &&
      destination.latitude !== undefined &&
      destination.longitude !== undefined
    ) {
      const distance = this.calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude,
      );

      // Estimate 1 hour per 80 km average driving speed with 15% buffer
      const duration = (distance / 80) * 1.15;

      return { distance, duration };
    }

    // Fallback: estimate distance based on city names (simple heuristic)
    const estimatedDistance = this.estimateDistanceFromCities(
      origin.city,
      destination.city,
    );
    const duration = (estimatedDistance / 80) * 1.15;

    return { distance: estimatedDistance, duration };
  }

  /**
   * Simple city-to-city distance estimator
   * In production, this would use a real mapping service like Google Maps API
   */
  private estimateDistanceFromCities(city1: string, city2: string): number {
    // Common US city distances (simplified)
    const cityCoordinates: Record<string, { lat: number; lon: number }> = {
      'new york': { lat: 40.7128, lon: -74.006 },
      'los angeles': { lat: 34.0522, lon: -118.2437 },
      chicago: { lat: 41.8781, lon: -87.6298 },
      houston: { lat: 29.7604, lon: -95.3698 },
      phoenix: { lat: 33.4484, lon: -112.074 },
      philadelphia: { lat: 39.9526, lon: -75.1652 },
      'san antonio': { lat: 29.4241, lon: -98.4936 },
      'san diego': { lat: 32.7157, lon: -117.1611 },
      dallas: { lat: 32.7767, lon: -96.797 },
      'san jose': { lat: 37.3382, lon: -121.8863 },
      austin: { lat: 30.2672, lon: -97.7431 },
      denver: { lat: 39.7392, lon: -104.9903 },
      seattle: { lat: 47.6062, lon: -122.3321 },
      boston: { lat: 42.3601, lon: -71.0589 },
      miami: { lat: 25.7617, lon: -80.1918 },
    };

    const c1 = Object.entries(cityCoordinates).find(([city]) =>
      city1.toLowerCase().includes(city.toLowerCase()),
    );
    const c2 = Object.entries(cityCoordinates).find(([city]) =>
      city2.toLowerCase().includes(city.toLowerCase()),
    );

    if (c1 && c2) {
      return this.calculateDistance(c1[1].lat, c1[1].lon, c2[1].lat, c2[1].lon);
    }

    // Default estimate: 500 km if cities not found
    return 500;
  }

  /**
   * Calculate estimated cost based on distance, cargo weight, and type
   */
  calculateEstimatedCost(
    origin: Address,
    destination: Address,
    cargoWeight: number,
    cargoType: string,
  ): number {
    const { distance } = this.estimateDistanceAndDuration(origin, destination);

    // Base cost from distance
    const distanceCost = distance * this.BASE_RATE_PER_KM;

    // Weight cost
    const weightCost = cargoWeight * this.WEIGHT_MULTIPLIER;

    // Cargo type multiplier
    const cargoTypeKey = cargoType.toLowerCase().replace(/\s+/g, '');
    const multiplier =
      this.CARGO_TYPE_MULTIPLIERS[cargoTypeKey] ||
      this.CARGO_TYPE_MULTIPLIERS['general'];

    // Calculate total
    const subtotal = (distanceCost + weightCost) * multiplier;

    // Apply minimum charge
    const estimatedCost = Math.max(subtotal, this.MINIMUM_CHARGE);

    return Math.round(estimatedCost * 100) / 100; // Round to 2 decimal places
  }
}
