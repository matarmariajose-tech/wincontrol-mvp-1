import { MigrationInterface, QueryRunner } from 'typeorm';

const MASTER_EMAIL = 'admin@winallcontrol.com';
const MASTER_NAME = 'Winallcontrol';
const MASTER_HASH = '$2b$12$4.aoxkl93EqRfEMmA0/LGOyc20FVdNFrLJYGLkYRS3pAuGB3ka2iW';
const MAJO_EMAIL = 'majo@winallcontrol.com';

export class MasterWac1754660000000 implements MigrationInterface {
  name = 'MasterWac1754660000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [empresa] = await queryRunner.query(
      `SELECT id FROM "empresas" WHERE slug = 'testa-homes'`,
    );

    await queryRunner.query(
      `UPDATE "user" SET "roles" = ARRAY['ADMIN'], "empresa_id" = $1 WHERE "email" = $2`,
      [empresa.id, MAJO_EMAIL],
    );

    await queryRunner.query(
      `INSERT INTO "user" ("name", "email", "password", "roles", "empresa_id", "active")
       VALUES ($1, $2, $3, ARRAY['MASTER'], NULL, true)
       ON CONFLICT ("email") DO NOTHING`,
      [MASTER_NAME, MASTER_EMAIL, MASTER_HASH],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "user" WHERE "email" = $1`, [MASTER_EMAIL]);
    await queryRunner.query(
      `UPDATE "user" SET "roles" = ARRAY['MASTER'], "empresa_id" = NULL WHERE "email" = $1`,
      [MAJO_EMAIL],
    );
  }
}
