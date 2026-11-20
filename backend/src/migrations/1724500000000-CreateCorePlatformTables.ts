import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCorePlatformTables1724500000000
  implements MigrationInterface
{
  name = 'CreateCorePlatformTables1724500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM(
        'shipper', 'carrier', 'admin'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "email" VARCHAR NOT NULL,
        "password_hash" VARCHAR NOT NULL,
        "first_name" VARCHAR NOT NULL,
        "last_name" VARCHAR NOT NULL,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'shipper',
        "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "wallet_address" VARCHAR,
        "refresh_token" VARCHAR,
        "verification_token" VARCHAR,
        "verification_token_expiry" TIMESTAMPTZ,
        "reset_password_token" VARCHAR,
        "reset_password_expiry" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."shipment_status_enum" AS ENUM(
        'pending', 'accepted', 'in_transit', 'delivered', 'completed', 'cancelled', 'disputed'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."cargo_category_enum" AS ENUM(
        'food', 'electronics', 'pharmaceuticals', 'industrial', 'fashion', 'other'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "shipments" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "tracking_number" VARCHAR NOT NULL,
        "shipper_id" UUID NOT NULL,
        "carrier_id" UUID,
        "origin" VARCHAR NOT NULL,
        "destination" VARCHAR NOT NULL,
        "cargo_description" TEXT NOT NULL,
        "cargo_category" "public"."cargo_category_enum",
        "weight_kg" NUMERIC(10,2) NOT NULL,
        "volume_cbm" NUMERIC(10,3),
        "price" NUMERIC(14,2) NOT NULL,
        "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
        "is_insured" BOOLEAN NOT NULL DEFAULT false,
        "on_chain_shipment_id" BIGINT,
        "insurance_premium" NUMERIC(14,2),
        "status" "public"."shipment_status_enum" NOT NULL DEFAULT 'pending',
        "notes" TEXT,
        "cancellation_fee" NUMERIC(14,2),
        "pickup_date" TIMESTAMPTZ,
        "estimated_delivery_date" TIMESTAMPTZ,
        "actual_delivery_date" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shipments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_shipments_tracking_number" UNIQUE ("tracking_number"),
        CONSTRAINT "FK_shipments_shipper" FOREIGN KEY ("shipper_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_shipments_carrier" FOREIGN KEY ("carrier_id")
          REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "shipment_status_history" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "shipment_id" UUID NOT NULL,
        "from_status" "public"."shipment_status_enum",
        "to_status" "public"."shipment_status_enum" NOT NULL,
        "changed_by_id" UUID NOT NULL,
        "reason" TEXT,
        "changed_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shipment_status_history_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_shipment_status_history_shipment" FOREIGN KEY ("shipment_id")
          REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_shipment_status_history_changed_by" FOREIGN KEY ("changed_by_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "addresses" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" UUID NOT NULL,
        "label" VARCHAR(100) NOT NULL,
        "address" TEXT NOT NULL,
        "city" VARCHAR(100) NOT NULL,
        "country" VARCHAR(100) NOT NULL,
        "is_default" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_addresses_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_addresses_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "admin_id" UUID NOT NULL,
        "action" VARCHAR(100) NOT NULL,
        "target_type" VARCHAR(100),
        "target_id" VARCHAR,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_logs_admin" FOREIGN KEY ("admin_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."bid_status_enum" AS ENUM(
        'PENDING', 'ACCEPTED', 'REJECTED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bids" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "shipment_id" UUID NOT NULL,
        "carrier_id" UUID NOT NULL,
        "proposed_price" NUMERIC(14,2) NOT NULL,
        "message" TEXT,
        "status" "public"."bid_status_enum" NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bids_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bids_shipment" FOREIGN KEY ("shipment_id")
          REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_bids_carrier" FOREIGN KEY ("carrier_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."certification_type_enum" AS ENUM(
        'Operating License', 'Insurance Certificate', 'Safety Certification', 'Hazmat Certification', 'Vehicle Registration', 'Other'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "carrier_certifications" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "carrier_id" UUID NOT NULL,
        "document_type" "public"."certification_type_enum" NOT NULL,
        "file_url" TEXT,
        "document_id" UUID,
        "is_platform_hosted" BOOLEAN NOT NULL DEFAULT false,
        "issued_by" VARCHAR NOT NULL,
        "expires_at" TIMESTAMPTZ,
        "is_verified" BOOLEAN NOT NULL DEFAULT false,
        "verification_revoked_at" TIMESTAMPTZ,
        "notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_carrier_certifications_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."document_type_enum" AS ENUM(
        'OTHER', 'OPERATING_LICENSE', 'INSURANCE_POLICY', 'SAFETY_CERTIFICATE', 'VEHICLE_REGISTRATION', 'HAZMAT_CERTIFICATE'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "shipment_id" UUID,
        "uploader_id" UUID NOT NULL,
        "document_type" "public"."document_type_enum" NOT NULL DEFAULT 'OTHER',
        "original_name" VARCHAR NOT NULL,
        "stored_name" VARCHAR NOT NULL,
        "mimetype" VARCHAR NOT NULL,
        "size_bytes" INT NOT NULL,
        "sha256_hash" VARCHAR(64) NOT NULL,
        "ipfs_cid" VARCHAR,
        "on_chain_document_id" BIGINT,
        "notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_documents_shipment" FOREIGN KEY ("shipment_id")
          REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_documents_uploader" FOREIGN KEY ("uploader_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notification_preferences" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" UUID NOT NULL,
        "shipment_accepted" BOOLEAN NOT NULL DEFAULT true,
        "shipment_in_transit" BOOLEAN NOT NULL DEFAULT true,
        "shipment_delivered" BOOLEAN NOT NULL DEFAULT true,
        "shipment_completed" BOOLEAN NOT NULL DEFAULT true,
        "shipment_cancelled" BOOLEAN NOT NULL DEFAULT true,
        "shipment_disputed" BOOLEAN NOT NULL DEFAULT true,
        "dispute_resolved" BOOLEAN NOT NULL DEFAULT true,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_preferences_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_preferences_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_notification_preferences_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "shipment_id" UUID NOT NULL,
        "reviewer_id" UUID NOT NULL,
        "reviewee_id" UUID NOT NULL,
        "rating" SMALLINT NOT NULL,
        "comment" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_reviews_shipment_reviewer" UNIQUE ("shipment_id", "reviewer_id"),
        CONSTRAINT "FK_reviews_reviewer" FOREIGN KEY ("reviewer_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_reviews_reviewee" FOREIGN KEY ("reviewee_id")
          REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "webhooks" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" UUID NOT NULL,
        "url" VARCHAR NOT NULL,
        "secret" VARCHAR NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhooks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_webhooks_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_shipments_shipper_id" ON "shipments" ("shipper_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_shipments_carrier_id" ON "shipments" ("carrier_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_bids_shipment_id" ON "bids" ("shipment_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_bids_carrier_id" ON "bids" ("carrier_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_admin_id" ON "audit_logs" ("admin_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_documents_uploader_id" ON "documents" ("uploader_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_shipment_id" ON "reviews" ("shipment_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reviews_shipment_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_uploader_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_admin_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bids_carrier_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bids_shipment_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_shipments_carrier_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_shipments_shipper_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "webhooks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "documents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "carrier_certifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bids"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "addresses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shipment_status_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shipments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."bid_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."certification_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."document_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."cargo_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."shipment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
  }
}
