# Comprehensive Test Plan for Risk Scoring System

## Overview
This document outlines a comprehensive set of tests for the risk scoring system implemented in the shipment module. These tests cover unit, integration, and end-to-end testing scenarios.

## Unit Tests

### RiskScoringService

#### 1. getCargoTypeRisk Method
```typescript
// Test cases for cargo type risk calculation
it('should return 5 for general cargo', () => {
  const result = service.getCargoTypeRisk(CargoType.GENERAL);
  expect(result).toBe(5);
});

it('should return 15 for fragile cargo', () => {
  const result = service.getCargoTypeRisk(CargoType.FRAGILE);
  expect(result).toBe(15);
});

it('should return 20 for perishable cargo', () => {
  const result = service.getCargoTypeRisk(CargoType.PERISHABLE);
  expect(result).toBe(20);
});

it('should return 25 for high value cargo', () => {
  const result = service.getCargoTypeRisk(CargoType.HIGH_VALUE);
  expect(result).toBe(25);
});

it('should return 25 for live animals cargo', () => {
  const result = service.getCargoTypeRisk(CargoType.LIVE_ANIMALS);
  expect(result).toBe(25);
});

it('should return 30 for hazardous cargo', () => {
  const result = service.getCargoTypeRisk(CargoType.HAZARDOUS);
  expect(result).toBe(30);
});
```

#### 2. getCarrierRisk Method
```typescript
// Test cases for carrier reliability risk calculation
it('should return 5 for excellent reliability (90-100%)', () => {
  const carrier = { reliabilityScore: 95 };
  const result = service.getCarrierRisk(carrier);
  expect(result).toBe(5);
});

it('should return 10 for good reliability (80-89%)', () => {
  const carrier = { reliabilityScore: 85 };
  const result = service.getCarrierRisk(carrier);
  expect(result).toBe(10);
});

it('should return 15 for average reliability (70-79%)', () => {
  const carrier = { reliabilityScore: 75 };
  const result = service.getCarrierRisk(carrier);
  expect(result).toBe(15);
});

it('should return 20 for below average reliability (60-69%)', () => {
  const carrier = { reliabilityScore: 65 };
  const result = service.getCarrierRisk(carrier);
  expect(result).toBe(20);
});

it('should return 25 for poor reliability (<60%)', () => {
  const carrier = { reliabilityScore: 55 };
  const result = service.getCarrierRisk(carrier);
  expect(result).toBe(25);
});

it('should return 15 as default when no carrier provided', () => {
  const result = service.getCarrierRisk(null);
  expect(result).toBe(15);
});
```

#### 3. getRouteRisk Method
```typescript
// Test cases for route risk calculation
it('should return default risk when no route or shipment data', () => {
  const result = service.getRouteRisk(null, null);
  expect(result).toBe(15);
});

it('should calculate risk based on short distance (<2000km)', () => {
  const shipment = { distanceKm: 1500 } as Shipment;
  const result = service.getRouteRisk(null, shipment);
  expect(result).toBe(3);
});

it('should calculate risk based on medium distance (2000-5000km)', () => {
  const shipment = { distanceKm: 3500 } as Shipment;
  const result = service.getRouteRisk(null, shipment);
  expect(result).toBe(5);
});

it('should calculate risk based on long distance (5000-10000km)', () => {
  const shipment = { distanceKm: 7500 } as Shipment;
  const result = service.getRouteRisk(null, shipment);
  expect(result).toBe(7);
});

it('should calculate risk based on very long distance (>10000km)', () => {
  const shipment = { distanceKm: 15000 } as Shipment;
  const result = service.getRouteRisk(null, shipment);
  expect(result).toBe(10);
});

it('should add international route risk', () => {
  const shipment = { 
    origin: 'New York, USA', 
    destination: 'London, UK' 
  } as Shipment;
  const result = service.getRouteRisk(null, shipment);
  expect(result).toBeGreaterThanOrEqual(8);
});
```

#### 4. getGeopoliticalRisk Method
```typescript
// Test cases for geopolitical risk calculation
it('should return 20 for high-risk country pairs', () => {
  const result = service.getGeopoliticalRisk('Damascus, Syria', 'Mogadishu, Somalia');
  expect(result).toBe(20);
});

it('should return 10 for medium-risk country pairs', () => {
  const result = service.getGeopoliticalRisk('Moscow, Russia', 'Cairo, Egypt');
  expect(result).toBe(10);
});

it('should return 2 for low-risk country pairs', () => {
  const result = service.getGeopoliticalRisk('New York, USA', 'London, UK');
  expect(result).toBe(2);
});
```

