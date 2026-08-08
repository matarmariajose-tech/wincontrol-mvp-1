import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConsolidateUsers1754630000000 implements MigrationInterface {
  name = 'ConsolidateUsers1754630000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "roles" text[]`);

    await queryRunner.query(`UPDATE "user" SET "email" = lower(trim("email"))`);

    await queryRunner.query(`
      WITH canonical AS (
        SELECT min(id) AS keep_id, "email"
        FROM "user"
        GROUP BY "email"
      ),
      merged AS (
        SELECT c.keep_id, array_agg(DISTINCT upper(u."role")) AS roles
        FROM "user" u
        JOIN canonical c ON u."email" = c."email"
        GROUP BY c.keep_id
      )
      UPDATE "user" u
      SET "roles" = m.roles
      FROM merged m
      WHERE u.id = m.keep_id
    `);

    await queryRunner.query(`
      DELETE FROM "user"
      WHERE id NOT IN (SELECT min(id) FROM "user" GROUP BY "email")
    `);

    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roles" SET NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "user" ADD CONSTRAINT "uq_user_email" UNIQUE ("email")
    `);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "role" varchar(40)`);
    await queryRunner.query(`UPDATE "user" SET "role" = lower("roles"[1])`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "uq_user_email"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "roles"`);
  }
}
