import Database from "bun:sqlite";

export interface ApiKeyEntityProps {
  id: number;
  key: string;
  ttl: number;
  createdAt: Date;
}

export const initializeDatabase = () => {
  const db = new Database(':memory:'); 

  db.run(`CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT,
    ttl INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  return db;
}