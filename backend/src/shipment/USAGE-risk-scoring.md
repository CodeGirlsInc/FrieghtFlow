# Risk Scoring System Usage Guide

## Overview
This guide explains how to use the risk scoring system for shipments in the FreightFlow application.

## Getting Started

### Prerequisites
- A running instance of the FreightFlow backend
- A shipment record in the system
- Appropriate API access permissions

## Using the Risk Scoring System

### 1. Calculate Risk Score for a Shipment

To calculate the risk score for a specific shipment, make a POST request to the calculate risk endpoint:

```bash
POST /shipments/{shipmentId}/calculate-risk
```

**Request Body:**
```json
{
  "carrierId": "optional-carrier-uuid",
  "routeId": "optional-route-uuid"
}
```

**Response:**
```json
{
  "id": "shipment-uuid",
  "trackingId": "FF-20231201-ABCDE",
  "origin": "New York, USA",
  "destination": "Los Angeles, USA",
  "cargoType": "general",
  "riskScore": 15.5,
  "riskLevel": "low",
  "riskFactors": {
    "cargoTypeRisk": 5,
    "carrierRisk": 5,
    "routeRisk": 3,
    "geopoliticalRisk": 2.5
  },
  // ... other shipment fields
}
```

### 2. Get Shipments by Risk Level

To retrieve shipments filtered by risk level:

```bash
GET /shipments/risk-level/{riskLevel}
```

Where `{riskLevel}` can be:
- `low`
- `medium`
- `high`
- `critical`

**Response:**
```json
[
  {
    "id": "shipment-uuid",
    "trackingId": "FF-20231201-ABCDE",
    "origin": "New York, USA",
    "destination": "Los Angeles, USA",
    "cargoType": "general",
    "riskScore": 15.5,
    "riskLevel": "low",
    // ... other shipment fields
  }
]
```

### 3. Get Risk Statistics

To get overall risk statistics for all shipments:

```bash
GET /shipments/risk-statistics
```

**Response:**
```json
{
  "totalShipments": 150,
  "lowRisk": 85,
  "mediumRisk": 45,
  "highRisk": 15,
  "criticalRisk": 5,
  "averageRiskScore": 22.3,
  "riskDistribution": {
    "low": 56.67,
    "medium": 30.0,
    "high": 10.0,
    "critical": 3.33
  }
}
```

## Risk Factor Details

### Cargo Types
The system supports the following cargo types:
- `general`: Standard goods with minimal risk
- `fragile`: Items requiring careful handling
- `perishable`: Time-sensitive goods with expiration dates
- `high_value`: Expensive items requiring additional security
- `live_animals`: Livestock and pets requiring special care
- `hazardous`: Dangerous goods requiring special handling procedures

### Risk Levels
Shipments are categorized into four risk levels based on their total score:
- **Low Risk (0-29 points)**: Minimal additional precautions needed
- **Medium Risk (30-59 points)**: Standard monitoring procedures
- **High Risk (60-79 points)**: Enhanced monitoring and insurance recommended
- **Critical Risk (80-100 points)**: Maximum precautions, specialized handling, and high insurance coverage

## Integration Examples

### JavaScript/Node.js Example
```javascript
// Calculate risk score for a shipment
async function calculateShipmentRisk(shipmentId) {
  try {
    const response = await fetch(`/shipments/${shipmentId}/calculate-risk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-access-token'
      },
      body: JSON.stringify({
        carrierId: 'carrier-uuid',
        routeId: 'route-uuid'
      })
    });
    
    const updatedShipment = await response.json();
    console.log(`Risk score: ${updatedShipment.riskScore}`);
    console.log(`Risk level: ${updatedShipment.riskLevel}`);
    
    return updatedShipment;
  } catch (error) {
    console.error('Error calculating risk score:', error);
  }
}

// Get high-risk shipments
async function getHighRiskShipments() {
  try {
    const response = await fetch('/shipments/risk-level/high', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer your-access-token'
      }
    });
    
    const highRiskShipments = await response.json();
    console.log(`Found ${highRiskShipments.length} high-risk shipments`);
    
    return highRiskShipments;
  } catch (error) {
    console.error('Error fetching high-risk shipments:', error);
  }
}
```

### Python Example
```python
import requests

# Calculate risk score for a shipment
def calculate_shipment_risk(shipment_id, token):
    url = f"/shipments/{shipment_id}/calculate-risk"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    data = {
        'carrierId': 'carrier-uuid',
        'routeId': 'route-uuid'
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        shipment = response.json()
        print(f"Risk score: {shipment['riskScore']}")
        print(f"Risk level: {shipment['riskLevel']}")
        return shipment
    else:
        print(f"Error: {response.status_code}")
        return None

# Get risk statistics
def get_risk_statistics(token):
    url = "/shipments/risk-statistics"
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        stats = response.json()
        print(f"Total shipments: {stats['totalShipments']}")
        print(f"Average risk score: {stats['averageRiskScore']}")
        return stats
    else:
        print(f"Error: {response.status_code}")
        return None
```

## Best Practices

### 1. Regular Risk Assessment
- Calculate risk scores when shipments are created
- Recalculate risk scores when shipment details change
- Periodically update risk scores for long-duration shipments

### 2. Risk-Based Resource Allocation
- Assign high-risk shipments to experienced handlers
- Allocate additional monitoring resources to critical shipments
- Consider insurance requirements based on risk levels

### 3. Monitoring and Alerts
- Set up alerts for shipments that exceed risk thresholds
- Monitor risk factor changes during transit
- Review and adjust risk scoring parameters based on actual outcomes

### 4. Continuous Improvement
- Analyze discrepancies between predicted and actual risks
- Update risk factors based on historical data
- Incorporate feedback from operations teams

## Troubleshooting

### Common Issues

1. **Risk Score Not Updating**
   - Ensure the shipment ID is correct
   - Check that the shipment exists in the database
   - Verify API access permissions

2. **Incorrect Risk Level**
   - Review the risk factor calculations
   - Check that all required data is provided
   - Validate cargo type values

3. **Performance Issues**
   - For large datasets, consider pagination
   - Cache frequently accessed risk statistics
   - Optimize database queries for risk-related data

### Support
For issues with the risk scoring system, contact the development team or check the system logs for error messages.