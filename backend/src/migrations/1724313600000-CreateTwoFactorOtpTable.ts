import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTwoFactorOtpTable1724313600000
  implements MigrationInterface
{
  name = 'CreateTwoFactorOtpTable1724313600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "two_factor_otps" (
        "id"             UUID        NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"        UUID        NOT NULL,
        "enabled"        BOOLEAN     NOT NULL DEFAULT false,
        "otp_code_hash"  VARCHAR(64),
        "otp_expires_at" TIMESTAMPTZ,
        "otp_used"       BOOLEAN     NOT NULL DEFAULT false,
        "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_two_factor_otps_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_two_factor_otps_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_two_factor_otps_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "two_factor_otps"`);
  }
}
