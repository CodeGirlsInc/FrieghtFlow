import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShipmentModule } from "../src/shipment/shipment.module";
import { TrackingModule } from "../src/tracking/tracking.module";
import { Shipment } from "../src/shipment/shipment.entity";
import { ShipmentStatusHistory } from "../src/shipment/shipment-status-history.entity";
import { TrackingEvent } from "../src/tracking/tracking-event.entity";

describe("Tracking (e2e)", () => {
  let app: INestApplication;
  let shipmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          entities: [Shipment, ShipmentStatusHistory, TrackingEvent],
          synchronize: true,
        }),
        ShipmentModule,
        TrackingModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a shipment to attach tracking events to", async () => {
    const createShipmentDto = {
      origin: "Austin, TX",
      destination: "Denver, CO",
      carrier: "ACME",
    };

    const res = await request(app.getHttpServer())
      .post("/shipments")
      .send(createShipmentDto)
      .expect(201);

    shipmentId = res.body.id;
    expect(shipmentId).toBeDefined();
  });

  describe("/tracking (POST)", () => {
    it("should fail for non-existent shipment", async () => {
      await request(app.getHttpServer())
        .post("/tracking")
        .send({ shipmentId: "00000000-0000-0000-0000-000000000000", location: "X", statusUpdate: "Test" })
        .expect(404);
    });

    it("should create first tracking event", async () => {
      const dto = { shipmentId, location: "Austin Facility", statusUpdate: "Picked up" };
      const res = await request(app.getHttpServer())
        .post("/tracking")
        .send(dto)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.shipmentId).toBe(shipmentId);
      expect(res.body.location).toBe(dto.location);
      expect(res.body.statusUpdate).toBe(dto.statusUpdate);
      expect(res.body).toHaveProperty("timestamp");
    });

    it("should create second tracking event", async () => {
      const dto = { shipmentId, location: "Oklahoma Hub", statusUpdate: "In transit" };
      await request(app.getHttpServer())
        .post("/tracking")
        .send(dto)
        .expect(201);
    });

    it("should create third tracking event", async () => {
      const dto = { shipmentId, location: "Denver Facility", statusUpdate: "Arrived at destination city" };
      await request(app.getHttpServer())
        .post("/tracking")
        .send(dto)
        .expect(201);
    });
  });

  describe("/shipments/:id/tracking (GET)", () => {
    it("should list tracking events in chronological order", async () => {
      const res = await request(app.getHttpServer())
        .get(`/shipments/${shipmentId}/tracking`)
        .expect(200);

      const events: any[] = res.body;
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThanOrEqual(3);
      // Verify ascending by timestamp
      for (let i = 1; i < events.length; i++) {
        const prev = new Date(events[i - 1].timestamp).getTime();
        const curr = new Date(events[i].timestamp).getTime();
        expect(curr).toBeGreaterThanOrEqual(prev);
      }
      // spot-check order ends
      expect(events[0]).toHaveProperty("location");
      expect(events[events.length - 1]).toHaveProperty("location");
    });
  });
});
