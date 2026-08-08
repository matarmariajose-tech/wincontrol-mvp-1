import 'reflect-metadata';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/data-source';
import { User } from '../users/user.entity';

const SALT_ROUNDS = 12;

const CREDENCIALES: Record<string, string> = {
  'admin@winallcontrol.com': 'Wac2026!',
  'majo@winallcontrol.com': 'Tortita.com+1',
  'simon@winallcontrol.com': 'Wac2026!',
  'toni@winallcontrol.com': 'Wac2026!',
  't.gonzalez@winallcontrol.com': 'Gonzalez1234',
};

async function main(): Promise<void> {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  const host = (process.env.DATABASE_URL ?? '').split('@')[1]?.split('/')[0] ?? 'desconocido';
  console.log(`Base destino: ${host}`);

  for (const [email, password] of Object.entries(CREDENCIALES)) {
    const user = await repo.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      console.log(`  omitido  ${email} (no existe)`);
      continue;
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    await repo.save(user);
    console.log(`  ok       ${email} [${user.roles.join(', ')}]`);
  }

  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
