export interface RiskFactor {
  name: string;
  score: number;
  description: string;
}

export interface RiskScoreResult {
  totalScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskScoringInterface {
  calculateRiskScore(shipmentData: any): Promise<RiskScoreResult>;
  getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical';
  getCargoTypeRisk(cargoType: string): number;
  getCarrierRisk(carrierData: any): number;
  getRouteRisk(routeData: any): number;
  getGeopoliticalRisk(origin: string, destination: string): number;
}