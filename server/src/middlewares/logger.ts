import { Context, Next } from 'koa';
import logger from '../utils/logger';

export async function loggerMiddleware(ctx: Context, next: Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.method} ${ctx.url} ${ctx.status} - ${ms}ms`);
}
