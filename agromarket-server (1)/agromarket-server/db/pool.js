import pg from 'pg';

// Тип DATE (код 1082) отдаём строкой 'YYYY-MM-DD'.
// Иначе pg превратит дату в объект Date, и из-за часового пояса она «уедет» на день.
pg.types.setTypeParser(1082, (value) => value);

// Два режима, интерфейс одинаковый: pool.query(sql, params) → { rows, rowCount }
//  1) задан DATABASE_URL  → обычный сервер PostgreSQL через пакет pg (как в методичке)
//  2) DATABASE_URL нет    → встроенный PostgreSQL (PGlite), данные в папке ./pgdata.
//     Ничего устанавливать не нужно, SQL тот же самый.
async function createPool() {
  if (process.env.DATABASE_URL) {
    const p = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    return {
      kind: 'postgres',
      query: (sql, params) => p.query(sql, params),
      exec: (sql) => p.query(sql),
      end: () => p.end(),
    };
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite(process.env.PGLITE_DIR || './pgdata', {
    parsers: { 1082: (value) => value },   // DATE → строка, как выше
  });
  await db.waitReady;

  return {
    kind: 'pglite',
    async query(sql, params = []) {
      const r = await db.query(sql, params);
      return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
    },
    async exec(sql) {
      await db.exec(sql);   // несколько команд сразу (schema.sql)
    },
    end: () => db.close(),
  };
}

export const pool = await createPool();
