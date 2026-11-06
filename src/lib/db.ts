import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'crm.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER,
      channel TEXT NOT NULL DEFAULT 'Unknown',
      received_at TEXT,
      original_message TEXT NOT NULL,
      language TEXT DEFAULT 'English',
      interest TEXT DEFAULT 'General',
      category TEXT DEFAULT 'Sales',
      priority TEXT DEFAULT 'Normal',
      status TEXT DEFAULT 'New',
      ai_summary TEXT,
      ai_classification_reason TEXT,
      ai_recommended_actions TEXT,
      ai_confidence REAL DEFAULT 0,
      human_corrected_interest TEXT,
      human_corrected_category TEXT,
      assigned_to TEXT,
      follow_up_date TEXT,
      last_follow_up TEXT,
      is_spam INTEGER DEFAULT 0,
      is_duplicate INTEGER DEFAULT 0,
      duplicate_of INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (contact_id) REFERENCES contacts(id),
      FOREIGN KEY (duplicate_of) REFERENCES enquiries(id)
    );

    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enquiry_id INTEGER NOT NULL,
      reply_text TEXT NOT NULL,
      language TEXT DEFAULT 'English',
      tone TEXT DEFAULT 'friendly',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (enquiry_id) REFERENCES enquiries(id)
    );

    CREATE TABLE IF NOT EXISTS ai_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enquiry_id INTEGER NOT NULL,
      field_name TEXT NOT NULL,
      ai_value TEXT,
      corrected_value TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (enquiry_id) REFERENCES enquiries(id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enquiry_id INTEGER,
      contact_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
    CREATE INDEX IF NOT EXISTS idx_enquiries_contact ON enquiries(contact_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
    CREATE INDEX IF NOT EXISTS idx_enquiries_category ON enquiries(category);
  `);
}
