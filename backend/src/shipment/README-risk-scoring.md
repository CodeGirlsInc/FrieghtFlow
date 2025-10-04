# Shipment Risk Scoring System

## Overview
The risk scoring system evaluates shipments based on multiple factors to determine their overall risk level. This helps in making informed decisions about resource allocation, insurance, and monitoring requirements.

## Risk Factors

### 1. Cargo Type (0-30 points)
- **General Cargo**: 5 points (Low risk)
- **Fragile Items**: 15 points (Medium risk)
- **Perishable Goods**: 20 points (High risk)
- **High-Value Items**: 25 points (High risk)
- **Live Animals**: 25 points (High risk)
- **Hazardous Materials**: 30 points (Critical risk)

### 2. Carrier Reliability (0-25 points)
- **Excellent Reliability** (90-100%): 5 points
- **Good Reliability** (80-89%): 10 points
- **Average Reliability** (70-79%): 15 points
- **Below Average Reliability** (60-69%): 20 points
- **Poor Reliability** (<60%): 25 points

### 3. Route Risk (0-25 points)
- **Distance Factor**:
  - Short (<2000km): 3 points
  - Medium (2000-5000km): 5 points
  - Long (5000-10000km): 7 points
  - Very Long (>10000km): 10 points

- **Route Type**:
  - Domestic: 0 points
  - International: 8 points
  - Intermodal: 5 points

- **Route Reliability**:
  - High (>85%): 0 points
  - Medium (70-85%): 5 points
  - Low (<70%): 10 points

### 4. Geopolitical Risk (0-20 points)
- **Low Risk Countries**: 2 points
- **Medium Risk Countries**: 10 points
- **High Risk Countries**: 20 points

## Risk Levels
- **Low Risk**: 0-29 points
- **Medium Risk**: 30-59 points
- **High Risk**: 60-79 points
- **Critical Risk**: 80-100 points

## Implementation

### Entities
The [Shipment](file:///c%3A/Users/k-aliyu/Documents/GitHub/FrieghtFlow/backend/src/shipment/shipment.entity.ts#L19-L97) entity has been extended with the following fields:
- `cargoType`: Enum defining the type of cargo
- `riskScore`: Decimal value representing the total risk score (0-100)
- `riskLevel`: Enum indicating the risk category
- `riskFactors`: JSON object containing detailed breakdown of risk factors

### Services
- **RiskScoringService**: Core service that calculates risk scores based on the defined factors
- **ShipmentService**: Extended to include risk scoring functionality

### Endpoints
- `POST /shipments/:id/calculate-risk`: Calculate and update risk score for a shipment
- `GET /shipments/risk-level/:riskLevel`: Get shipments filtered by risk level
- `GET /shipments/risk-statistics`: Get overall risk statistics

## Future Enhancements
1. Integration with external APIs for real-time geopolitical risk data
2. Machine learning models to improve risk predictions
3. Dynamic carrier reliability scoring based on historical performance
4. Weather and seasonal factors affecting route risk
5. Real-time risk monitoring and alerts