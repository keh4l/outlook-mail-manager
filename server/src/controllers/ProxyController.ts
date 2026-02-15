import { Context } from 'koa';
import { ProxyModel } from '../models/Proxy';
import { ProxyService } from '../services/ProxyService';
import { success, fail } from '../utils/response';

const model = new ProxyModel();
const proxyService = new ProxyService();

export class ProxyController {
  async list(ctx: Context) {
    success(ctx, model.list());
  }

  async create(ctx: Context) {
    const body = ctx.request.body as any;
    if (!body.type || !body.host || !body.port) return fail(ctx, 'type, host, port are required', 400);
    const proxy = model.create(body);
    success(ctx, proxy);
  }

  async update(ctx: Context) {
    const id = parseInt(ctx.params.id);
    const proxy = model.update(id, ctx.request.body as any);
    if (!proxy) return fail(ctx, 'Proxy not found', 404);
    success(ctx, proxy);
  }

  async delete(ctx: Context) {
    const id = parseInt(ctx.params.id);
    if (!model.delete(id)) return fail(ctx, 'Proxy not found', 404);
    success(ctx, { deleted: true });
  }

  async test(ctx: Context) {
    const id = parseInt(ctx.params.id);
    const proxy = model.getById(id);
    if (!proxy) return fail(ctx, 'Proxy not found', 404);
    try {
      const result = await proxyService.testProxy(proxy);
      model.updateTestResult(id, result.ip, result.status);
      success(ctx, result);
    } catch (err: any) {
      model.updateTestResult(id, '', 'failed');
      fail(ctx, `Proxy test failed: ${err.message}`);
    }
  }

  async setDefault(ctx: Context) {
    const id = parseInt(ctx.params.id);
    const proxy = model.setDefault(id);
    if (!proxy) return fail(ctx, 'Proxy not found', 404);
    success(ctx, proxy);
  }
}
