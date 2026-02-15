import { Context } from 'koa';
import { MailService } from '../services/MailService';
import { MailCacheModel } from '../models/MailCache';
import { success, fail } from '../utils/response';

const mailService = new MailService();
const cacheModel = new MailCacheModel();

export class MailController {
  async fetch(ctx: Context) {
    const { account_id, mailbox = 'INBOX', proxy_id } = ctx.request.body as any;
    if (!account_id) return fail(ctx, 'account_id is required', 400);
    try {
      const result = await mailService.fetchMails(account_id, mailbox, proxy_id);
      success(ctx, result);
    } catch (err: any) {
      fail(ctx, `Failed to fetch mails: ${err.message}`);
    }
  }

  async fetchNew(ctx: Context) {
    const { account_id, mailbox = 'INBOX', proxy_id } = ctx.request.body as any;
    if (!account_id) return fail(ctx, 'account_id is required', 400);
    try {
      const result = await mailService.fetchMails(account_id, mailbox, proxy_id, 1);
      success(ctx, result.mails[0] || null);
    } catch (err: any) {
      fail(ctx, `Failed to fetch new mail: ${err.message}`);
    }
  }

  async clear(ctx: Context) {
    const { account_id, mailbox = 'INBOX', proxy_id } = ctx.request.body as any;
    if (!account_id) return fail(ctx, 'account_id is required', 400);
    try {
      await mailService.clearMailbox(account_id, mailbox, proxy_id);
      cacheModel.clearByAccount(account_id, mailbox);
      success(ctx, { message: '邮件正在清空中...' });
    } catch (err: any) {
      fail(ctx, `Failed to clear mailbox: ${err.message}`);
    }
  }

  async cached(ctx: Context) {
    const { account_id, mailbox = 'INBOX', page = '1', pageSize = '50' } = ctx.query as Record<string, string>;
    if (!account_id) return fail(ctx, 'account_id is required', 400);
    const data = cacheModel.getByAccount(parseInt(account_id), mailbox, parseInt(page), parseInt(pageSize));
    success(ctx, data);
  }
}
