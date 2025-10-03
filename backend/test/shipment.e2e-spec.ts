import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShipmentModule } from "../src/shipment/shipment.module";
import { Shipment } from "../src/shipment/shipment.entity";
import { ShipmentStatusHistory } from "../src/shipment/shipment-status-history.entity";
import { ShipmentStatus } from "../src/shipment/shipment.entity";

describe("Shipment (e2e)", () => {
  let app: INestApplication;
  let createdShipmentId: string;
  let trackingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          entities: [Shipment, ShipmentStatusHistory],
          synchronize: true,
        }),
        ShipmentModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/shipments (POST)", () => {
    it("should create a new shipment", () => {
      const createShipmentDto = {
        origin: "New York, NY",
        destination: "Los Angeles, CA",
        carrier: "FedEx",
        estimatedDelivery: "2024-12-25T00:00:00.000Z",
        freightDetails: "Electronics package",
        weight: 15.5,
        weightUnit: "kg",
        notes: "Handle with care",
      };

      return request(app.getHttpServer())
        .post("/shipments")
        .send(createShipmentDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body).toHaveProperty("trackingId");
          expect(res.body.origin).toBe(createShipmentDto.origin);
          expect(res.body.destination).toBe(createShipmentDto.destination);
          expect(res.body.carrier).toBe(createShipmentDto.carrier);
          expect(res.body.status).toBe(ShipmentStatus.PENDING);
          expect(res.body.trackingId).toMatch(/^FF-\d{8}-[A-Z0-9]{5}$/);
          
          createdShipmentId = res.body.id;
          trackingId = res.body.trackingId;
        });
    });

    it("should create shipment with minimal required fields", () => {
      const minimalDto = {
        origin: "Chicago, IL",
        destination: "Miami, FL",
        carrier: "UPS",
      };

      return request(app.getHttpServer())
        .post("/shipments")
        .send(minimalDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.status).toBe(ShipmentStatus.PENDING);
        });
    });

    it("should validate required fields", () => {
      const invalidDto = {
        destination: "Miami, FL",
        carrier: "UPS",
      };

      return request(app.getHttpServer())
        .post("/shipments")
        .send(invalidDto)
        .expect(400);
    });
  });

  describe("/shipments (GET)", () => {
    it("should return all shipments", () => {
      return request(app.getHttpServer())
        .get("/shipments")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe("/shipments/:id (GET)", () => {
    it("should return a specific shipment by ID", () => {
      return request(app.getHttpServer())
        .get(`/shipments/${createdShipmentId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdShipmentId);
          expect(res.body.trackingId).toBe(trackingId);
        });
    });

    it("should return 404 for non-existent shipment", () => {
      return request(app.getHttpServer())
        .get("/shipments/non-existent-id")
        .expect(404);
    });
  });

  describe("/shipments/tracking/:trackingId (GET)", () => {
    it("should return shipment by tracking ID", () => {
      return request(app.getHttpServer())
        .get(`/shipments/tracking/${trackingId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.trackingId).toBe(trackingId);
          expect(res.body.id).toBe(createdShipmentId);
        });
    });

    it("should return 404 for non-existent tracking ID", () => {
      return request(app.getHttpServer())
        .get("/shipments/tracking/INVALID-TRACKING")
        .expect(404);
    });
  });

  describe("/shipments/search (GET)", () => {
    it("should search shipments by query", () => {
      return request(app.getHttpServer())
        .get("/shipments/search?q=FedEx")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.some((s: any) => s.carrier === "FedEx")).toBe(true);
        });
    });

    it("should search by origin", () => {
      return request(app.getHttpServer())
        .get("/shipments/search?q=New York")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.some((s: any) => s.origin.includes("New York"))).toBe(true);
        });
    });
  });

  describe("/shipments/:id/status-history (GET)", () => {
    it("should return shipment status history", () => {
      return request(app.getHttpServer())
        .get(`/shipments/${createdShipmentId}/status-history`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty("status");
          expect(res.body[0]).toHaveProperty("timestamp");
        });
    });
  });

  describe("/shipments/:id/location (PATCH) and /shipments/:id/latest-location (GET)", () => {
    it("should update shipment location", async () => {
      const locationDto = {
        shipmentId: createdShipmentId,
        latitude: 34.0522,
        longitude: -118.2437,
        accuracy: 10,
        speed: 50,
        heading: 180,
        source: "test-device",
        timestamp: new Date().toISOString(),
      };
      const res = await request(app.getHttpServer())
        .patch(`/shipments/${createdShipmentId}/location`)
        .send(locationDto);
      expect(res.status).toBe(200);
      expect(res.body.currentLatitude).toBe(locationDto.latitude);
      expect(res.body.currentLongitude).toBe(locationDto.longitude);
    });

    it("should get latest shipment location", async () => {
      const res = await request(app.getHttpServer())
        .get(`/shipments/${createdShipmentId}/latest-location`);
      expect(res.status).toBe(200);
      expect(res.body.latitude).toBe(34.0522);
      expect(res.body.longitude).toBe(-118.2437);
      expect(res.body.source).toBe("test-device");
    });
  });
  describe("/shipments/:id (PATCH)", () => {
    it("should update shipment details", () => {
      const updateDto = {
        notes: "Updated notes - package is fragile",
        weight: 16.2,
      };

      return request(app.getHttpServer())
        .patch(`/shipments/${createdShipmentId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.notes).toBe(updateDto.notes);
          expect(res.body.weight).toBe(updateDto.weight);
        });
    });
  });

  describe("/shipments/:id/status (PATCH)", () => {
    it("should update shipment status", () => {
      const statusUpdateDto = {
        status: ShipmentStatus.PICKED_UP,
        location: "New York Distribution Center",
        description: "Package picked up from sender",
      };

      return request(app.getHttpServer())
        .patch(`/shipments/${createdShipmentId}/status`)
        .send(statusUpdateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(ShipmentStatus.PICKED_UP);
        });
    });

    it("should update status to in transit", () => {
      const statusUpdateDto = {
        status: ShipmentStatus.IN_TRANSIT,
        location: "Chicago Hub",
        description: "Package in transit to destination",
      };

      return request(app.getHttpServer())
        .patch(`/shipments/${createdShipmentId}/status`)
        .send(statusUpdateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(ShipmentStatus.IN_TRANSIT);
        });
    });

    it("should update status to out for delivery", () => {
      const statusUpdateDto = {
        status: ShipmentStatus.OUT_FOR_DELIVERY,
        location: "Los Angeles Local Facility",
        description: "Package out for final delivery",
      };

      return request(app.getHttpServer())
        .patch(`/shipments/${createdShipmentId}/status`)
        .send(statusUpdateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(ShipmentStatus.OUT_FOR_DELIVERY);
        });
    });

    it("should update status to delivered", () => {
      const statusUpdateDto = {
        status: ShipmentStatus.DELIVERED,
        location: "Los Angeles, CA",
        description: "Package delivered successfully",
      };

      return request(app.getHttpServer())
        .patch(`/shipments/${createdShipmentId}/status`)
        .send(statusUpdateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(ShipmentStatus.DELIVERED);
        });
    });

    it("should not allow status update for delivered shipment", () => {
      const statusUpdateDto = {
        status: ShipmentStatus.IN_TRANSIT,
        location: "Somewhere",
        description: "This should fail",
      };

      return request(app.getHttpServer())
        .patch(`/shipments/${createdShipmentId}/status`)
        .send(statusUpdateDto)
        .expect(400);
    });
  });

  describe("/shipments/:id (DELETE)", () => {
    it("should delete a shipment", () => {
      return request(app.getHttpServer())
        .delete(`/shipments/${createdShipmentId}`)
        .expect(204);
    });

    it("should return 404 for deleted shipment", () => {
      return request(app.getHttpServer())
        .get(`/shipments/${createdShipmentId}`)
        .expect(404);
    });
  });
});
