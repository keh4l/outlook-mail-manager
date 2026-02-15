import db from '../database';
import { Account, PaginatedResponse, ImportRequest, ImportResult } from '../types';
import { TagModel } from './Tag';

const tagModel = new TagModel();

export class AccountModel {
  list(page = 1, pageSize = 20, search = ''): PaginatedResponse<Account> {
    const offset = (page - 1) * pageSize;
    let where = '';
    const params: any[] = [];
    if (search) {
      where = 'WHERE email LIKE ?';
      params.push(`%${search}%`);
    }
    const total = (db.prepare(`SELECT COUNT(*) as c FROM accounts ${where}`).get(...params) as any).c;
    const list = db.prepare(`SELECT * FROM accounts ${where} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset) as Account[];
    const listWithTags = list.map(acc => ({
      ...acc,
      tags: tagModel.getTagsByAccountId(acc.id),
    }));
    return { list: listWithTags, total, page, pageSize };
  }

  getById(id: number): Account | undefined {
    const acc = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as Account | undefined;
    if (!acc) return undefined;
    return { ...acc, tags: tagModel.getTagsByAccountId(acc.id) } as any;
  }

  create(data: Partial<Account>): Account {
    const stmt = db.prepare('INSERT INTO accounts (email, password, client_id, refresh_token) VALUES (?, ?, ?, ?)');
    const result = stmt.run(data.email, data.password || '', data.client_id, data.refresh_token);
    return this.getById(result.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<Account>): Account | undefined {
    const fields: string[] = [];
    const values: any[] = [];
    for (const [key, val] of Object.entries(data)) {
      if (['email', 'password', 'client_id', 'refresh_token', 'remark', 'status', 'token_refreshed_at'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length === 0) return this.getById(id);
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  }

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
    return result.changes > 0;
  }

  batchDelete(ids: number[]): number {
    const placeholders = ids.map(() => '?').join(',');
    const result = db.prepare(`DELETE FROM accounts WHERE id IN (${placeholders})`).run(...ids);
    return result.changes;
  }

  importPreview(req: ImportRequest): { newItems: any[]; duplicates: any[]; errors: string[] } {
    const { content, separator = '----', format = ['email', 'password', 'client_id', 'refresh_token'] } = req;
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const newItems: any[] = [];
    const duplicates: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(separator);
      const record: Record<string, string> = {};
      format.forEach((field, idx) => { record[field] = (parts[idx] || '').trim(); });

      if (!record.email || !record.client_id || !record.refresh_token) {
        errors.push(`Line ${i + 1}: missing required fields`);
        continue;
      }

      const existing = db.prepare('SELECT id FROM accounts WHERE email = ?').get(record.email);
      const item = { line: i + 1, ...record };
      if (existing) duplicates.push(item);
      else newItems.push(item);
    }

    return { newItems, duplicates, errors };
  }

  importConfirm(req: ImportRequest & { mode: 'skip' | 'overwrite' }): ImportResult {
    const { content, separator = '----', format = ['email', 'password', 'client_id', 'refresh_token'], mode } = req;
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    let imported = 0, skipped = 0;
    const errors: string[] = [];

    const insertStmt = db.prepare('INSERT OR IGNORE INTO accounts (email, password, client_id, refresh_token) VALUES (?, ?, ?, ?)');
    const updateStmt = db.prepare('UPDATE accounts SET password = ?, client_id = ?, refresh_token = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?');

    const transaction = db.transaction(() => {
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(separator);
        const record: Record<string, string> = {};
        format.forEach((field, idx) => { record[field] = (parts[idx] || '').trim(); });

        if (!record.email || !record.client_id || !record.refresh_token) {
          errors.push(`Line ${i + 1}: missing required fields`);
          continue;
        }

        const existing = db.prepare('SELECT id FROM accounts WHERE email = ?').get(record.email);
        if (existing) {
          if (mode === 'overwrite') {
            updateStmt.run(record.password || '', record.client_id, record.refresh_token, record.email);
            imported++;
          } else {
            skipped++;
          }
        } else {
          insertStmt.run(record.email, record.password || '', record.client_id, record.refresh_token);
          imported++;
        }
      }
    });
    transaction();
    return { imported, skipped, errors };
  }

  import(req: ImportRequest): ImportResult {
    const { content, separator = '----', format = ['email', 'password', 'client_id', 'refresh_token'] } = req;
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    let imported = 0, skipped = 0;
    const errors: string[] = [];

    const insertStmt = db.prepare('INSERT OR IGNORE INTO accounts (email, password, client_id, refresh_token) VALUES (?, ?, ?, ?)');
    const transaction = db.transaction(() => {
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(separator);
        const record: Record<string, string> = {};
        format.forEach((field, idx) => { record[field] = (parts[idx] || '').trim(); });

        if (!record.email || !record.client_id || !record.refresh_token) {
          errors.push(`Line ${i + 1}: missing required fields`);
          continue;
        }
        const result = insertStmt.run(record.email, record.password || '', record.client_id, record.refresh_token);
        if (result.changes > 0) imported++;
        else skipped++;
      }
    });
    transaction();
    return { imported, skipped, errors };
  }

  export(ids?: number[], separator = '----', format = ['email', 'password', 'client_id', 'refresh_token']): string {
    let accounts: Account[];
    if (ids && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      accounts = db.prepare(`SELECT * FROM accounts WHERE id IN (${placeholders})`).all(...ids) as Account[];
    } else {
      accounts = db.prepare('SELECT * FROM accounts').all() as Account[];
    }
    return accounts.map(acc => format.map(f => (acc as any)[f] || '').join(separator)).join('\n');
  }

  updateSyncTime(id: number) {
    db.prepare('UPDATE accounts SET last_synced_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  }

  updateTokenRefreshTime(id: number, newRefreshToken?: string) {
    if (newRefreshToken) {
      db.prepare('UPDATE accounts SET token_refreshed_at = CURRENT_TIMESTAMP, refresh_token = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newRefreshToken, 'active', id);
    } else {
      db.prepare('UPDATE accounts SET token_refreshed_at = CURRENT_TIMESTAMP, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('active', id);
    }
  }

  markError(id: number) {
    db.prepare('UPDATE accounts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('error', id);
  }

  getAll(): Account[] {
    return db.prepare('SELECT * FROM accounts ORDER BY id DESC').all() as Account[];
  }
}
