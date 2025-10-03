import { Injectable } from '@nestjs/common';
import { Shipment, CargoType, RiskLevel } from './shipment.entity';
import { Carrier } from '../carriers/entities/carrier.entity';
import { Route } from '../route-optimization/entities/route.entity';

@Injectable()
export class RiskScoringService {
  /**
   * Calculate the risk score for a shipment based on multiple factors
   * @param shipment The shipment to calculate risk for
   * @param carrier The carrier information (optional)
   * @param route The route information (optional)
   * @returns Object containing risk score, risk level, and breakdown of factors
   */
  calculateRiskScore(
    shipment: Shipment,
    carrier?: Carrier,
    route?: Route,
  ): { score: number; level: RiskLevel; factors: Record<string, number> } {
    const factors: Record<string, number> = {};

    // 1. Cargo Type Risk (0-30 points)
    factors.cargoTypeRisk = this.getCargoTypeRisk(shipment.cargoType);

    // 2. Carrier Reliability Risk (0-25 points)
    factors.carrierRisk = this.getCarrierRisk(carrier);

    // 3. Route Risk (0-25 points)
    factors.routeRisk = this.getRouteRisk(route, shipment);

    // 4. Geopolitical Risk (0-20 points)
    factors.geopoliticalRisk = this.getGeopoliticalRisk(shipment.origin, shipment.destination);

    // Calculate total score (sum of all factors)
    const totalScore = Object.values(factors).reduce((sum, value) => sum + value, 0);

    // Cap the score at 100
    const score = Math.min(totalScore, 100);

    // Determine risk level based on score
    const level = this.getRiskLevel(score);

    return {
      score: parseFloat(score.toFixed(2)),
      level,
      factors,
    };
  }

  /**
   * Get risk score based on cargo type
   */
  private getCargoTypeRisk(cargoType: CargoType): number {
    switch (cargoType) {
      case CargoType.HAZARDOUS:
        return 30;
      case CargoType.HIGH_VALUE:
        return 25;
      case CargoType.PERISHABLE:
        return 20;
      case CargoType.LIVE_ANIMALS:
        return 25;
      case CargoType.FRAGILE:
        return 15;
      case CargoType.GENERAL:
      default:
        return 5;
    }
  }

  /**
   * Get risk score based on carrier reliability
   */
  private getCarrierRisk(carrier?: Carrier): number {
    if (!carrier) return 15; // Default risk if no carrier info

    // In a real implementation, this would use actual carrier reliability data
    // For now, we'll use a placeholder implementation
    // Assuming carriers have a reliability score property (0-100)
    // Since the current Carrier entity doesn't have this, we'll simulate it
    const reliabilityScore = Math.floor(Math.random() * 100); // Placeholder for actual carrier reliability data

    if (reliabilityScore > 90) return 5;    // Excellent reliability
    if (reliabilityScore > 80) return 10;   // Good reliability
    if (reliabilityScore > 70) return 15;   // Average reliability
    if (reliabilityScore > 60) return 20;   // Below average reliability
    return 25;                              // Poor reliability
  }

  /**
   * Get risk score based on route characteristics
   */
  private getRouteRisk(route?: Route, shipment?: Shipment): number {
    if (!route && !shipment) return 15; // Default risk

    let risk = 0;

    // If we have route information
    if (route) {
      // Longer routes are generally riskier
      if (route.totalDistance > 10000) {
        risk += 10; // Very long distance
      } else if (route.totalDistance > 5000) {
        risk += 7;  // Long distance
      } else if (route.totalDistance > 2000) {
        risk += 5;  // Medium distance
      } else {
        risk += 3;  // Short distance
      }

      // International routes are riskier than domestic
      if (route.routeType === 'international') {
        risk += 8;
      } else if (route.routeType === 'intermodal') {
        risk += 5;
      }

      // Use route reliability score if available
      if (route.reliabilityScore) {
        if (route.reliabilityScore < 70) {
          risk += 10;
        } else if (route.reliabilityScore < 85) {
          risk += 5;
        }
      }
    }

    // If we have shipment information but no route
    if (shipment && !route) {
      // Use distance if available
      if (shipment.distanceKm) {
        if (shipment.distanceKm > 10000) {
          risk += 10;
        } else if (shipment.distanceKm > 5000) {
          risk += 7;
        } else if (shipment.distanceKm > 2000) {
          risk += 5;
        } else {
          risk += 3;
        }
      }

      // International shipments are riskier
      if (shipment.origin && shipment.destination) {
        const originCountry = this.extractCountry(shipment.origin);
        const destCountry = this.extractCountry(shipment.destination);
        if (originCountry !== destCountry) {
          risk += 8;
        }
      }
    }

    return Math.min(risk, 25); // Cap at maximum route risk
  }

  /**
   * Get geopolitical risk score based on origin and destination
   */
  private getGeopoliticalRisk(origin: string, destination: string): number {
    // In a real implementation, this would integrate with a geopolitical risk API
    // For now, we'll use a simplified approach with some example high-risk countries
    
    const highRiskCountries = [
      'Afghanistan', 'Syria', 'Yemen', 'Somalia', 'North Korea', 
      'Iran', 'Venezuela', 'Myanmar', 'Sudan', 'South Sudan'
    ];
    
    const mediumRiskCountries = [
      'Russia', 'China', 'Pakistan', 'Iraq', 'Libya', 
      'Nigeria', 'Egypt', 'Turkey', 'Mexico', 'Brazil'
    ];

    let risk = 0;
    const originCountry = this.extractCountry(origin);
    const destCountry = this.extractCountry(destination);

    if (highRiskCountries.includes(originCountry) || highRiskCountries.includes(destCountry)) {
      risk += 20;
    } else if (mediumRiskCountries.includes(originCountry) || mediumRiskCountries.includes(destCountry)) {
      risk += 10;
    } else {
      risk += 2;
    }

    return risk;
  }

  /**
   * Extract country from address string
   */
  private extractCountry(address: string): string {
    // Simple implementation - in reality, you'd want a more robust solution
    const countries = [
      'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
      'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
      'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
      'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
      'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
      'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
      'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
      'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
      'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo',
      'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
      'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
      'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
      'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman',
      'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
      'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
      'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
      'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
      'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
      'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
      'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
    ];

    // Try to find a country name in the address
    for (const country of countries) {
      if (address.includes(country)) {
        return country;
      }
    }

    // Return the last word as a fallback
    const parts = address.split(' ');
    return parts[parts.length - 1] || 'Unknown';
  }

  /**
   * Determine risk level based on score
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.CRITICAL;
    if (score >= 60) return RiskLevel.HIGH;
    if (score >= 30) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }
}