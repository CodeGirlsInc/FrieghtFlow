import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1724140800000 implements MigrationInterface {
  name = 'CreatePaymentsTable1724140800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."payment_status_enum" AS ENUM(
        'pending', 'funded', 'released', 'refunded', 'disputed', 'cancelled'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id"                    UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "shipment_id"           UUID         NOT NULL,
        "on_chain_shipment_id"  BIGINT       NOT NULL,
        "status"                "public"."payment_status_enum" NOT NULL DEFAULT 'pending',
        "amount"                NUMERIC(14,2) NOT NULL,
        "asset_code"            VARCHAR(12)  NOT NULL DEFAULT 'USDC',
        "token_contract_address" VARCHAR(64),
        "shipper_wallet_address" VARCHAR(64),
        "carrier_wallet_address" VARCHAR(64),
        "funded_at"             TIMESTAMPTZ,
        "settled_at"            TIMESTAMPTZ,
        "created_at"            TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"            TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payments_shipment_id" UNIQUE ("shipment_id"),
        CONSTRAINT "UQ_payments_on_chain_shipment_id" UNIQUE ("on_chain_shipment_id"),
        CONSTRAINT "FK_payments_shipment" FOREIGN KEY ("shipment_id")
          REFERENCES "shipments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_status" ON "payments" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_payments_status"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
  }
}
