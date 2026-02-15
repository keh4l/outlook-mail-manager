import { Context, Next } from 'koa';
import crypto from 'crypto';
import { config } from '../config';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function authMiddleware(ctx: Context, next: Next) {
  if (!config.accessPassword) return next();
  if (ctx.path === '/api/auth/login' || ctx.path === '/api/auth/check') return next();
  if (!ctx.path.startsWith('/api')) return next();

  const token = ctx.get('Authorization')?.replace('Bearer ', '');
  if (!token || token !== hashPassword(config.accessPassword)) {
    ctx.status = 401;
    ctx.body = { code: 401, data: null, message: 'Unauthorized' };
    return;
  }
  return next();
}
