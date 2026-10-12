import { readFileSync } from 'node:fs';
import { pool } from './pool.js';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf-8');

// Пересоздать таблицы и залить товары из data/db.json
export async function seedDatabase() {
  const schema = read('./schema.sql');
  const { products } = JSON.parse(read('../data/db.json'));

  await pool.exec(schema);   // 1. создаём таблицы

  for (const p of products) { // 2. переносим товары
    await pool.query(
      `INSERT INTO products (name, category, price, unit, image)
       VALUES ($1, $2, $3, $4, $5)`,
      [p.name, p.category ?? null, Math.round(Number(p.price)),
       p.unit ?? 'кг', p.image ?? null]
    );
  }
  return products.length;
}

// При старте сервера: если таблиц ещё нет — создать и заполнить.
// Существующие данные (заявки!) не трогаем.
export async function ensureSchema() {
  const { rows } = await pool.query(
    "SELECT 1 FROM information_schema.tables WHERE table_name = 'products'"
  );
  if (rows.length === 0) {
    const n = await seedDatabase();
    console.log(`База пуста — создана схема, товаров добавлено: ${n}`);
  }
}
