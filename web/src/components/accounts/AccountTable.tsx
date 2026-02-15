import { useState, useMemo } from 'react';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { Account, Tag } from '../../types';
import { maskText } from '../../lib/utils';
import ContextMenu from './ContextMenu';

type SortKey = 'email' | 'password' | 'client_id' | 'status' | 'token_refreshed_at';
type SortDir = 'asc' | 'desc' | null;

export const ALL_COLUMNS = [
  { key: 'index', label: '#', defaultVisible: true },
  { key: 'email', label: '邮箱地址', defaultVisible: true },
  { key: 'password', label: '密码', defaultVisible: true },
  { key: 'tags', label: '标签', defaultVisible: true },
  { key: 'client_id', label: '客户端 ID', defaultVisible: false },
  { key: 'refresh_token', label: '令牌', defaultVisible: false },
  { key: 'status', label: '状态', defaultVisible: true },
  { key: 'token_status', label: 'Token', defaultVisible: true },
  { key: 'actions', label: '操作', defaultVisible: true },
] as const;

export type ColumnKey = (typeof ALL_COLUMNS)[number]['key'];

export const COLUMN_STORAGE_KEY = 'account-visible-columns';

export function getDefaultVisibleColumns(): string[] {
  const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  return ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.key);
}

interface Props {
  accounts: Account[];
  selectedIds: number[];
  onSelectIds: (ids: number[]) => void;
  onEdit: (account: Account) => void;
  onDelete: (id: number) => void;
  onViewMail: (account: Account, mailbox: 'INBOX' | 'Junk') => void;
  loading: boolean;
  visibleColumns: string[];
  tags: Tag[];
  onToggleTag: (accountId: number, tagId: number) => void;
}


