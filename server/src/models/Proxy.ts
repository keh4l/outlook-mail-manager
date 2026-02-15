import db from '../database';
import { Proxy } from '../types';

export class ProxyModel {
  list(): Proxy[] {
    return db.prepare('SELECT * FROM proxies ORDER BY id DESC').all() as Proxy[];
  }

  getById(id: number): Proxy | undefined {
    return db.prepare('SELECT * FROM proxies WHERE id = ?').get(id) as Proxy | undefined;
  }

  getDefault(): Proxy | undefined {
    return db.prepare('SELECT * FROM proxies WHERE is_default = 1 LIMIT 1').get() as Proxy | undefined;
  }

  create(data: Partial<Proxy>): Proxy {
    const stmt = db.prepare('INSERT INTO proxies (name, type, host, port, username, password, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(data.name || '', data.type, data.host, data.port, data.username || '', data.password || '', data.is_default ? 1 : 0);
    return this.getById(result.lastInsertRowid as number)!;
  }

  update(id: number, data: Partial<Proxy>): Proxy | undefined {
    const fields: string[] = [];
    const values: any[] = [];
    for (const [key, val] of Object.entries(data)) {
      if (['name', 'type', 'host', 'port', 'username', 'password', 'is_default'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(key === 'is_default' ? (val ? 1 : 0) : val);
      }
    }
    if (fields.length === 0) return this.getById(id);
    values.push(id);
    db.prepare(`UPDATE proxies SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  }

  delete(id: number): boolean {
    return db.prepare('DELETE FROM proxies WHERE id = ?').run(id).changes > 0;
  }

  setDefault(id: number): Proxy | undefined {
    db.prepare('UPDATE proxies SET is_default = 0').run();
    db.prepare('UPDATE proxies SET is_default = 1 WHERE id = ?').run(id);
    return this.getById(id);
  }

  updateTestResult(id: number, ip: string, status: 'active' | 'failed') {
    db.prepare('UPDATE proxies SET last_tested_at = CURRENT_TIMESTAMP, last_test_ip = ?, status = ? WHERE id = ?').run(ip, status, id);
  }
}
