import { AccountModel } from '../models/Account';
import { MailCacheModel } from '../models/MailCache';
import { ProxyModel } from '../models/Proxy';
import { DashboardStats } from '../types';

const accountModel = new AccountModel();
const cacheModel = new MailCacheModel();
const proxyModel = new ProxyModel();

export class DashboardService {
  getStats(): DashboardStats {
    const accounts = accountModel.getAll();
    const proxies = proxyModel.list();
    const recentMails = cacheModel.getRecent(5);

    const accountStats = accounts.map(acc => ({
      account_id: acc.id,
      email: acc.email,
      inbox_count: cacheModel.countByAccount(acc.id, 'INBOX'),
      junk_count: cacheModel.countByAccount(acc.id, 'Junk'),
    }));

    const now = Date.now();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(a => a.status === 'active').length,
      totalInboxMails: cacheModel.countAll('INBOX'),
      totalJunkMails: cacheModel.countAll('Junk'),
      totalProxies: proxies.length,
      activeProxies: proxies.filter(p => p.status === 'active').length,
      recentMails,
      accountStats,
      expiringTokens: accounts.filter(a => {
        if (!a.token_refreshed_at) return false;
        return (now - new Date(a.token_refreshed_at).getTime()) > sixtyDaysMs;
      }).length,
      errorAccounts: accounts.filter(a => a.status === 'error').length,
      unusedAccounts: accounts.filter(a => !a.token_refreshed_at).length,
    };
  }
}
