import * as fs from 'fs';
import { parse } from 'node-html-parser';

const BASE_URL = 'https://www.idealista.com';
const PRO_URL = '/pro/testa-homes/';

const DATA_PATH = './src/seeds/properties.data.json';
const PROGRESS_PATH = './src/seeds/scrape-progress.json';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9',
};

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function loadExistingData(): any[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function loadProgress(): number {
  try {
    const raw = fs.readFileSync(PROGRESS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.lastPage || 1;
  } catch {
    return 1;
  }
}

function saveProgress(page: number) {
  fs.writeFileSync(
    PROGRESS_PATH,
    JSON.stringify({ lastPage: page }, null, 2)
  );
}

function saveData(data: any[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function scrapeListings() {
  let allProperties = loadExistingData();
  let page = loadProgress();

  console.log(`Arrancando desde página ${page}`);
  console.log(`Ya hay ${allProperties.length} propiedades guardadas`);

  // para evitar duplicados por URL
  const existingUrls = new Set(allProperties.map((p) => p.url));

  while (true) {
    try {
      console.log(`Scraping página ${page}...`);

      const html = await fetchPage(`${BASE_URL}${PRO_URL}?page=${page}`);
      const root = parse(html);

      const items = root.querySelectorAll('.item-info-container');
      console.log(`Items encontrados: ${items.length}`);

      if (items.length === 0) {
        console.log('No hay más resultados.');
        break;
      }

      let nuevos = 0;

      for (const item of items) {
        const linkEl = item.querySelector('.item-link');
        const priceEl = item.querySelector('.item-price');
        const titleEl = item.querySelector('.item-link');
        const details = item.querySelectorAll('.item-detail');

        const href = linkEl?.getAttribute('href');

        const url = href ? BASE_URL + href : null;

        if (!url || existingUrls.has(url)) continue;

        const priceText = priceEl?.text.trim() ?? '';
        const price = Number(priceText.replace(/[^\d]/g, ''));

        allProperties.push({
          title: titleEl?.text.trim() ?? null,
          price: price || null,
          url,
          bedrooms: details[1]?.text.trim() ?? null,
          sqm: details[2]?.text.trim() ?? null,
          floor: details[3]?.text.trim() ?? null,
        });

        existingUrls.add(url);
        nuevos++;
      }

      console.log(`Nuevos agregados: ${nuevos}`);

      // guardar progreso y data en cada página (clave)
      saveProgress(page);
      saveData(allProperties);

      // delay anti-bloqueo
      await new Promise((r) =>
        setTimeout(r, 2500 + Math.random() * 2500)
      );

      page++;
    } catch (err: any) {
      console.log('⛔ Corte por bloqueo o error:', err.message);
      console.log('Guardando progreso y saliendo...');
      saveProgress(page);
      saveData(allProperties);
      break;
    }
  }

  console.log(`✅ Total propiedades: ${allProperties.length}`);
}

scrapeListings().catch(console.error);