#### 5. getRiskLevel Method
```typescript
// Test cases for risk level determination
it('should return LOW for scores 0-29', () => {
  const result = service.getRiskLevel(25);
  expect(result).toBe(RiskLevel.LOW);
});

it('should return MEDIUM for scores 30-59', () => {
  const result = service.getRiskLevel(45);
  expect(result).toBe(RiskLevel.MEDIUM);
});

it('should return HIGH for scores 60-79', () => {
  const result = service.getRiskLevel(70);
  expect(result).toBe(RiskLevel.HIGH);
});

it('should return CRITICAL for scores 80-100', () => {
  const result = service.getRiskLevel(90);
  expect(result).toBe(RiskLevel.CRITICAL);
});
```

#### 6. calculateRiskScore Method
```typescript
// Test cases for overall risk score calculation
it('should calculate risk score for a shipment with general cargo', () => {
  const shipment = {
    cargoType: CargoType.GENERAL,
    origin: 'New York, USA',
    destination: 'Los Angeles, USA',
    distanceKm: 3940,
  } as Shipment;

  const result = service.calculateRiskScore(shipment);
  
  expect(result).toHaveProperty('score');
  expect(result).toHaveProperty('level');
  expect(result).toHaveProperty('factors');
  expect(typeof result.score).toBe('number');
  expect(result.score).toBeGreaterThanOrEqual(0);
  expect(result.score).toBeLessThanOrEqual(100);
  expect(result.level).toBe(RiskLevel.LOW);
  expect(result.factors.cargoTypeRisk).toBe(5);
});

it('should calculate risk score for a shipment with hazardous cargo', () => {
  const shipment = {
    cargoType: CargoType.HAZARDOUS,
    origin: 'New York, USA',
    destination: 'Los Angeles, USA',
    distanceKm: 3940,
  } as Shipment;

  const result = service.calculateRiskScore(shipment);
  
  expect(result.factors.cargoTypeRisk).toBe(30);
});

it('should cap risk score at 100', () => {
  const shipment = {
    cargoType: CargoType.HAZARDOUS,
    origin: 'Damascus, Syria',
    destination: 'Mogadishu, Somalia',
    distanceKm: 3940,
  } as Shipment;

  // Mock the geopolitical risk to ensure we get a high score
  jest.spyOn(service, 'getGeopoliticalRisk').mockReturnValue(20);
  
  const result = service.calculateRiskScore(shipment);
  
  expect(result.score).toBeLessThanOrEqual(100);
});
```

## Integration Tests

### ShipmentService

#### 1. calculateRiskScore Method
```typescript
// Test that the service correctly updates shipment with risk data
it('should calculate and update risk score for a shipment', async () => {
  const shipment = await shipmentService.create({
    origin: 'New York, USA',
    destination: 'Los Angeles, USA',
    carrier: 'FedEx',
  });

  const updatedShipment = await shipmentService.calculateRiskScore(shipment.id);
  
  expect(updatedShipment.riskScore).toBeDefined();
  expect(updatedShipment.riskLevel).toBeDefined();
  expect(updatedShipment.riskFactors).toBeDefined();
  expect(typeof updatedShipment.riskScore).toBe('number');
});
```

#### 2. getShipmentsByRiskLevel Method
```typescript
// Test filtering shipments by risk level
it('should return shipments filtered by risk level', async () => {
  // Create multiple shipments with different risk levels
  const lowRiskShipment = await shipmentService.create({
    origin: 'New York, USA',
    destination: 'Boston, USA',
    carrier: 'Local Express',
    cargoType: CargoType.GENERAL,
  });

  const highRiskShipment = await shipmentService.create({
    origin: 'Damascus, Syria',
    destination: 'Mogadishu, Somalia',
    carrier: 'Unknown Carrier',
    cargoType: CargoType.HAZARDOUS,
  });

  // Calculate risk scores
  await shipmentService.calculateRiskScore(lowRiskShipment.id);
  await shipmentService.calculateRiskScore(highRiskShipment.id);

  // Test filtering
  const highRiskShipments = await shipmentService.getShipmentsByRiskLevel('high');
  
  expect(Array.isArray(highRiskShipments)).toBe(true);
  expect(highRiskShipments.length).toBeGreaterThanOrEqual(1);
  expect(highRiskShipments[0].riskLevel).toBe('high');
});
```

