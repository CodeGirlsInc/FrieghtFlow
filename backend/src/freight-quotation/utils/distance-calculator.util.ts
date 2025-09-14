/**
 * Utility class for calculating distances between locations
 * In a production environment, this would integrate with a geocoding service
 */
export class DistanceCalculatorUtil {
  /**
   * Calculate distance between two locations
   * This is a simplified implementation for demonstration purposes
   * In production, integrate with Google Maps API, MapBox, or similar service
   */
  static calculateDistance(origin: string, destination: string): number {
    // Simplified hash-based distance calculation
    const originHash = this.simpleHash(origin.toLowerCase())
    const destinationHash = this.simpleHash(destination.toLowerCase())
    const difference = Math.abs(originHash - destinationHash)

    // Scale the difference to a reasonable distance range (50-2000 km)
    const distance = 50 + (difference % 1950)

    return Math.round(distance * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Simple hash function for string input
   */
  private static simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Validate location string format
   */
  static isValidLocation(location: string): boolean {
    return location && location.trim().length >= 2 && location.trim().length <= 255
  }

  /**
   * Normalize location string for consistent processing
   */
  static normalizeLocation(location: string): string {
    return location.trim().toLowerCase().replace(/\s+/g, " ")
  }
}
