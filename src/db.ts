import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "train.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  migrate(_db);
  return _db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_date TEXT NOT NULL,
      source_message_id TEXT NOT NULL UNIQUE,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL REFERENCES workouts(id),
      exercise_name TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER,
      weight_value REAL,
      weight_unit TEXT NOT NULL,
      weight_kg REAL,
      duration_seconds INTEGER,
      rpe REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sets_exercise_name ON sets(exercise_name);
    CREATE INDEX IF NOT EXISTS idx_workouts_session_date ON workouts(session_date);
  `);
}

export type JsonEnvelope<T> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): JsonEnvelope<T> {
  return { ok: true, data };
}

export function err(message: string): JsonEnvelope<never> {
  return { ok: false, error: message };
}
