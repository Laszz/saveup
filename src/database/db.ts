import * as SQLite from 'expo-sqlite';
import { DEFAULT_CATEGORIES } from '@/src/constants/categories';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  try{
    db = await SQLite.openDatabaseAsync('saveup.db');
    await initDb(db);
  }catch(e){
    console.log('openDatabaseAsync failed', e);
    throw e;
  }
  return db;
}

async function initDb(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      targetAmount INTEGER NOT NULL,
      targetDate TEXT,
      createdAt TEXT NOT NULL,
      completedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      categoryId TEXT,
      goalId TEXT,
      note TEXT,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT,
      isDefault INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_txn_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_txn_goalId ON transactions(goalId);
  `);
  // seed categories if empty
  const existing = await database.getFirstAsync<{c:number}>('SELECT COUNT(*) as c FROM categories');
  if (existing && existing.c === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await database.runAsync('INSERT INTO categories (id, name, type, icon, isDefault) VALUES (?,?,?,?,?)', [cat.id, cat.name, cat.type, cat.icon||'', cat.isDefault?1:0]);
    }
  } else {
    // migrate emoji -> Paper MCI icons (ponytail: one-time)
    const maps: Record<string,string> = {'💼':'wallet','💻':'laptop','🎁':'gift','📈':'trending-up','💰':'cash','🍔':'food','🚌':'bus','🛍️':'shopping','🎬':'movie','🧾':'receipt','🏥':'medical-bag','📚':'school','🔁':'repeat','📦':'package-variant-closed'};
    for (const [emoji, mci] of Object.entries(maps)) {
      await database.runAsync('UPDATE categories SET icon=? WHERE icon=?', [mci, emoji]);
    }
    // goal emoji migration
    const goalMaps: Record<string,string> = {'💻':'laptop','✈️':'airplane','🏠':'home','🚗':'car','📱':'cellphone','🎓':'school','💍':'ring','🏖️':'beach','🎮':'controller-classic','📷':'camera','🎸':'guitar-electric','⚽':'soccer','🏦':'bank','🎯':'target'};
    for (const [emoji, mci] of Object.entries(goalMaps)) {
      await database.runAsync('UPDATE goals SET icon=? WHERE icon=?', [mci, emoji]);
    }
    // also ensure new categories exist (if user had old DB missing some)
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await database.getFirstAsync<{c:number}>('SELECT COUNT(*) as c FROM categories WHERE id=?', [cat.id]);
      if (exists && exists.c===0) await database.runAsync('INSERT INTO categories (id, name, type, icon, isDefault) VALUES (?,?,?,?,?)', [cat.id, cat.name, cat.type, cat.icon||'', 1]);
    }
  }
  // seed settings defaults
  const s = await database.getFirstAsync<{value:string}>("SELECT value FROM settings WHERE key='currency'");
  if (!s) {
    await database.runAsync("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)", ['currency','IDR']);
    await database.runAsync("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)", ['language','id']);
    await database.runAsync("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)", ['reminderEnabled','0']);
    await database.runAsync("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)", ['reminderTime','20:00']);
    await database.runAsync("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)", ['hasSeenOnboarding','0']);
    await database.runAsync("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)", ['theme','system']);
  } else {
    const t = await database.getFirstAsync<{value:string}>("SELECT value FROM settings WHERE key='theme'");
    if (!t) await database.runAsync("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)", ['theme','system']);
    const l = await database.getFirstAsync<{value:string}>("SELECT value FROM settings WHERE key='language'");
    if (!l) await database.runAsync("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)", ['language','id']);
  }
}

// Helpers
export async function getAllGoals(database: SQLite.SQLiteDatabase) {
  return database.getAllAsync<any>('SELECT * FROM goals ORDER BY createdAt DESC');
}
export async function getAllTransactions(database: SQLite.SQLiteDatabase) {
  return database.getAllAsync<any>('SELECT * FROM transactions ORDER BY date DESC, createdAt DESC');
}
export async function getAllCategories(database: SQLite.SQLiteDatabase) {
  return database.getAllAsync<any>('SELECT * FROM categories');
}
export async function getSettings(database: SQLite.SQLiteDatabase) {
  const rows = await database.getAllAsync<{key:string,value:string}>('SELECT * FROM settings');
  const map: Record<string,string> = {};
  rows.forEach(r=>map[r.key]=r.value);
  return {
    currency: map.currency || 'IDR',
    language: (map.language as any) || 'id',
    reminderEnabled: map.reminderEnabled==='1',
    reminderTime: map.reminderTime || '20:00',
    hasSeenOnboarding: map.hasSeenOnboarding==='1',
    theme: (map.theme as any) || 'system',
  };
}
export async function setSetting(database: SQLite.SQLiteDatabase, key:string, value:string){
  await database.runAsync('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)',[key,value]);
}

export function genId(): string {
  return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}
