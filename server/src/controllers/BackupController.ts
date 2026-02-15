import { Context } from 'koa';
import fs from 'fs';
import path from 'path';
import { success, fail } from '../utils/response';

const DB_PATH = path.join(__dirname, '../../data/database.db');

export class BackupController {
  async download(ctx: Context) {
    if (!fs.existsSync(DB_PATH)) {
      return fail(ctx, 'Database file not found', 404);
    }

    const fileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
    ctx.set('Content-Type', 'application/octet-stream');
    ctx.set('Content-Disposition', `attachment; filename="${fileName}"`);
    ctx.body = fs.createReadStream(DB_PATH);
  }

  async restore(ctx: Context) {
    const body = ctx.request.body as any;

    if (!body.fileContent) {
      return fail(ctx, 'fileContent is required', 400);
    }

    try {
      // Decode base64 content
      const buffer = Buffer.from(body.fileContent, 'base64');

      // Validate it's a SQLite database (magic number check)
      const magic = buffer.toString('utf8', 0, 15);
      if (!magic.startsWith('SQLite format 3')) {
        return fail(ctx, 'Invalid SQLite database file', 400);
      }

      // Backup current database
      const backupPath = `${DB_PATH}.backup-${Date.now()}`;
      if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, backupPath);
      }

      // Write new database
      fs.writeFileSync(DB_PATH, buffer);

      success(ctx, {
        message: 'Database restored successfully',
        backup: backupPath
      });
    } catch (err: any) {
      return fail(ctx, `Restore failed: ${err.message}`, 500);
    }
  }
}
