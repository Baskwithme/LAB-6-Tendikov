import 'dotenv/config';
import { pool } from './pool.js';
import { seedDatabase } from './init.js';

const n = await seedDatabase();
console.log(`Готово: таблицы созданы, товаров добавлено — ${n}`);
await pool.end();   // закрываем соединения, иначе скрипт не завершится
