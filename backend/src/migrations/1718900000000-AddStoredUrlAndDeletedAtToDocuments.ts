import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStoredUrlAndDeletedAtToDocuments1718900000000
  implements MigrationInterface
{
  name = 'AddStoredUrlAndDeletedAtToDocuments1718900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "documents" ADD "stored_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD "deleted_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "stored_url"`);
  }
}