#### 3. getRiskStatistics Method
```typescript
// Test risk statistics calculation
it('should return correct risk statistics', async () => {
  // Create multiple shipments with different risk levels
  await shipmentService.create({
    origin: 'New York, USA',
    destination: 'Boston, USA',
    carrier: 'Local Express',
    cargoType: CargoType.GENERAL,
  });

  await shipmentService.create({
    origin: 'Damascus, Syria',
    destination: 'Mogadishu, Somalia',
    carrier: 'Unknown Carrier',
    cargoType: CargoType.HAZARDOUS,
  });

  const stats = await shipmentService.getRiskStatistics();
  
  expect(stats).toHaveProperty('totalShipments');
  expect(stats).toHaveProperty('lowRisk');
  expect(stats).toHaveProperty('mediumRisk');
  expect(stats).toHaveProperty('highRisk');
  expect(stats).toHaveProperty('criticalRisk');
  expect(stats).toHaveProperty('averageRiskScore');
  expect(stats).toHaveProperty('riskDistribution');
  
  expect(typeof stats.totalShipments).toBe('number');
  expect(typeof stats.averageRiskScore).toBe('number');
});
```

## End-to-End Tests

### ShipmentController

#### 1. POST /shipments/:id/calculate-risk Endpoint
```typescript
// Test the calculate risk endpoint
it('should calculate risk score for a shipment', () => {
  const createShipmentDto = {
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    carrier: 'FedEx',
  };

  return request(app.getHttpServer())
    .post('/shipments')
    .send(createShipmentDto)
    .expect(201)
    .then((res) => {
      const shipmentId = res.body.id;
      
      return request(app.getHttpServer())
        .post(`/shipments/${shipmentId}/calculate-risk`)
        .send({})
        .expect(200)
        .expect((response) => {
          expect(response.body).toHaveProperty('riskScore');
          expect(response.body).toHaveProperty('riskLevel');
          expect(response.body).toHaveProperty('riskFactors');
          expect(typeof response.body.riskScore).toBe('number');
        });
    });
});

it('should return 404 for non-existent shipment', () => {
  return request(app.getHttpServer())
    .post('/shipments/non-existent-id/calculate-risk')
    .send({})
    .expect(404);
});
```

#### 2. GET /shipments/risk-level/:riskLevel Endpoint
```typescript
// Test filtering by risk level endpoint
it('should return shipments filtered by risk level', async () => {
  // First create and calculate risk for a shipment
  const createRes = await request(app.getHttpServer())
    .post('/shipments')
    .send({
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      carrier: 'FedEx',
      cargoType: CargoType.GENERAL,
    })
    .expect(201);

  const shipmentId = createRes.body.id;
  
  // Calculate risk score
  await request(app.getHttpServer())
    .post(`/shipments/${shipmentId}/calculate-risk`)
    .send({})
    .expect(200);

  // Test filtering
  return request(app.getHttpServer())
    .get('/shipments/risk-level/low')
    .expect(200)
    .expect((res) => {
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
});
```

#### 3. GET /shipments/risk-statistics Endpoint
```typescript
// Test risk statistics endpoint
it('should return risk statistics', () => {
  return request(app.getHttpServer())
    .get('/shipments/risk-statistics')
    .expect(200)
    .expect((res) => {
      expect(res.body).toHaveProperty('totalShipments');
      expect(res.body).toHaveProperty('lowRisk');
      expect(res.body).toHaveProperty('mediumRisk');
      expect(res.body).toHaveProperty('highRisk');
      expect(res.body).toHaveProperty('criticalRisk');
      expect(res.body).toHaveProperty('averageRiskScore');
      expect(res.body).toHaveProperty('riskDistribution');
    });
});
```

## Performance Tests

