import { open } from "sqlite";
import sqlite3 from "sqlite3";

let db: any = null;

async function openDb() {
  if (!db) {
    try {
      db = await open({
        filename: "./blog.sqlite",
        driver: sqlite3.Database,
      });

      await db.exec(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          content TEXT NOT NULL,
          content_preview TEXT,
          is_draft BOOLEAN,
          author TEXT NOT NULL,
          category TEXT,
          meta_title TEXT,
          meta_description TEXT,
          label TEXT,
          author_bio TEXT,
          reading_time INTEGER,
          featured_image_url TEXT,
          status TEXT,
          images TEXT,
          created_at TEXT,
          updated_at TEXT
        )
      `);
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  }
  return db;
}

export async function query(sql: string, params: any[] = []) {
  try {
    const db = await openDb();
    return await db.all(sql, params);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export async function run(sql: string, params: any[] = []) {
  try {
    const db = await openDb();
    return await db.run(sql, params);
  } catch (error) {
    console.error("Database run error:", error);
    throw error;
  }
}

export default { query, run };
