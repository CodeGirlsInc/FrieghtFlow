# FreightFlow Complete Stellar Blockchain System

A comprehensive blockchain infrastructure for freight and cargo management built on Stellar, featuring multiple smart contracts, payment processing, insurance, and document management.

## 🌟 System Overview

FreightFlow is a complete Web3 freight management platform consisting of four interconnected smart contracts:

### 🚛 Core Contracts

1. **FreightFlow Core** - Main shipment management and tracking
2. **Payment Contract** - Escrow payments and multi-token support  
3. **Insurance Contract** - Cargo insurance policies and claims
4. **Document Contract** - Secure document storage and verification

### 🏗️ Architecture Features

- **Multi-party Authorization** - Role-based access (Admin, Shipper, Carrier, Receiver, Customs, Insurance)
- **Real-time Tracking** - Milestone-based shipment updates
- **Payment Escrow** - Secure payment processing with automated release
- **Insurance Integration** - Built-in cargo insurance and claims processing
- **Document Verification** - Blockchain-based document authenticity
- **Customs Integration** - Automated customs clearance workflows
- **API Layer** - RESTful APIs for frontend/backend integration
- **Monitoring System** - Real-time blockchain monitoring and alerts

## 🚀 Quick Start

### Prerequisites

1. **Install Rust and Cargo**
   \`\`\`bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   \`\`\`

2. **Install Stellar CLI**
   \`\`\`bash
   curl -L https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-cli-21.0.0-x86_64-unknown-linux-gnu.tar.gz | tar xz
   sudo mv stellar /usr/local/bin/
   \`\`\`

3. **Install Node.js dependencies**
   \`\`\`bash
   npm install
   \`\`\`

### Setup Development Environment

1. **Generate accounts and environment**
   \`\`\`bash
   npm run setup
   \`\`\`

2. **Fund test accounts**
   \`\`\`bash
   npm run fund-accounts
   \`\`\`

3. **Build all contracts**
   \`\`\`bash
   npm run build:all
   \`\`\`

4. **Deploy complete system**
   \`\`\`bash
   npm run deploy:all:testnet
   \`\`\`

5. **Initialize contracts**
   \`\`\`bash
   npm run invoke
   \`\`\`

6. **Run integration tests**
   \`\`\`bash
   npm run test:integration
   \`\`\`

7. **Start monitoring**
   \`\`\`bash
   npm run monitor
   \`\`\`

## 📋 Contract Functions

### FreightFlow Core Contract

**Shipment Management:**
- \`create_shipment()\` - Create new freight shipment with full details
- \`update_shipment_status()\` - Update status with milestone tracking
- \`confirm_customs_clearance()\` - Handle customs processing
- \`get_shipment()\` - Retrieve complete shipment information
- \`get_user_shipments()\` - Get shipments by user

**Access Control:**
- \`set_user_role()\` - Assign user roles (Admin only)
- \`get_user_role()\` - Check user permissions

### Payment Contract

**Payment Processing:**
- \`create_payment()\` - Initialize payment with escrow
- \`fund_payment()\` - Transfer tokens to escrow
- \`release_payment()\` - Release payment to payee
- \`refund_payment()\` - Refund payment to payer
- \`auto_release_payment()\` - Automated release after dispute period

**Token Management:**
- \`add_supported_token()\` - Add new payment tokens
- \`get_supported_tokens()\` - List supported currencies

### Insurance Contract

**Policy Management:**
- \`create_policy()\` - Create cargo insurance policy
- \`submit_claim()\` - Submit insurance claim
- \`review_claim()\` - Review and approve/reject claims
- \`mark_claim_paid()\` - Mark claim as paid
- \`cancel_policy()\` - Cancel insurance policy

### Document Contract

**Document Management:**
- \`upload_document()\` - Upload and hash documents
- \`verify_document()\` - Verify document authenticity
- \`update_access()\` - Manage document access permissions
- \`get_document()\` - Retrieve document with access control
- \`archive_document()\` - Archive old documents

## 🔧 API Integration

### RESTful API Endpoints

\`\`\`javascript
// Shipment Management
POST   /api/shipments              // Create shipment
GET    /api/shipments/:id          // Get shipment details
PUT    /api/shipments/:id/status   // Update shipment status

// Payment Processing  
POST   /api/payments               // Create payment
GET    /api/payments/:id           // Get payment details
PUT    /api/payments/:id/release   // Release payment

// Insurance
POST   /api/insurance/policies     // Create policy
POST   /api/insurance/claims       // Submit claim
PUT    /api/insurance/claims/:id   // Review claim

// Documents
POST   /api/documents              // Upload document
GET    /api/documents/:id          // Get document
PUT    /api/documents/:id/verify   // Verify document

// System
GET    /api/health                 // System health check
\`\`\`

### Frontend Integration (Next.js)

\`\`\`javascript
import { FreightFlowAPI } from './api/freightflow'

const api = new FreightFlowAPI(process.env.NEXT_PUBLIC_API_URL)

// Create shipment
const shipment = await api.createShipment({
  shipper: shipperAddress,
  carrier: carrierAddress,
  receiver: receiverAddress,
  origin: originLocation,
  destination: destinationLocation,
  cargo: cargoDetails,
  estimatedDelivery: deliveryDate,
  requiresCustoms: true
})
\`\`\`

### Backend Integration (NestJS)

\`\`\`typescript
import { Injectable } from '@nestjs/common'
import { BlockchainService } from './blockchain.service'

@Injectable()
export class ShipmentService {
  constructor(private blockchain: BlockchainService) {}

  async createShipment(data: CreateShipmentDto) {
    // Validate business logic
    const validation = await this.validateShipment(data)
    
    // Create on blockchain
    const shipmentId = await this.blockchain.createShipment(data)
    
    // Store in database for indexing
    await this.database.shipments.create({
      id: shipmentId,
      ...data,
      createdAt: new Date()
    })
    
    return shipmentId
  }
}
\`\`\`

## 🧪 Testing

### Unit Tests
\`\`\`bash
cargo test --workspace
\`\`\`

### Integration Tests
\`\`\`bash
npm run test:integration
\`\`\`

### Contract-specific Tests
\`\`\`bash
cargo test --package freightflow-core
cargo test --package freightflow-payment
cargo test --package freightflow-insurance
cargo test --package freightflow-documents
\`\`\`

## 📊 Monitoring & Analytics

### Real-time Monitoring
\`\`\`bash
npm run monitor
\`\`\`

### System Health Check
\`\`\`bash
curl http://localhost:3001/api/health
\`\`\`

### Contract Statistics
- Total shipments created
- Payment volume processed
- Insurance policies active
- Documents verified
- Transaction throughput

## 🔒 Security Features

### Multi-signature Support
- Critical operations require proper authorization
- Role-based access control across all contracts
- Time-locked operations for dispute resolution

### Payment Security
- Escrow-based payment processing
- Automated release conditions
- Dispute resolution mechanisms
- Multi-token support with validation

### Document Security
- Cryptographic hash verification
- Access control lists
- Immutable audit trails
- Version control

### Insurance Security
- Risk assessment integration
- Automated claim processing
- Fraud detection mechanisms
- Regulatory compliance

## 🛣️ Roadmap

### Phase 1 (Current)
- [x] Core smart contracts
- [x] Payment processing
- [x] Insurance integration
- [x] Document management
- [x] API layer
- [x] Monitoring system

### Phase 2 (Next)
- [ ] Oracle integration for real-world data
- [ ] IoT device integration
- [ ] Advanced analytics dashboard
- [ ] Mobile SDK
- [ ] Cross-chain bridge support

### Phase 3 (Future)
- [ ] AI-powered route optimization
- [ ] Carbon footprint tracking
- [ ] Regulatory compliance automation
- [ ] Global carrier network integration
- [ ] Predictive analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/amazing-feature\`)
3. Write tests for new functionality
4. Commit changes (\`git commit -m 'Add amazing feature'\`)
5. Push to branch (\`git push origin feature/amazing-feature\`)
6. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the FreightFlow development team
- Check the [Stellar documentation](https://developers.stellar.org/)
- Join our [Discord community](https://discord.gg/freightflow)

## 🔗 Links

- [Stellar Developer Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [FreightFlow Frontend Repository](../frontend)
- [FreightFlow Backend Repository](../backend)
- [API Documentation](./docs/api.md)
- [Contract Documentation](./docs/contracts.md)
\`\`\`

```gitignore file=".gitignore"
# Rust
/target/
**/*.rs.bk
Cargo.lock

# Environment variables
.env
.env.local
.env.production
.env.development

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Stellar CLI
.stellar/
.soroban/

# Build artifacts
*.wasm
*.wasm.gz
*.optimized.wasm

# Logs
*.log
logs/

# Temporary files
*.tmp
*.temp
.cache/

# Contract deployment artifacts
contract-*.json
deployment-*.json
deploy-*.json

# Test artifacts
test-results/
coverage/
.nyc_output/

# Database
*.db
*.sqlite
*.sqlite3

# Redis dump
dump.rdb

# API keys and secrets
secrets/
keys/
*.pem
*.key

# Documentation build
docs/_build/
site/

# Backup files
*.bak
*.backup

# Local development
.local/
local/
