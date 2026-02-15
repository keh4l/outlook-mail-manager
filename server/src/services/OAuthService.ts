import { ProxyService } from './ProxyService';
import logger from '../utils/logger';

const proxyService = new ProxyService();

interface TokenResult {
  access_token: string;
  refresh_token?: string;  // 新增：微软返回的新 refresh_token
  has_mail_scope?: boolean;
  expires_in: number;
}

export class OAuthService {
  async refreshGraphToken(clientId: string, refreshToken: string, proxyId?: number): Promise<TokenResult> {
    const { agent, dispatcher, type } = proxyService.getAgent(proxyId);

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: 'https://graph.microsoft.com/.default offline_access',
    }).toString();

    let response: any;
    if (type === 'socks5' && agent) {
      const nodefetch = require('node-fetch');
      response = await nodefetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', {
        method: 'POST',
        agent,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
    } else {
      const { fetch: undiciFetch } = require('undici');
      const opts: any = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      };
      if (dispatcher) opts.dispatcher = dispatcher;
      response = await undiciFetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', opts);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth token refresh failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const hasMailScope = data.scope?.includes('Mail.Read') ?? false;
    const hasNewRefreshToken = !!data.refresh_token;
    const tokenChanged = data.refresh_token && data.refresh_token !== refreshToken;
    logger.info(`Graph token refreshed, has_mail_scope: ${hasMailScope}, has_new_rt: ${hasNewRefreshToken}, rt_changed: ${tokenChanged}`);

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,  // 新增
      has_mail_scope: hasMailScope,
      expires_in: data.expires_in,
    };
  }

  async refreshImapToken(clientId: string, refreshToken: string, proxyId?: number): Promise<TokenResult> {
    const { agent, dispatcher, type } = proxyService.getAgent(proxyId);

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: 'offline_access https://outlook.office.com/IMAP.AccessAsUser.All',
    }).toString();

    let response: any;
    if (type === 'socks5' && agent) {
      const nodefetch = require('node-fetch');
      response = await nodefetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', {
        method: 'POST',
        agent,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
    } else {
      const { fetch: undiciFetch } = require('undici');
      const opts: any = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      };
      if (dispatcher) opts.dispatcher = dispatcher;
      response = await undiciFetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', opts);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IMAP token refresh failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const hasNewRefreshToken = !!data.refresh_token;
    const tokenChanged = data.refresh_token && data.refresh_token !== refreshToken;
    logger.info(`IMAP token refreshed, has_new_rt: ${hasNewRefreshToken}, rt_changed: ${tokenChanged}`);

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,  // 新增
      expires_in: data.expires_in,
    };
  }
}
