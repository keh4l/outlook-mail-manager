import { ProxyService } from './ProxyService';
import { MailMessage } from '../types';
import logger from '../utils/logger';

const proxyService = new ProxyService();

export class GraphApiService {
  async fetchMails(accessToken: string, mailbox: string, top = 50, proxyId?: number): Promise<Partial<MailMessage>[]> {
    const folder = mailbox === 'Junk' ? 'junkemail' : 'inbox';
    const { agent, dispatcher, type } = proxyService.getAgent(proxyId);

    const url = `https://graph.microsoft.com/v1.0/me/mailFolders/${folder}/messages?$top=${top}`;
    let response: any;

    if (type === 'socks5' && agent) {
      const nodefetch = require('node-fetch');
      response = await nodefetch(url, {
        agent,
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
    } else {
      const { fetch: undiciFetch } = require('undici');
      const opts: any = {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      };
      if (dispatcher) opts.dispatcher = dispatcher;
      response = await undiciFetch(url, opts);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Graph API fetch failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const emails = (data.value || []).map((item: any) => ({
      mail_id: item.id,
      sender: item.from?.emailAddress?.address || '',
      sender_name: item.from?.emailAddress?.name || '',
      subject: item.subject || '',
      text_content: item.bodyPreview || '',
      html_content: item.body?.content || '',
      mail_date: item.createdDateTime || '',
    }));

    logger.info(`Graph API fetched ${emails.length} mails from ${folder}`);
    return emails;
  }

  async deleteMail(accessToken: string, mailId: string, proxyId?: number): Promise<void> {
    const { agent, dispatcher, type } = proxyService.getAgent(proxyId);
    const url = `https://graph.microsoft.com/v1.0/me/messages/${mailId}`;

    if (type === 'socks5' && agent) {
      const nodefetch = require('node-fetch');
      await nodefetch(url, { method: 'DELETE', agent, headers: { Authorization: `Bearer ${accessToken}` } });
    } else {
      const { fetch: undiciFetch } = require('undici');
      const opts: any = { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } };
      if (dispatcher) opts.dispatcher = dispatcher;
      await undiciFetch(url, opts);
    }
  }

  async deleteAllMails(accessToken: string, mailbox: string, proxyId?: number): Promise<void> {
    const mails = await this.fetchMails(accessToken, mailbox, 10000, proxyId);
    const batchSize = 10;
    for (let i = 0; i < mails.length; i += batchSize) {
      const batch = mails.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(m => this.deleteMail(accessToken, m.mail_id!, proxyId)));
    }
    logger.info(`Deleted ${mails.length} mails from ${mailbox}`);
  }
}
