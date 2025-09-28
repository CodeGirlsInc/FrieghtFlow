import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shipment } from "../src/shipment/shipment.entity";
import { ShipmentStatusHistory } from "../src/shipment/shipment-status-history.entity";
import { InsuranceModule } from "../src/insurance/insurance.module";
import { InsurancePolicy } from "../src/insurance/entities/insurance-policy.entity";
import { ClaimHistory } from "../src/insurance/entities/claim-history.entity";

describe("Insurance (e2e)", () => {
	let app: INestApplication;
	let shipmentId: string;
	let policyId: string;
	let claimId: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				TypeOrmModule.forRoot({
					type: "sqlite",
					database: ":memory:",
					dropSchema: true,
					entities: [Shipment, ShipmentStatusHistory, InsurancePolicy, ClaimHistory],
					synchronize: true,
				}),
				TypeOrmModule.forFeature([Shipment, ShipmentStatusHistory]),
				InsuranceModule,
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// create a shipment directly via repository
		const dataSource = moduleFixture.get<any>("DataSource");
		const shipmentRepo = dataSource.getRepository(Shipment);
		const created = await shipmentRepo.save(
			shipmentRepo.create({
				trackingId: "FF-20240101-ABCDE",
				origin: "NYC",
				destination: "LA",
				carrier: "FedEx",
			})
		);
		shipmentId = created.id;
	});

	afterAll(async () => {
		await app.close();
	});

	it("POST /insurance/policies creates policy", async () => {
		const dto = {
			policyNumber: "POL-E2E-1",
			provider: "Global Insure",
			coverageType: "all_risk",
			coverageAmount: 100000,
			premiumAmount: 999.99,
			effectiveDate: new Date("2024-01-01").toISOString(),
			expiryDate: new Date("2024-12-31").toISOString(),
			shipmentId,
		};

		const res = await request(app.getHttpServer())
			.post("/insurance/policies")
			.send(dto)
			.expect(201);

		policyId = res.body.id;
		expect(res.body.policyNumber).toBe(dto.policyNumber);
		expect(res.body.shipmentId).toBe(shipmentId);
	});

	it("GET /insurance/policies returns list", async () => {
		const res = await request(app.getHttpServer())
			.get("/insurance/policies")
			.expect(200);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.total).toBeGreaterThan(0);
	});

	it("GET /insurance/policies/:id returns policy", async () => {
		const res = await request(app.getHttpServer())
			.get(`/insurance/policies/${policyId}`)
			.expect(200);
		expect(res.body.id).toBe(policyId);
	});

	it("POST /insurance/claims creates claim", async () => {
		const dto = {
			claimNumber: "CLM-E2E-1",
			claimType: "damage",
			claimedAmount: 2500.5,
			incidentDate: new Date("2024-06-10").toISOString(),
			claimDate: new Date("2024-06-12").toISOString(),
			description: "Damaged during transit",
			insurancePolicyId: policyId,
		};

		const res = await request(app.getHttpServer())
			.post("/insurance/claims")
			.send(dto)
			.expect(201);

		claimId = res.body.id;
		expect(res.body.claimNumber).toBe(dto.claimNumber);
		expect(res.body.insurancePolicyId).toBe(policyId);
	});

	it("GET /insurance/claims returns list", async () => {
		const res = await request(app.getHttpServer())
			.get("/insurance/claims")
			.expect(200);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.total).toBeGreaterThan(0);
	});

	it("PATCH /insurance/claims/:id updates claim", async () => {
		const res = await request(app.getHttpServer())
			.patch(`/insurance/claims/${claimId}`)
			.send({ status: "approved" })
			.expect(200);
		expect(res.body.status).toBe("approved");
	});

	it("DELETE /insurance/claims/:id deletes claim", async () => {
		await request(app.getHttpServer())
			.delete(`/insurance/claims/${claimId}`)
			.expect(204);
	});

	it("DELETE /insurance/policies/:id deletes policy", async () => {
		await request(app.getHttpServer())
			.delete(`/insurance/policies/${policyId}`)
			.expect(204);
	});
});
