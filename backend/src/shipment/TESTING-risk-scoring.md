# Risk Scoring System Testing Guide

## Overview
This document outlines the testing approach for the risk scoring system implemented in the shipment module.

## Test Cases

### Unit Tests

#### RiskScoringService
1. **getCargoTypeRisk**
   - Test with each cargo type to ensure correct risk points are assigned
   - General cargo: 5 points
   - Fragile cargo: 15 points
   - Perishable cargo: 20 points
   - High-value cargo: 25 points
   - Live animals: 25 points
   - Hazardous materials: 30 points

2. **getCarrierRisk**
   - Test with different carrier reliability scores
   - Excellent reliability (90-100%): 5 points
   - Good reliability (80-89%): 10 points
   - Average reliability (70-79%): 15 points
   - Below average reliability (60-69%): 20 points
   - Poor reliability (<60%): 25 points

3. **getRouteRisk**
   - Test with different route distances
   - Short routes (<2000km): 3 points
   - Medium routes (2000-5000km): 5 points
   - Long routes (5000-10000km): 7 points
   - Very long routes (>10000km): 10 points

4. **getGeopoliticalRisk**
   - Test with low-risk country pairs: 2 points
   - Test with medium-risk country pairs: 10 points
   - Test with high-risk country pairs: 20 points

5. **getRiskLevel**
   - Test with scores in each range to ensure correct risk level assignment
   - 0-29: Low risk
   - 30-59: Medium risk
   - 60-79: High risk
   - 80-100: Critical risk

6. **calculateRiskScore**
   - Test with complete shipment data
   - Test with partial data (missing carrier or route)
   - Verify that total score is correctly calculated and capped at 100
   - Verify that risk level is correctly determined

### Integration Tests

#### ShipmentService
1. **calculateRiskScore**
   - Test that the method correctly updates the shipment entity with risk data
   - Verify that the risk score is persisted in the database

2. **getShipmentsByRiskLevel**
   - Test filtering shipments by each risk level
   - Verify correct sorting and pagination

3. **getRiskStatistics**
   - Test that statistics are correctly calculated
   - Verify distribution percentages are accurate

#### ShipmentController
1. **calculateRiskScore endpoint**
   - Test with valid shipment ID
   - Test with invalid shipment ID (should return 404)
   - Verify response contains updated risk data

2. **getShipmentsByRiskLevel endpoint**
   - Test with each risk level parameter
   - Verify correct filtering of results

3. **getRiskStatistics endpoint**
   - Test that statistics endpoint returns correct data format
   - Verify all expected fields are present

## Test Data

### Sample Shipments for Testing
1. **Low Risk Shipment**
   - Cargo Type: General
   - Origin: New York, USA
   - Destination: Los Angeles, USA
   - Carrier: Reliable Express (95% reliability)
   - Distance: 3940km

2. **Medium Risk Shipment**
   - Cargo Type: Fragile
   - Origin: London, UK
   - Destination: Paris, France
   - Carrier: Standard Shipping (75% reliability)
   - Distance: 340km

3. **High Risk Shipment**
   - Cargo Type: Perishable
   - Origin: Miami, USA
   - Destination: São Paulo, Brazil
   - Carrier: Budget Carrier (65% reliability)
   - Distance: 6700km

4. **Critical Risk Shipment**
   - Cargo Type: Hazardous
   - Origin: Damascus, Syria
   - Destination: Mogadishu, Somalia
   - Carrier: Unknown Carrier (40% reliability)
   - Distance: 4500km

## Expected Results

### Risk Score Calculations
1. **Low Risk Shipment**: ~15-25 points
2. **Medium Risk Shipment**: ~35-45 points
3. **High Risk Shipment**: ~60-75 points
4. **Critical Risk Shipment**: ~85-100 points

## Performance Tests
1. **Response Time**
   - Risk calculation should complete within 100ms
   - Statistics calculation should complete within 500ms

2. **Concurrency**
   - System should handle 100 concurrent risk calculations
   - No data corruption should occur under load

## Edge Cases
1. **Missing Data**
   - Test with shipments missing carrier information
   - Test with shipments missing route information
   - Test with shipments missing origin/destination

2. **Invalid Data**
   - Test with invalid cargo types
   - Test with negative distance values
   - Test with malformed country names

3. **Boundary Values**
   - Test with risk scores exactly at boundary values (29, 30, 59, 60, 79, 80)
   - Test with maximum distance values
   - Test with minimum distance values