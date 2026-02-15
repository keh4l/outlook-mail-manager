import Database, { Database as DatabaseType } from 'better-sqlite3';
import { config } from '../config';
import path from 'path';
import fs from 'fs';

const dir = path.dirname(config.dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db: DatabaseType = new Database(config.dbPath);

// 启用 WAL 模式和外键约束
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
