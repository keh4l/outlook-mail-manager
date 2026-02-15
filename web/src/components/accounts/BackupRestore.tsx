import { useState } from 'react';

export default function BackupRestore() {
  const [restoring, setRestoring] = useState(false);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/backup/download', { headers });
      if (!res.ok) throw new Error('下载失败');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('备份下载失败: ' + err.message);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('⚠️ 恢复数据库将覆盖当前所有数据，是否继续？')) {
      e.target.value = '';
      return;
    }

    setRestoring(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const arrayBuffer = ev.target?.result as ArrayBuffer;
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/backup/restore', {
          method: 'POST',
          headers,
          body: JSON.stringify({ fileContent: base64 })
        });

        const json = await res.json();
        if (json.code !== 200) throw new Error(json.message || '恢复失败');

        alert('✅ 数据库恢复成功！页面将刷新。');
        window.location.reload();
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      alert('恢复失败: ' + err.message);
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        备份
      </button>

      <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {restoring ? '恢复中...' : '恢复'}
        <input
          type="file"
          accept=".db"
          onChange={handleRestore}
          disabled={restoring}
          className="hidden"
        />
      </label>
    </div>
  );
}
