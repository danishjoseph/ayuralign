import { DataSource } from 'typeorm';

export async function createTestDb(name: string) {
  const ds = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: 'root',
    database: 'template1',
  });
  await ds.initialize();
  await ds.query(`CREATE DATABASE "${name}"`);
  await ds.destroy();
}

export async function dropTestDb(name: string) {
  const ds = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: 'root',
    database: 'template1',
  });
  await ds.initialize();
  await ds.query(`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${name}' AND pid <> pg_backend_pid()
  `);
  await ds.query(`DROP DATABASE IF EXISTS "${name}"`);
  await ds.destroy();
}
