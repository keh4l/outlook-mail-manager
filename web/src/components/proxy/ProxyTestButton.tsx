import { useState } from 'react';
import type { ProxyTestResult } from '../../types';

interface Props {
  proxyId: number;
  onTest: (id: number) => Promise<ProxyTestResult>;
}

export default function ProxyTestButton({ proxyId, onTest }: Props) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ProxyTestResult | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const res = await onTest(proxyId);
      setResult(res);
    } catch {
      setResult({ ip: '', latency: 0, status: 'failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleTest}
        disabled={testing}
        className="px-2.5 py-1 text-xs rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {testing ? (
          <span className="inline-flex items-center gap-1">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            测试中
          </span>
        ) : '测试'}
      </button>
      {result && !testing && (
        <span className={`text-xs ${result.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {result.status === 'active' ? `${result.ip} · ${result.latency}ms` : '连接失败'}
        </span>
      )}
    </div>
  );
}
