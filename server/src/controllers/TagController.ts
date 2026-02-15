import { Context } from 'koa';
import { TagModel } from '../models/Tag';
import { success, fail } from '../utils/response';

const model = new TagModel();

export class TagController {
  async list(ctx: Context) {
    success(ctx, model.list());
  }

  async create(ctx: Context) {
    const { name, color } = ctx.request.body as any;
    if (!name) return fail(ctx, 'name is required', 400);
    try {
      const tag = model.create(name, color);
      success(ctx, tag);
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) return fail(ctx, 'Tag already exists', 409);
      throw err;
    }
  }

  async update(ctx: Context) {
    const id = parseInt(ctx.params.id);
    const tag = model.update(id, ctx.request.body as any);
    if (!tag) return fail(ctx, 'Tag not found', 404);
    success(ctx, tag);
  }

  async delete(ctx: Context) {
    const id = parseInt(ctx.params.id);
    if (!model.delete(id)) return fail(ctx, 'Tag not found', 404);
    success(ctx, { deleted: true });
  }
}