### Load Testing
```typescript
// Test concurrent risk calculations
it('should handle concurrent risk calculations', async () => {
  // Create multiple shipments
  const shipments = [];
  for (let i = 0; i < 10; i++) {
    const res = await request(app.getHttpServer())
      .post('/shipments')
      .send({
        origin: `City${i}, Country${i}`,
        destination: `Destination${i}, Country${i}`,
        carrier: `Carrier${i}`,
      })
      .expect(201);
    shipments.push(res.body);
  }

  // Calculate risk scores concurrently
  const promises = shipments.map(shipment => 
    request(app.getHttpServer())
      .post(`/shipments/${shipment.id}/calculate-risk`)
      .send({})
  );

  const results = await Promise.all(promises);
  
  results.forEach(result => {
    expect(result.status).toBe(200);
    expect(result.body.riskScore).toBeDefined();
  });
});
```

## Edge Case Tests

### 1. Invalid Data Handling
```typescript
// Test with invalid cargo types
it('should handle invalid cargo types gracefully', () => {
  const shipment = {
    cargoType: 'invalid_type',
    origin: 'New York, USA',
    destination: 'Los Angeles, USA',
  } as any as Shipment;

  const result = service.calculateRiskScore(shipment);
  
  // Should still return a valid result with default values
  expect(result).toHaveProperty('score');
  expect(result).toHaveProperty('level');
});

// Test with negative distance values
it('should handle negative distance values', () => {
  const shipment = {
    cargoType: CargoType.GENERAL,
    origin: 'New York, USA',
    destination: 'Los Angeles, USA',
    distanceKm: -1000,
  } as Shipment;

  const result = service.calculateRiskScore(shipment);
  
  expect(result.score).toBeGreaterThanOrEqual(0);
});
```

### 2. Boundary Value Tests
```typescript
// Test with risk scores exactly at boundary values
it('should correctly categorize boundary risk scores', () => {
  expect(service.getRiskLevel(29)).toBe(RiskLevel.LOW);
  expect(service.getRiskLevel(30)).toBe(RiskLevel.MEDIUM);
  expect(service.getRiskLevel(59)).toBe(RiskLevel.MEDIUM);
  expect(service.getRiskLevel(60)).toBe(RiskLevel.HIGH);
  expect(service.getRiskLevel(79)).toBe(RiskLevel.HIGH);
  expect(service.getRiskLevel(80)).toBe(RiskLevel.CRITICAL);
});
```

## Test Data

### Sample Shipments for Testing
1. **Low Risk Shipment**
   - Cargo Type: General
   - Origin: New York, USA
   - Destination: Los Angeles, USA
   - Carrier: Reliable Express (95% reliability)
   - Distance: 3940km
   - Expected Risk Score: ~15-25 points

2. **Medium Risk Shipment**
   - Cargo Type: Fragile
   - Origin: London, UK
   - Destination: Paris, France
   - Carrier: Standard Shipping (75% reliability)
   - Distance: 340km
   - Expected Risk Score: ~35-45 points

3. **High Risk Shipment**
   - Cargo Type: Perishable
   - Origin: Miami, USA
   - Destination: São Paulo, Brazil
   - Carrier: Budget Carrier (65% reliability)
   - Distance: 6700km
   - Expected Risk Score: ~60-75 points

4. **Critical Risk Shipment**
   - Cargo Type: Hazardous
   - Origin: Damascus, Syria
   - Destination: Mogadishu, Somalia
   - Carrier: Unknown Carrier (40% reliability)
   - Distance: 4500km
   - Expected Risk Score: ~85-100 points

## Expected Results

### Risk Score Calculations
1. **Low Risk Shipment**: ~15-25 points
2. **Medium Risk Shipment**: ~35-45 points
3. **High Risk Shipment**: ~60-75 points
4. **Critical Risk Shipment**: ~85-100 points

## Test Execution

### Unit Tests
```bash
npm run test src/shipment/risk-scoring.service.spec.ts
```

### Integration Tests
```bash
npm run test src/shipment/shipment.service.spec.ts
```

### End-to-End Tests
```bash
npm run test:e2e test/shipment-risk.e2e-spec.ts
```

## Coverage Goals
- **Unit Test Coverage**: 90%+
- **Integration Test Coverage**: 80%+
- **End-to-End Test Coverage**: 70%+

## Test Maintenance
- Update tests when risk factors or scoring algorithms change
- Add new test cases for additional risk factors
- Regularly review and update test data
- Monitor test performance and optimize as needed