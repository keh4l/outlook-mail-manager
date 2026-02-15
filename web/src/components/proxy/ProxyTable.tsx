import type { Proxy, ProxyTestResult } from '../../types';
import ProxyTestButton from './ProxyTestButton';

interface Props {
  proxies: Proxy[];
  loading: boolean;
  onEdit: (proxy: Proxy) => void;
  onDelete: (id: number) => void;
  onTest: (id: number) => Promise<ProxyTestResult>;
  onSetDefault: (id: number) => void;
}

function StatusDot({ status }: { status: Proxy['status'] }) {
  const colors = {
    active: 'bg-emerald-500 shadow-emerald-500/40',
    failed: 'bg-red-500 shadow-red-500/40',
    untested: 'bg-amber-400 shadow-amber-400/40',
  };
  const labels = { active: '在线', failed: '失败', untested: '未测试' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-2 h-2 rounded-full shadow-sm ${colors[status]}`} />
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{labels[status]}</span>
    </span>
  );
}

export default function ProxyTable({ proxies, loading, onEdit, onDelete, onTest, onSetDefault }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        加载中...
      </div>
    );
  }

  if (proxies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <svg className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.727-3.558" />
        </svg>
        <p className="text-sm">暂无代理，点击上方按钮添加</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left text-zinc-500 dark:text-zinc-400">
            <th className="pb-3 font-medium">名称</th>
            <th className="pb-3 font-medium">类型</th>
            <th className="pb-3 font-medium">地址</th>
            <th className="pb-3 font-medium">状态</th>
            <th className="pb-3 font-medium">上次测试 IP</th>
            <th className="pb-3 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {proxies.map(p => (
            <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="py-3 text-zinc-900 dark:text-zinc-100">
                <span className="inline-flex items-center gap-1.5">
                  {p.name}
                  {p.is_default && <span className="text-amber-500" title="默认代理">⭐</span>}
                </span>
              </td>
              <td className="py-3">
                <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase font-medium">
                  {p.type}
                </span>
              </td>
              <td className="py-3 text-zinc-600 dark:text-zinc-400 font-mono text-xs">{p.host}:{p.port}</td>
              <td className="py-3"><StatusDot status={p.status} /></td>
              <td className="py-3 text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                {p.last_test_ip || '-'}
              </td>
              <td className="py-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onEdit(p)} className="px-2.5 py-1 text-xs rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    编辑
                  </button>
                  <ProxyTestButton proxyId={p.id} onTest={onTest} />
                  {!p.is_default && (
                    <button onClick={() => onSetDefault(p.id)} className="px-2.5 py-1 text-xs rounded-md text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                      设为默认
                    </button>
                  )}
                  <button onClick={() => onDelete(p.id)} className="px-2.5 py-1 text-xs rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
