import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppModule } from "../src/app.module";
import { Invoice } from "../src/invoice/invoice.entity";

describe("Invoice E2E", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          entities: [Invoice],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /invoices -> creates invoice", async () => {
    const res = await request(app.getHttpServer())
      .post("/invoices")
      .send({
        customerId: "cust-e2e-1",
        amount: 250.0,
        currency: "USD",
        dueDate: new Date().toISOString(),
      })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    expect(res.body.paymentStatus).toBe("pending");
    expect(res.body.pdfUrl).toBeDefined();
  });

  it("PATCH /invoices/:id/pay -> marks paid", async () => {
    const createRes = await request(app.getHttpServer())
      .post("/invoices")
      .send({
        customerId: "cust-e2e-2",
        amount: 500,
        currency: "USD",
        dueDate: new Date().toISOString(),
      })
      .expect(201);

    const id = createRes.body.id;
    const payRes = await request(app.getHttpServer()).patch(`/invoices/${id}/pay`).expect(200);
    expect(payRes.body.paymentStatus).toBe("paid");
  });
});
