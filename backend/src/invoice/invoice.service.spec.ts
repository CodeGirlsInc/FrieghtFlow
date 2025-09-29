import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Invoice } from "../src/invoice/invoice.entity";
import { InvoiceService } from "../src/invoice/invoice.service";
import { join } from "path";
import * as fs from "fs";

// ensure invoices dir exists for tests
beforeAll(() => {
  const dir = join(process.cwd(), "invoices");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

describe("InvoiceService (unit)", () => {
  let service: InvoiceService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          entities: [Invoice],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Invoice]),
      ],
      providers: [InvoiceService],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it("creates invoice and generates pdf", async () => {
    const dto = {
      customerId: "cust-123",
      amount: 1500.5,
      currency: "USD",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const inv = await service.create(dto as any);
    expect(inv).toHaveProperty("id");
    expect(inv.customerId).toBe(dto.customerId);
    expect(inv.pdfUrl).toMatch(/\/invoices\/.*\.pdf/);

    // file should exist
    const filepath = `invoices/${inv.id}.pdf`;
    expect(fs.existsSync(filepath)).toBe(true);
  });

  it("marks invoice as paid", async () => {
    const dto = {
      customerId: "cust-xyz",
      amount: 100,
      currency: "NGN",
      dueDate: new Date().toISOString(),
    };
    const inv = await service.create(dto as any);
    const paid = await service.markAsPaid(inv.id);
    expect(paid.paymentStatus).toBe("paid");
  });
});
