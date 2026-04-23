import { AppDataSource } from '../config/data-source';
import { Property } from '../properties/property.entity';
const data = require('./properties.data.json');

async function main() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Property);

  const count = await repo.count();

  if (count > 0) {
    console.log('Ya hay propiedades, saltando seed.');
    process.exit(0);
  }

  const properties = data.map((p: any) => {
    const bedrooms = p.bedrooms
      ? Number(p.bedrooms.toString().replace(/\D/g, ''))
      : undefined;

    const sqm = p.sqm
      ? Number(p.sqm.toString().replace(/\D/g, ''))
      : undefined;

    return repo.create({
      title: p.title,
      price: p.price ? Number(p.price) : undefined,
      bedrooms,
      sqm,
      sourceUrl: p.url,
      source: 'testa-homes',
    });
  });

  await repo.save(properties);

  console.log(`${properties.length} propiedades cargadas en la DB.`);
  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});