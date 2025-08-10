require('dotenv').config();

const shared = {
  migrations: { directory: './migrations' },
  seeds: { directory: './seeds' },
};

module.exports = {
  development: {
    ...shared,
    client: 'sqlite3',
    connection: {
      filename: './dev-database.sqlite'
    },
    useNullAsDefault: true,
    pool: { min: 2, max: 10 }
  },
  test: {
    ...shared,
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 5432,
      database: process.env.DATABASE_NAME || 'ai_marketplace_test',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'password',
    },
  },
  production: {
    ...shared,
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 20 },
  },
};