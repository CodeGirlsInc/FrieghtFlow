# Starknet Escrow Contract Tests

from starkware.starknet.testing.starknet import Starknet
import pytest
from utils import Signer

# Constants
OWNER = 1234
PAYER = 1111
PAYEE = 2222
RESOLVER = 3333
TOKEN = 4444

signer = Signer(OWNER)

@pytest.mark.asyncio
async def test_create_escrow():
    starknet = await Starknet.empty()
    contract = await starknet.deploy('src/escrow.cairo')

    # Set platform owner
    await contract.platform_owner.write(OWNER).invoke()
    # Add resolver
    await contract.dispute_resolvers.write(RESOLVER, True).invoke()

    milestones = [100, 200, 300]
    exec_info = await contract.create_escrow(
        payer=PAYER,
        payee=PAYEE,
        token=TOKEN,
        milestones=milestones,
        resolver=RESOLVER
    ).invoke(caller_address=PAYER)
    escrow_id = exec_info.result.escrow_id
    details = (await contract.get_escrow_details(escrow_id).call()).result.details
    assert details.payer == PAYER
    assert details.payee == PAYEE
    assert details.token == TOKEN
    assert details.resolver == RESOLVER
    assert details.total_amount == sum(milestones)
    assert details.status == 0  # Pending

@pytest.mark.asyncio
async def test_deposit_and_release():
    starknet = await Starknet.empty()
    contract = await starknet.deploy('src/escrow.cairo')
    await contract.platform_owner.write(OWNER).invoke()
    await contract.dispute_resolvers.write(RESOLVER, True).invoke()
    milestones = [100, 200]
    exec_info = await contract.create_escrow(
        payer=PAYER,
        payee=PAYEE,
        token=TOKEN,
        milestones=milestones,
        resolver=RESOLVER
    ).invoke(caller_address=PAYER)
    escrow_id = exec_info.result.escrow_id
    await contract.deposit_funds(escrow_id, 300).invoke(caller_address=PAYER)
    details = (await contract.get_escrow_details(escrow_id).call()).result.details
    assert details.available_balance == 300
    assert details.status == 1  # Funded
    await contract.release_milestone(escrow_id, 0).invoke(caller_address=PAYER)
    details = (await contract.get_escrow_details(escrow_id).call()).result.details
    assert details.released_amount == 100
    assert details.available_balance == 200

@pytest.mark.asyncio
async def test_dispute_and_resolve():
    starknet = await Starknet.empty()
    contract = await starknet.deploy('src/escrow.cairo')
    await contract.platform_owner.write(OWNER).invoke()
    await contract.dispute_resolvers.write(RESOLVER, True).invoke()
    milestones = [100, 200]
    exec_info = await contract.create_escrow(
        payer=PAYER,
        payee=PAYEE,
        token=TOKEN,
        milestones=milestones,
        resolver=RESOLVER
    ).invoke(caller_address=PAYER)
    escrow_id = exec_info.result.escrow_id
    await contract.deposit_funds(escrow_id, 300).invoke(caller_address=PAYER)
    await contract.initiate_dispute(escrow_id).invoke(caller_address=PAYER)
    details = (await contract.get_escrow_details(escrow_id).call()).result.details
    assert details.status == 2  # InDispute
    await contract.resolve_dispute(escrow_id, 150, 150).invoke(caller_address=RESOLVER)
    details = (await contract.get_escrow_details(escrow_id).call()).result.details
    assert details.status == 3  # Completed
    assert details.available_balance == 0

@pytest.mark.asyncio
async def test_refund():
    starknet = await Starknet.empty()
    contract = await starknet.deploy('src/escrow.cairo')
    await contract.platform_owner.write(OWNER).invoke()
    await contract.dispute_resolvers.write(RESOLVER, True).invoke()
    milestones = [100, 200]
    exec_info = await contract.create_escrow(
        payer=PAYER,
        payee=PAYEE,
        token=TOKEN,
        milestones=milestones,
        resolver=RESOLVER
    ).invoke(caller_address=PAYER)
    escrow_id = exec_info.result.escrow_id
    await contract.deposit_funds(escrow_id, 300).invoke(caller_address=PAYER)
    await contract.request_refund(escrow_id).invoke(caller_address=PAYER)
    details = (await contract.get_escrow_details(escrow_id).call()).result.details
    assert details.status == 4  # Refunded
    assert details.available_balance == 0
