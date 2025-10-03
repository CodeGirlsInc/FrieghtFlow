import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InsuranceService } from "./services/insurance.service";
import { InsurancePolicy } from "./entities/insurance-policy.entity";
import { ClaimHistory, ClaimStatus, ClaimType } from "./entities/claim-history.entity";
import { Shipment } from "../shipment/shipment.entity";
import { ShipmentStatusHistory } from "../shipment/shipment-status-history.entity";

describe("InsuranceService (unit)", () => {
	let service: InsuranceService;
	let createdShipment: Shipment;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				TypeOrmModule.forRoot({
					type: "sqlite",
					database: ":memory:",
					dropSchema: true,
					entities: [Shipment, ShipmentStatusHistory, InsurancePolicy, ClaimHistory],
					synchronize: true,
				}),
				TypeOrmModule.forFeature([Shipment, ShipmentStatusHistory, InsurancePolicy, ClaimHistory]),
			],
			providers: [InsuranceService],
		}).compile();

		service = module.get<InsuranceService>(InsuranceService);

		// Manually create a shipment via TypeORM repository through the data source
		const dataSource = module.get<any>("DataSource");
		const shipmentRepo = dataSource.getRepository(Shipment);
		createdShipment = await shipmentRepo.save(
			shipmentRepo.create({
				trackingId: "FF-20240101-ABCDE",
				origin: "NYC",
				destination: "LA",
				carrier: "FedEx",
			})
		);
	});

	it("creates an insurance policy for a shipment", async () => {
		const policy = await service.createInsurancePolicy({
			policyNumber: "POL-001",
			provider: "Global Insure",
			coverageType: "all_risk" as any,
			coverageAmount: 100000,
			premiumAmount: 1200,
			effectiveDate: new Date("2024-01-01").toISOString(),
			expiryDate: new Date("2024-12-31").toISOString(),
			shipmentId: createdShipment.id,
		} as any);

		expect(policy).toHaveProperty("id");
		expect(policy.policyNumber).toBe("POL-001");
		expect(policy.shipmentId).toBe(createdShipment.id);
	});

	it("lists policies with pagination", async () => {
		const res = await service.findAllInsurancePolicies({ page: 1, limit: 10 } as any);
		expect(res.total).toBeGreaterThan(0);
		expect(Array.isArray(res.data)).toBe(true);
	});

	it("updates a policy and fetches by policy number", async () => {
		const found = await service.findInsurancePolicyByPolicyNumber("POL-001");
		const updated = await service.updateInsurancePolicy(found.id, { provider: "Global Insure Ltd" } as any);
		expect(updated.provider).toBe("Global Insure Ltd");
	});

	it("creates a claim for a policy", async () => {
		const policy = await service.findInsurancePolicyByPolicyNumber("POL-001");
		const claim = await service.createClaim({
			claimNumber: "CLM-001",
			claimType: ClaimType.DAMAGE,
			claimedAmount: 5000,
			incidentDate: new Date("2024-06-01").toISOString(),
			claimDate: new Date("2024-06-02").toISOString(),
			description: "Damaged during transit",
			insurancePolicyId: policy.id,
		} as any);
		expect(claim).toHaveProperty("id");
		expect(claim.status).toBe(ClaimStatus.SUBMITTED);
	});

	it("lists claims and updates a claim", async () => {
		const list = await service.findAllClaims({ page: 1, limit: 10 } as any);
		expect(list.total).toBeGreaterThan(0);

		const claim = await service.findClaimByClaimNumber("CLM-001");
		const updated = await service.updateClaim(claim.id, { status: ClaimStatus.APPROVED } as any);
		expect(updated.status).toBe(ClaimStatus.APPROVED);
	});

	it("deletes claim and policy", async () => {
		const claim = await service.findClaimByClaimNumber("CLM-001");
		await service.deleteClaim(claim.id);
		await expect(service.findClaimByClaimNumber("CLM-001")).rejects.toBeDefined();

		const policy = await service.findInsurancePolicyByPolicyNumber("POL-001");
		await service.deleteInsurancePolicy(policy.id);
		await expect(service.findInsurancePolicyByPolicyNumber("POL-001")).rejects.toBeDefined();
	});
});
