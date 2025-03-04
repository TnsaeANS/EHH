// src/db/index.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
const { Pool } = pg;

// Create a new Pool instance with the database URL
const pool = new Pool({
  connectionString: process.env.DB_URL,
});

// Initialize Drizzle with the Pool instance
const db = drizzle(pool);

export { db };