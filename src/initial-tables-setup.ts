import { eventsData, usersData } from "./data";

import { Client } from "pg";

export const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "Jeevan@230299",
  port: 5432,
});

export async function createUsersTable() {
  try {
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(1000) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        banner_img TEXT,
        location TEXT
      );
    `);

    console.log("Users & events table is ready!");

    for (const item of eventsData) {
      await client.query(
        `INSERT INTO events (id, date, title, description, price, banner_img, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING;`,
        [
          item.id,
          item.date,
          item.title,
          item.description,
          item.price,
          item.bannerImg,
          item.location,
        ]
      );
    }
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    // await client.end();
  }
}
