import { MigrationInterface, QueryRunner } from 'typeorm';

const TENANT_TABLES = ['properties', 'leads', 'visits', 'comerciales'] as const;

const EMPRESA_INICIAL = {
  nombre: 'Testa Homes',
  slug: 'testa-homes',
  emailRemitente: 'visitas@winallcontrol.com',
};

export class Multitenancy1754640000000 implements MigrationInterface {
  name = 'Multitenancy1754640000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "empresas" (
        "id" serial PRIMARY KEY,
        "nombre" varchar(120) NOT NULL,
        "slug" varchar(60) NOT NULL,
        "logo_url" text,
        "email_remitente" varchar(160),
        "color_primario" varchar(9) NOT NULL DEFAULT '#2563eb',
        "activa" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_empresas_slug" UNIQUE ("slug")
      )
    `);

    const [empresa] = await queryRunner.query(
      `INSERT INTO "empresas" ("nombre", "slug", "email_remitente")
       VALUES ($1, $2, $3) RETURNING "id"`,
      [EMPRESA_INICIAL.nombre, EMPRESA_INICIAL.slug, EMPRESA_INICIAL.emailRemitente],
    );

    for (const table of TENANT_TABLES) {
      await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "empresa_id" integer`);
      await queryRunner.query(`UPDATE "${table}" SET "empresa_id" = $1`, [empresa.id]);
      await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "empresa_id" SET NOT NULL`);
      await queryRunner.query(`
        ALTER TABLE "${table}"
        ADD CONSTRAINT "fk_${table}_empresa"
        FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT
      `);
      await queryRunner.query(`CREATE INDEX "idx_${table}_empresa" ON "${table}" ("empresa_id")`);
    }

    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "empresa_id" integer`);
    await queryRunner.query(`UPDATE "user" SET "empresa_id" = $1`, [empresa.id]);
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "fk_user_empresa"
      FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`CREATE INDEX "idx_user_empresa" ON "user" ("empresa_id")`);

    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "token_hash" varchar(128) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "used_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_prt_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "fk_prt_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_prt_user" ON "password_reset_tokens" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);

    await queryRunner.query(`DROP INDEX "idx_user_empresa"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "fk_user_empresa"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "empresa_id"`);

    for (const table of [...TENANT_TABLES].reverse()) {
      await queryRunner.query(`DROP INDEX "idx_${table}_empresa"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT "fk_${table}_empresa"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "empresa_id"`);
    }

    await queryRunner.query(`DROP TABLE "empresas"`);
  }
}
