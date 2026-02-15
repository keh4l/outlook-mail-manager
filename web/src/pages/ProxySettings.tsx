import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useProxyStore } from '../stores/proxy';
import type { Proxy } from '../types';
import ProxyTable from '../components/proxy/ProxyTable';
import ProxyForm from '../components/proxy/ProxyForm';

export default function ProxySettings() {
  const { proxies, loading, fetchProxies, createProxy, updateProxy, deleteProxy, testProxy, setDefault } = useProxyStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Proxy | null>(null);

  useEffect(() => {
    fetchProxies().catch(() => toast.error('加载代理列表失败'));
  }, [fetchProxies]);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (proxy: Proxy) => {
    setEditing(proxy);
    setFormOpen(true);
  };

  const handleSave = async (data: Partial<Proxy>) => {
    try {
      if (editing) {
        await updateProxy(editing.id, data);
        toast.success('代理已更新');
      } else {
        await createProxy(data);
        toast.success('代理已添加');
      }
    } catch (e: any) {
      toast.error(e.message || '操作失败');
      throw e;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该代理吗？')) return;
    try {
      await deleteProxy(id);
      toast.success('代理已删除');
    } catch (e: any) {
      toast.error(e.message || '删除失败');
    }
  };

  const handleTest = async (id: number) => {
    const result = await testProxy(id);
    if (result.status === 'active') {
      toast.success(`测试成功 · IP: ${result.ip} · 延迟: ${result.latency}ms`);
    } else {
      toast.error('代理连接失败');
    }
    return result;
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefault(id);
      toast.success('已设为默认代理');
    } catch (e: any) {
      toast.error(e.message || '设置失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">代理设置</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">管理 SOCKS5 / HTTP 代理，用于邮件收发</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          添加代理
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <ProxyTable
          proxies={proxies}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTest={handleTest}
          onSetDefault={handleSetDefault}
        />
      </div>

      <ProxyForm
        open={formOpen}
        proxy={editing}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
