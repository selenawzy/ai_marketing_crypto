const knex = require('knex');

const dbConfig = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 5432,
      database: process.env.DATABASE_NAME || 'ai_marketplace',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'password',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: '../migrations'
    },
    seeds: {
      directory: '../seeds'
    }
  },
  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 5432,
      database: process.env.DATABASE_NAME || 'ai_marketplace_test',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'password',
    },
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      directory: '../migrations'
    },
    seeds: {
      directory: '../seeds'
    }
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 20
    },
    migrations: {
      directory: '../migrations'
    },
    seeds: {
      directory: '../seeds'
    }
  }
};

const environment = process.env.NODE_ENV || 'development';
const config = dbConfig[environment];

const db = knex(config);

const connectDB = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('Database connection successful');
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

module.exports = {
  db,
  connectDB,
  config
}; 