// File: backend/config/env/production/database.ts

// --- FINAL FIX: Use the correct import syntax for this library ---
import { parse } from 'pg-connection-string';

export default ({ env }) => {
  const config = parse(env('DATABASE_URL'));
  return {
    connection: {
      client: 'postgres',
      connection: {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: {
          rejectUnauthorized: false,
        },
      },
      debug: false,
    },
  };
};
