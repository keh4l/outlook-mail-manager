import db from '../database';
import { MailMessage } from '../types';

export class MailCacheModel {
  getByAccount(accountId: number, mailbox: string, page = 1, pageSize = 50) {
    const offset = (page - 1) * pageSize;
    const total = (db.prepare('SELECT COUNT(*) as c FROM mail_cache WHERE account_id = ? AND mailbox = ?').get(accountId, mailbox) as any).c;
    const list = db.prepare('SELECT * FROM mail_cache WHERE account_id = ? AND mailbox = ? ORDER BY mail_date DESC LIMIT ? OFFSET ?')
      .all(accountId, mailbox, pageSize, offset) as MailMessage[];
    return { list, total, page, pageSize };
  }

  upsert(accountId: number, mailbox: string, mails: Partial<MailMessage>[]) {
    const stmt = db.prepare(`
      INSERT INTO mail_cache (account_id, mailbox, mail_id, sender, sender_name, subject, text_content, html_content, mail_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        sender = excluded.sender,
        sender_name = excluded.sender_name,
        subject = excluded.subject,
        text_content = excluded.text_content,
        html_content = excluded.html_content,
        mail_date = excluded.mail_date,
        cached_at = CURRENT_TIMESTAMP
    `);
    const transaction = db.transaction(() => {
      for (const mail of mails) {
        stmt.run(accountId, mailbox, mail.mail_id || '', mail.sender || '', mail.sender_name || '',
          mail.subject || '', mail.text_content || '', mail.html_content || '', mail.mail_date || null);
      }
    });
    transaction();
  }

  clearByAccount(accountId: number, mailbox: string) {
    db.prepare('DELETE FROM mail_cache WHERE account_id = ? AND mailbox = ?').run(accountId, mailbox);
  }

  getRecent(limit = 5): MailMessage[] {
    return db.prepare('SELECT mc.*, a.email as account_email FROM mail_cache mc JOIN accounts a ON mc.account_id = a.id ORDER BY mc.mail_date DESC LIMIT ?')
      .all(limit) as MailMessage[];
  }

  countByAccount(accountId: number, mailbox: string): number {
    return (db.prepare('SELECT COUNT(*) as c FROM mail_cache WHERE account_id = ? AND mailbox = ?').get(accountId, mailbox) as any).c;
  }

  countAll(mailbox: string): number {
    return (db.prepare('SELECT COUNT(*) as c FROM mail_cache WHERE mailbox = ?').get(mailbox) as any).c;
  }
}
