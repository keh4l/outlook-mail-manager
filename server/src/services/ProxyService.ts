import { SocksProxyAgent } from 'socks-proxy-agent';
import { ProxyAgent } from 'undici';
import { Proxy, ProxyTestResult } from '../types';
import { ProxyModel } from '../models/Proxy';
import logger from '../utils/logger';

const proxyModel = new ProxyModel();

export class ProxyService {
  createSocksAgent(proxy: Proxy): SocksProxyAgent {
    let url = `socks5://`;
    if (proxy.username && proxy.password) {
      url += `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@`;
    }
    url += `${proxy.host}:${proxy.port}`;
    return new SocksProxyAgent(url);
  }

  createHttpDispatcher(proxy: Proxy): ProxyAgent {
    let url = `http://`;
    if (proxy.username && proxy.password) {
      url += `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@`;
    }
    url += `${proxy.host}:${proxy.port}`;
    return new ProxyAgent(url);
  }

  getAgent(proxyId?: number): { agent?: SocksProxyAgent; dispatcher?: ProxyAgent; type?: string } {
    let proxy: Proxy | undefined;
    if (proxyId) {
      proxy = proxyModel.getById(proxyId);
    } else {
      proxy = proxyModel.getDefault();
    }
    if (!proxy) return {};

    if (proxy.type === 'socks5') {
      return { agent: this.createSocksAgent(proxy), type: 'socks5' };
    } else {
      return { dispatcher: this.createHttpDispatcher(proxy), type: 'http' };
    }
  }

  async testProxy(proxy: Proxy): Promise<ProxyTestResult> {
    const start = Date.now();
    try {
      let response: Response;
      if (proxy.type === 'socks5') {
        const agent = this.createSocksAgent(proxy);
        const nodefetch = require('node-fetch');
        response = await nodefetch('https://httpbin.org/ip', { agent, timeout: 15000 });
      } else {
        const dispatcher = this.createHttpDispatcher(proxy);
        const { fetch: undiciFetch } = require('undici');
        response = await undiciFetch('https://httpbin.org/ip', { dispatcher });
      }
      const data = await (response as any).json();
      const latency = Date.now() - start;
      logger.info(`Proxy test success: ${proxy.host}:${proxy.port} -> ${data.origin} (${latency}ms)`);
      return { ip: data.origin, latency, status: 'active' };
    } catch (err: any) {
      logger.error(`Proxy test failed: ${proxy.host}:${proxy.port} - ${err.message}`);
      return { ip: '', latency: Date.now() - start, status: 'failed' };
    }
  }
}