function SortHeader({ label, sortKey: key, currentKey, currentDir, onSort, className = '' }: {
  label: string; sortKey: SortKey; currentKey: SortKey | null; currentDir: SortDir; onSort: (k: SortKey) => void; className?: string;
}) {
  return (
    <th
      className={`text-left py-3 px-3 font-medium text-zinc-500 dark:text-zinc-400 cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors ${className}`}
      onClick={() => onSort(key)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {currentKey === key ? (
          <span className="text-xs">{currentDir === 'asc' ? '↑' : '↓'}</span>
        ) : (
          <span className="text-xs text-zinc-300 dark:text-zinc-600">↕</span>
        )}
      </span>
    </th>
  );
}

function CopyCell({ text, children, className = '' }: { text: string; children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleClick = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <td className={`py-3 px-3 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${className}`} onClick={handleClick} title="点击复制">
      {copied ? <span className="text-green-600 dark:text-green-400 text-xs">已复制 ✓</span> : children}
    </td>
  );
}

export default function AccountTable({ accounts, selectedIds, onSelectIds, onEdit, onDelete, onViewMail, loading, visibleColumns, tags, onToggleTag }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; account: Account } | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
  };

  const sortedAccounts = useMemo(() => {
    if (!sortKey || !sortDir) return accounts;
    return [...accounts].sort((a, b) => {
      const va = (a as any)[sortKey] ?? '';
      const vb = (b as any)[sortKey] ?? '';
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [accounts, sortKey, sortDir]);

  const isVisible = (key: string) => visibleColumns.includes(key);

  const allSelected = accounts.length > 0 && selectedIds.length === accounts.length;

  const toggleAll = () => {
    onSelectIds(allSelected ? [] : accounts.map(a => a.id));
  };

  const toggleOne = (id: number) => {
    onSelectIds(
      selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]
    );
  };

  const statusBadge = (status: Account['status']) => {
    const map = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const label = { active: '正常', inactive: '未激活', error: '异常' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
        {label[status]}
      </span>
    );
  };

  const tokenStatusBadge = (account: Account) => {
    if (account.status === 'error') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          异常
        </span>
      );
    }
    if (!account.token_refreshed_at) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
          未使用
        </span>
      );
    }
    const days = Math.floor((Date.now() - new Date(account.token_refreshed_at).getTime()) / (1000 * 60 * 60 * 24));
    if (days > 80) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" title={`${days} 天未刷新`}>
          高风险
        </span>
      );
    }
    if (days > 60) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" title={`${days} 天未刷新`}>
          即将过期
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" title={`${days} 天前刷新`}>
        正常
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        加载中...
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        <p className="text-sm">暂无邮箱账户</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="w-10 py-3 px-3">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500" />
            </th>
            {isVisible('index') && (
              <th className="w-12 text-center py-3 px-3 font-medium text-zinc-500 dark:text-zinc-400">#</th>
            )}
            {isVisible('email') && (
              <SortHeader label="邮箱地址" sortKey="email" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
            )}
            {isVisible('password') && (
              <SortHeader label="密码" sortKey="password" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="min-w-[100px]" />
            )}
            {isVisible('tags') && (
              <th className="min-w-[120px] text-left py-3 px-3 font-medium text-zinc-500 dark:text-zinc-400">标签</th>
            )}
            {isVisible('client_id') && (
              <SortHeader label="客户端 ID" sortKey="client_id" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="min-w-[160px]" />
            )}
            {isVisible('refresh_token') && (
              <th className="min-w-[160px] text-left py-3 px-3 font-medium text-zinc-500 dark:text-zinc-400">令牌</th>
            )}
            {isVisible('status') && (
              <SortHeader label="状态" sortKey="status" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="min-w-[70px]" />
            )}
            {isVisible('token_status') && (
              <SortHeader label="Token" sortKey="token_refreshed_at" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="min-w-[80px]" />
            )}
            {isVisible('actions') && (
              <th className="min-w-[100px] text-right py-3 px-3 font-medium text-zinc-500 dark:text-zinc-400">操作</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedAccounts.map((account, index) => (
            <tr
              key={account.id}
              className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              onContextMenu={e => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, account });
              }}
            >
              <td className="py-3 px-3">
                <input type="checkbox" checked={selectedIds.includes(account.id)} onChange={() => toggleOne(account.id)} className="rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500" />
              </td>
              {isVisible('index') && (
                <td className="py-3 px-3 text-center text-zinc-400 text-xs">{index + 1}</td>
              )}
              {isVisible('email') && (
                <CopyCell text={account.email}>
                  <div>
                    <span className="text-zinc-900 dark:text-zinc-100 font-medium">{account.email}</span>
                    {account.remark && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate max-w-[200px]">{account.remark}</p>
                    )}
                  </div>
                </CopyCell>
              )}
              {isVisible('password') && (
                <CopyCell text={account.password} className="text-xs font-mono">
                  {account.password ? (
                    <span className="group/pwd relative cursor-default">
                      <span className="text-zinc-600 dark:text-zinc-400 group-hover/pwd:opacity-0 absolute">
                        {maskText(account.password, 3)}
                      </span>
                      <span className="text-zinc-900 dark:text-zinc-100 opacity-0 group-hover/pwd:opacity-100 select-all">
                        {account.password}
                      </span>
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </CopyCell>
              )}
              {isVisible('tags') && (
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {(account.tags || []).map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          color: tag.color,
                          borderColor: tag.color,
                          backgroundColor: tag.color + '18'
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {(!account.tags || account.tags.length === 0) && (
                      <span className="text-zinc-400 text-xs">—</span>
                    )}
                  </div>
                </td>
              )}
              {isVisible('client_id') && (
                <CopyCell text={account.client_id} className="font-mono text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400 truncate block max-w-[240px]">{account.client_id}</span>
                </CopyCell>
              )}
              {isVisible('refresh_token') && (
                <CopyCell text={account.refresh_token} className="font-mono text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400 truncate block max-w-[240px]">{account.refresh_token}</span>
                </CopyCell>
              )}
              {isVisible('status') && (
                <td className="py-3 px-3 text-center">{statusBadge(account.status)}</td>
              )}
              {isVisible('token_status') && (
                <td className="py-3 px-3 text-center">{tokenStatusBadge(account)}</td>
              )}
              {isVisible('actions') && (
                <td className="py-3 px-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(account)} title="编辑" className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => onViewMail(account, 'INBOX')} title="查看邮件" className="p-1.5 rounded-lg text-zinc-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(account.id)} title="删除" className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          account={contextMenu.account}
          tags={tags}
          onClose={() => setContextMenu(null)}
          onCopyEmail={() => { navigator.clipboard.writeText(contextMenu.account.email); toast.success('邮箱已复制'); }}
          onCopyPassword={() => { navigator.clipboard.writeText(contextMenu.account.password); toast.success('密码已复制'); }}
          onCopyToken={() => { navigator.clipboard.writeText(contextMenu.account.refresh_token); toast.success('Token 已复制'); }}
          onEdit={() => onEdit(contextMenu.account)}
          onToggleTag={(tagId) => onToggleTag(contextMenu.account.id, tagId)}
          onViewMail={(mailbox) => onViewMail(contextMenu.account, mailbox)}
          onDelete={() => onDelete(contextMenu.account.id)}
        />
      )}
    </div>
  );
}
