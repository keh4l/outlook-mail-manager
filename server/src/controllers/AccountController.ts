import { Context } from 'koa';
import { AccountModel } from '../models/Account';
import { TagModel } from '../models/Tag';
import { success, fail } from '../utils/response';

const model = new AccountModel();
const tagModel = new TagModel();

export class AccountController {
  async list(ctx: Context) {
    const { page = '1', pageSize = '20', search = '' } = ctx.query as Record<string, string>;
    const data = model.list(parseInt(page), parseInt(pageSize), search);
    success(ctx, data);
  }

  async create(ctx: Context) {
    const body = ctx.request.body as any;
    if (!body.email || !body.client_id || !body.refresh_token) {
      return fail(ctx, 'Missing required fields: email, client_id, refresh_token', 400);
    }
    try {
      const account = model.create(body);
      success(ctx, account);
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) return fail(ctx, 'Email already exists', 409);
      throw err;
    }
  }

  async update(ctx: Context) {
    const id = parseInt(ctx.params.id);
    const account = model.update(id, ctx.request.body as any);
    if (!account) return fail(ctx, 'Account not found', 404);
    success(ctx, account);
  }

  async delete(ctx: Context) {
    const id = parseInt(ctx.params.id);
    const deleted = model.delete(id);
    if (!deleted) return fail(ctx, 'Account not found', 404);
    success(ctx, { deleted: true });
  }

  async batchDelete(ctx: Context) {
    const { ids } = ctx.request.body as any;
    if (!Array.isArray(ids) || ids.length === 0) return fail(ctx, 'ids must be a non-empty array', 400);
    const deleted = model.batchDelete(ids);
    success(ctx, { deleted });
  }

  async import(ctx: Context) {
    const body = ctx.request.body as any;
    if (!body.content) return fail(ctx, 'content is required', 400);
    const result = model.import(body);
    success(ctx, result);
  }

  async export(ctx: Context) {
    const body = ctx.request.body as any;
    const content = model.export(body.ids, body.separator, body.format);
    success(ctx, { content, count: content.split('\n').filter(Boolean).length });
  }

  async setTags(ctx: Context) {
    const id = parseInt(ctx.params.id);
    const { tag_ids } = ctx.request.body as any;
    if (!Array.isArray(tag_ids)) return fail(ctx, 'tag_ids must be an array', 400);
    tagModel.setAccountTags(id, tag_ids);
    success(ctx, { account_id: id, tag_ids });
  }

  async importPreview(ctx: Context) {
    const body = ctx.request.body as any;
    if (!body.content) return fail(ctx, 'content is required', 400);
    const result = model.importPreview(body);
    success(ctx, result);
  }

  async importConfirm(ctx: Context) {
    const body = ctx.request.body as any;
    if (!body.content) return fail(ctx, 'content is required', 400);
    if (!['skip', 'overwrite'].includes(body.mode)) return fail(ctx, 'mode must be skip or overwrite', 400);
    const result = model.importConfirm(body);
    success(ctx, result);
  }
}
