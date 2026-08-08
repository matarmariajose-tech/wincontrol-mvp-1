import { MigrationInterface, QueryRunner } from 'typeorm';

const MASTER_EMAIL = 'majo@winallcontrol.com';

export class MasterRole1754650000000 implements MigrationInterface {
  name = 'MasterRole1754650000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "user" SET "roles" = ARRAY['MASTER'], "empresa_id" = NULL WHERE "email" = $1`,
      [MASTER_EMAIL],
    );

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "ck_user_master_sin_empresa"
      CHECK (
        ('MASTER' = ANY("roles") AND "empresa_id" IS NULL)
        OR ('MASTER' <> ALL("roles") AND "empresa_id" IS NOT NULL)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "ck_user_master_sin_empresa"`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "roles" = ARRAY['ADMIN'],
       "empresa_id" = (SELECT id FROM "empresas" WHERE slug = 'testa-homes')
       WHERE "email" = $1`,
      [MASTER_EMAIL],
    );
  }
}
