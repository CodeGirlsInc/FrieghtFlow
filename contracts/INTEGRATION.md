# Backend Integration Guide

How to invoke FreightFlow's Soroban contracts from the NestJS backend using `@stellar/stellar-sdk`.

## Setup

```typescript
import { SorobanRpc, Contract, Address, xdr, Keypair } from '@stellar/stellar-sdk';

const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = 'Testnet SDF Future Network ; October 2022';

const contractIds = {
  identity: process.env.SOROBAN_IDENTITY_CONTRACT_ADDRESS!,
  shipment: process.env.SOROBAN_SHIPMENT_CONTRACT_ADDRESS!,
  escrow: process.env.SOROBAN_ESCROW_CONTRACT_ADDRESS!,
  document: process.env.SOROBAN_DOCUMENT_CONTRACT_ADDRESS!,
  reputation: process.env.SOROBAN_REPUTATION_CONTRACT_ADDRESS!,
};

const adminKeypair = Keypair.fromSecret(process.env.SOROBAN_ADMIN_SECRET!);
```

## Invoking a Contract

### Read-only calls (viewFn)

```typescript
async function getShipment(shipmentId: bigint) {
  const contract = new Contract(contractIds.shipment);
  const result = await server.simulateTransaction(
    contract.call('get_shipment', xdr.ScVal.fromBigInt(shipmentId)),
  );
  return result.result?.retval;
}
```

### State-changing calls (with auth)

```typescript
import { TransactionBuilder, Networks, BASE_FEE } from '@stellar/stellar-sdk';

async function fundEscrow(
  shipperSecret: string,
  carrierAddress: string,
  shipmentId: bigint,
  amount: bigint,
) {
  const shipperKeypair = Keypair.fromSecret(shipperSecret);
  const contract = new Contract(contractIds.escrow);

  const account = await server.getAccount(shipperKeypair.publicKey());
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase })
    .addOperation(
      contract.call(
        'fund_escrow',
        new Address(shipperKeypair.publicKey()).toScVal(),
        new Address(carrierAddress).toScVal(),
        xdr.ScVal.fromBigInt(shipmentId),
        xdr.ScVal.fromBigInt(amount),
      ),
    )
    .setTimeout(300)
    .build();

  tx.sign(shipperKeypair);
  const result = await server.sendTransaction(tx);
  return result;
}
```

## XDR Response Decoding

Contract return values are `xdr.ScVal` objects. To decode them:

```typescript
import { xdr } from '@stellar/stellar-sdk';

function decodeShipment(scVal: xdr.ScVal) {
  const obj = scVal.map();
  const fields: Record<string, unknown> = {};
  for (const entry of obj) {
    const key = entry.key().sym().toString();
    fields[key] = entry.val();
  }
  return {
    id: fields.id?.u64(),
    origin: fields.origin?.str().toString(),
    destination: fields.destination?.str().toString(),
    status: fields.status?.u32(),
  };
}
```

## Common Pitfalls

1. **Stroops, not XLM.** All amounts are in stroops (1 XLM = 10,000,000 stroops).
2. **Auth simulation.** Always simulate first to get the required auth entries, then sign.
3. **Transaction expiry.** Set `setTimeout` (e.g. 300 seconds) to avoid stale transactions.
4. **Contract addresses.** Use environment variables, never hardcode addresses.
5. **Network passphrase.** Must match exactly between deploy and invoke.

## End-to-end Example: Fund Escrow

```typescript
import { SorobanRpc, Contract, Address, Keypair, xdr, TransactionBuilder, Networks, BASE_FEE } from '@stellar/stellar-sdk';

const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const passphrase = 'Testnet SDF Future Network ; October 2022';

async function fundEscrowOnChain(
  escrowContractId: string,
  shipperSecret: string,
  carrierAddress: string,
  shipmentId: number,
  amountLamports: number,
) {
  const kp = Keypair.fromSecret(shipperSecret);
  const contract = new Contract(escrowContractId);
  const account = await server.getAccount(kp.publicKey());

  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: passphrase })
    .addOperation(
      contract.call(
        'fund_escrow',
        new Address(kp.publicKey()).toScVal(),
        new Address(carrierAddress).toScVal(),
        xdr.ScVal.fromBigInt(BigInt(shipmentId)),
        xdr.ScVal.fromBigInt(BigInt(amountLamports)),
      ),
    )
    .setTimeout(300)
    .build();

  tx.sign(kp);

  const sim = await server.simulateTransaction(tx);
  if (sim.error) throw new Error(`Simulation failed: ${sim.error}`);

  const sendResult = await server.sendTransaction(tx);
  if (sendResult.status === 'ERROR') throw new Error('Transaction failed');

  const receipt = await server.getTransaction(sendResult.hash);
  return receipt;
}
```

## Error Handling

Each contract defines its own error enum mapped to `u32` values. When a contract call fails, the error is returned as an `ScVal` with the error code:

```typescript
const errorMap: Record<number, string> = {
  1: 'NotInitialized',
  2: 'AlreadyInitialized',
  3: 'NotFound',
  4: 'AlreadyFunded',
  5: 'NotFunded',
  6: 'InvalidStatus',
  7: 'Unauthorized',
  8: 'InvalidAmount',
  9: 'InsufficientBalance',
};

function parseContractError(retval: xdr.ScVal): string {
  const code = retval.i32();
  return errorMap[code] ?? `Unknown error (${code})`;
}
```
