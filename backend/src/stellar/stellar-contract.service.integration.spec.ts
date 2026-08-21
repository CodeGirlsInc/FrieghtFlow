// Real-network integration tests against the actual Soroban testnet RPC
// (issue #1275 acceptance criterion: "All 5 write methods succeed
// end-to-end against a testnet escrow, verifiable via getEscrow"). These
// make live network calls and are NOT part of the fast, hermetic unit
// suite CI gates on — they only run when explicitly opted into:
//
//   RUN_SOROBAN_INTEGRATION_TESTS=true \
//   ESCROW_CONTRACT_ADDRESS=C... \
//   TOKEN_CONTRACT_ADDRESS=C... \
//   PLATFORM_ADMIN_SECRET=S... \
//     npm run test -- stellar-contract.service.integration
//
// The RPC-connectivity test below needs no deployed contract and always
// runs when opted in. The full escrow read/write flow additionally needs
// a real escrow contract instance deployed to testnet (its admin must be
// the keypair behind PLATFORM_ADMIN_SECRET) and is skipped with a clear
// reason if ESCROW_CONTRACT_ADDRESS/TOKEN_CONTRACT_ADDRESS aren't set.
import { Keypair, SorobanRpc } from '@stellar/stellar-sdk';
import { ConfigService } from '@nestjs/config';
import { StellarContractService } from './stellar-contract.service';

const runIntegration = process.env.RUN_SOROBAN_INTEGRATION_TESTS === 'true';
const describeIfEnabled = runIntegration ? describe : describe.skip;

const RPC_URL =
  process.env.SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE =
  process.env.STELLAR_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015';

describeIfEnabled('StellarContractService (real Soroban testnet)', () => {
  jest.setTimeout(30_000);

  it('connects to the real Soroban RPC endpoint and reads the latest ledger', async () => {
    const server = new SorobanRpc.Server(RPC_URL);
    const latest = await server.getLatestLedger();
    expect(latest.sequence).toBeGreaterThan(0);
  });

  const hasDeployedEscrow =
    !!process.env.ESCROW_CONTRACT_ADDRESS &&
    !!process.env.TOKEN_CONTRACT_ADDRESS &&
    !!process.env.PLATFORM_ADMIN_SECRET;
  const describeIfDeployed = hasDeployedEscrow ? describe : describe.skip;

  describeIfDeployed('against a deployed escrow instance', () => {
    it('funds, releases, and reads back an escrow end-to-end', async () => {
      const config = new ConfigService({
        SOROBAN_ENABLED: 'true',
        SOROBAN_RPC_URL: RPC_URL,
        STELLAR_NETWORK_PASSPHRASE: NETWORK_PASSPHRASE,
        ESCROW_CONTRACT_ADDRESS: process.env.ESCROW_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ADDRESS: process.env.TOKEN_CONTRACT_ADDRESS,
        PLATFORM_ADMIN_SECRET: process.env.PLATFORM_ADMIN_SECRET,
      });
      const service = new StellarContractService(config);
      await service.onModuleInit();

      const shipper = Keypair.random();
      await fetch(
        `https://friendbot.stellar.org/?addr=${encodeURIComponent(shipper.publicKey())}`,
      );

      const carrier = Keypair.random();
      const shipmentId = BigInt(Date.now());
      const amount = 100_000_000n;

      await service.fundEscrow(
        shipper,
        carrier.publicKey(),
        shipmentId,
        amount,
      );

      const funded = await service.getEscrow(shipmentId);
      expect(funded.status).toBe('Funded');
      expect(funded.amount).toBe(amount);

      await service.releasePayment(shipmentId);

      const released = await service.getEscrow(shipmentId);
      expect(released.status).toBe('Released');
    });
  });
});
