# Route Optimization Module

A comprehensive route optimization module for the FreightFlow backend that provides intelligent route recommendations based on distance, cost, carrier availability, and various optimization criteria.

## Features

### Core Functionality
- **Route Management**: Create, update, and manage shipping routes
- **Carrier Management**: Manage carrier information and capabilities
- **Route Optimization**: Intelligent route recommendations using multiple algorithms
- **Rules Engine**: Configurable rules for route evaluation
- **Performance Tracking**: Monitor and analyze route performance

### Optimization Algorithms
- **Dijkstra**: Shortest path optimization
- **A* (A-Star)**: Heuristic-based pathfinding
- **Genetic Algorithm**: Evolutionary optimization
- **Simulated Annealing**: Probabilistic optimization
- **Ant Colony**: Swarm intelligence optimization

### Rules Engine
- **Cost Optimization**: Evaluate routes based on cost efficiency
- **Time Optimization**: Consider delivery time constraints
- **Reliability Scoring**: Assess route reliability
- **Safety Scoring**: Evaluate safety factors
- **Carbon Footprint**: Environmental impact assessment
- **Carrier Availability**: Check carrier availability

## API Endpoints

### Route Management
```
GET    /routes                    # Get all routes with filtering
POST   /routes                    # Create new route
GET    /routes/:id                # Get route by ID
PATCH  /routes/:id                # Update route
DELETE /routes/:id                # Delete route
GET    /routes/search?q=term      # Search routes
GET    /routes/statistics         # Get route statistics
```

### Carrier Management
```
GET    /carriers                  # Get all carriers with filtering
POST   /carriers                  # Create new carrier
GET    /carriers/:id              # Get carrier by ID
PATCH  /carriers/:id              # Update carrier
DELETE /carriers/:id              # Delete carrier
GET    /carriers/search?q=term    # Search carriers
GET    /carriers/statistics        # Get carrier statistics
GET    /carriers/top              # Get top performing carriers
```

### Route Optimization
```
POST   /route-optimization/optimize           # Optimize route
GET    /route-optimization/history            # Get optimization history
GET    /route-optimization/request/:id        # Get optimization request
```

## Usage Examples

### Basic Route Optimization
```typescript
const optimizationRequest = {
  origin: 'New York',
  destination: 'Los Angeles',
  criteria: 'COMBINED',
  weight: 500,
  volume: 25,
  cargoType: 'general',
  constraints: {
    maxCost: 2000,
    maxDuration: 48,
    minReliabilityScore: 80
  }
};

const result = await routeOptimizationService.optimizeRoute(optimizationRequest, userId);
```

### Advanced Optimization with Constraints
```typescript
const advancedRequest = {
  origin: 'New York',
  destination: 'Los Angeles',
  criteria: 'COST',
  weight: 1000,
  volume: 50,
  cargoType: 'hazardous',
  maxCost: 3000,
  maxDuration: 72,
  maxDistance: 4000,
  minReliabilityScore: 90,
  minSafetyScore: 95,
  maxCarbonFootprint: 800,
  preferredCarriers: ['carrier-1', 'carrier-2'],
  constraints: {
    strictMode: true,
    avoidHighways: false,
    requireInsurance: true
  },
  preferences: {
    algorithm: 'GENETIC',
    prioritizeSpeed: false,
    prioritizeCost: true
  }
};
```

## Database Schema

### Routes Table
- `id`: Primary key (UUID)
- `name`: Route name
- `origin`: Origin location
- `destination`: Destination location
- `routeType`: Type of route (domestic, international, etc.)
- `totalDistance`: Total distance in kilometers
- `estimatedDuration`: Estimated duration in hours
- `baseCost`: Base cost for the route
- `carbonFootprint`: CO2 emissions in kg
- `reliabilityScore`: Reliability score (0-100)
- `safetyScore`: Safety score (0-100)

### Carriers Table
- `id`: Primary key (UUID)
- `name`: Carrier name
- `carrierType`: Type of carrier (airline, shipping, trucking, etc.)
- `serviceAreas`: Array of service areas
- `capabilities`: JSON object with carrier capabilities
- `reliabilityScore`: Reliability score (0-100)
- `safetyScore`: Safety score (0-100)
- `costScore`: Cost efficiency score (0-100)
- `speedScore`: Speed score (0-100)

### Route Segments Table
- `id`: Primary key (UUID)
- `routeId`: Foreign key to routes table
- `segmentType`: Type of segment (road, rail, air, sea, etc.)
- `origin`: Segment origin
- `destination`: Segment destination
- `distance`: Segment distance
- `duration`: Segment duration
- `cost`: Segment cost
- `sequence`: Order of segments in the route

## Configuration

### Environment Variables
```env
# Database configuration (inherited from main app)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=freightflow
```

### Module Configuration
The module can be configured with custom rules and optimization parameters:

```typescript
// Custom rule implementation
class CustomOptimizationRule extends BaseRule {
  name = 'Custom Rule';
  description = 'Custom optimization rule';
  priority = 10;

  evaluate(route: Route, carriers: Carrier[], request: OptimizeRouteDto): RuleResult {
    // Custom evaluation logic
    return this.createResult(true, 85, 'Custom rule passed');
  }
}

// Add custom rule to rules engine
rulesEngine.addCustomRule(new CustomOptimizationRule());
```

## Testing

### Unit Tests
```bash
npm run test route-optimization
```

### Integration Tests
```bash
npm run test:e2e route-optimization
```

### Test Coverage
```bash
npm run test:cov
```

## Performance Considerations

### Optimization Performance
- **Dijkstra**: O(V²) - Best for simple shortest path problems
- **A***: O(b^d) - Best for heuristic-guided optimization
- **Genetic**: O(n²) - Best for complex multi-objective optimization
- **Simulated Annealing**: O(n log n) - Best for avoiding local optima
- **Ant Colony**: O(n²) - Best for dynamic route optimization

### Caching Strategy
- Route data is cached for 1 hour
- Carrier data is cached for 30 minutes
- Optimization results are cached for 15 minutes

### Database Indexing
- Routes: `origin`, `destination`, `status`, `routeType`
- Carriers: `name`, `status`, `carrierType`
- Segments: `routeId`, `segmentType`, `status`

## Monitoring and Analytics

### Key Metrics
- Route optimization success rate
- Average optimization time
- Cost savings achieved
- Carbon footprint reduction
- Carrier performance scores

### Logging
- All optimization requests are logged
- Performance metrics are tracked
- Error rates are monitored
- User behavior is analyzed

## Security Considerations

### Authentication
- All endpoints require authentication
- User context is maintained throughout optimization
- Request history is tied to user accounts

### Data Privacy
- Personal information is encrypted
- Optimization data is anonymized
- Audit trails are maintained

### Rate Limiting
- Optimization requests are rate-limited
- API endpoints have throttling
- Resource usage is monitored

## Future Enhancements

### Planned Features
- Real-time traffic integration
- Weather-based optimization
- Machine learning model integration
- Advanced analytics dashboard
- Multi-modal optimization
- Dynamic pricing integration

### Scalability Improvements
- Horizontal scaling support
- Database sharding
- Caching layer optimization
- Microservice architecture

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations
5. Start the development server: `npm run start:dev`

### Code Standards
- Follow NestJS best practices
- Use TypeScript strict mode
- Write comprehensive tests
- Document all public APIs
- Follow the existing code style

### Pull Request Process
1. Create a feature branch
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation
5. Submit pull request with detailed description

## License

This module is part of the FreightFlow project and follows the same licensing terms.
