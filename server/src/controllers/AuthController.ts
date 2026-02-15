import { Context } from 'koa';
import crypto from 'crypto';
import { config } from '../config';
import { success, fail } from '../utils/response';

export class AuthController {
  async login(ctx: Context) {
    const { password } = ctx.request.body as any;
    if (!config.accessPassword) {
      return success(ctx, { token: '', required: false });
    }
    if (password !== config.accessPassword) {
      return fail(ctx, 'Invalid password', 401);
    }
    const token = crypto.createHash('sha256').update(password).digest('hex');
    success(ctx, { token, required: true });
  }

  async check(ctx: Context) {
    success(ctx, { required: !!config.accessPassword });
  }
}
