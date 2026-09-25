import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShipmentTemplatesTable1724313600000
  implements MigrationInterface
{
  name = 'CreateShipmentTemplatesTable1724313600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "shipment_templates" (
        "id"                UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"           UUID         NOT NULL,
        "name"              VARCHAR(100) NOT NULL,
        "origin"            VARCHAR(255) NOT NULL,
        "destination"       VARCHAR(255) NOT NULL,
        "cargo_description" TEXT         NOT NULL,
        "weight_kg"         NUMERIC(10,2) NOT NULL,
        "price"             NUMERIC(14,2) NOT NULL,
        "currency"          VARCHAR(3)   NOT NULL DEFAULT 'USD',
        "created_at"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shipment_templates_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_shipment_templates_user_id_name"
          UNIQUE ("user_id", "name"),
        CONSTRAINT "FK_shipment_templates_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_shipment_templates_user_id"
        ON "shipment_templates" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_shipment_templates_user_id"`);
    await queryRunner.query(`DROP TABLE "shipment_templates"`);
  }
}
