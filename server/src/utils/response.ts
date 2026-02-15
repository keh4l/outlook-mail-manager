import { Context } from 'koa';

export function success<T>(ctx: Context, data: T, message?: string) {
  ctx.body = { code: 200, data, message: message || 'ok' };
}

export function fail(ctx: Context, message: string, code = 500) {
  ctx.body = { code, data: null, message };
}
