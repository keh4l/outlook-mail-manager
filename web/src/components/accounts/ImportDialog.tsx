import { useState } from 'react';
import type { ImportRequest, ImportPreviewResult } from '../../types';
import { accountApi } from '../../lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: () => void;
}

export default function ImportDialog({ open, onClose, onImport }: Props) {
  const [content, setContent] = useState('');
  const [separator, setSeparator] = useState('----');
  const [format, setFormat] = useState<string[]>(['email', 'password', 'client_id', 'refresh_token']);
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);
  const [mode, setMode] = useState<'skip' | 'overwrite'>('skip');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setContent((ev.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  const previewLines = content.split('\n').filter(Boolean).slice(0, 5);

  const handleFormatChange = (index: number, value: string) => {
    setFormat(f => { const n = [...f]; n[index] = value; return n; });
  };

  const addField = () => setFormat(f => [...f, '']);
  const removeField = (index: number) => setFormat(f => f.filter((_, i) => i !== index));

  const handlePreview = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const result = await accountApi.importPreview({ content, separator, format });
      setPreviewData(result);
      setStep('preview');
    } catch (err: any) {
      alert('预览失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    setLoading(true);
    try {
      await accountApi.importConfirm({ content, separator, format, mode });
      onImport();
      handleClose();
    } catch (err: any) {
      alert('导入失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setFileName('');
    setStep('input');
    setPreviewData(null);
    setMode('skip');
    onClose();
  };

  const fieldOptions = ['email', 'password', 'client_id', 'refresh_token'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[fadeIn_0.2s_ease-out]" onClick={handleClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[85vh] overflow-y-auto animate-[slideUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          {step === 'input' ? '文件导入' : '导入预览'}
        </h2>

        {step === 'input' ? (
          <div className="space-y-4">
            {/* File picker */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">选择文件</label>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{fileName || '点击选择 .txt / .csv 文件'}</span>
                <input type="file" accept=".txt,.csv" onChange={handleFile} className="hidden" />
              </label>
            </div>

            {/* Separator */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">分隔符</label>
              <input
                type="text"
                value={separator}
                onChange={e => setSeparator(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: ---- 或 : 或 |"
              />
            </div>

            {/* Field order */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">字段顺序</label>
              <div className="space-y-2">
                {format.map((field, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 w-6">{i + 1}.</span>
                    <select
                      value={field}
                      onChange={e => handleFormatChange(i, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- 选择字段 --</option>
                      {fieldOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {format.length > 1 && (
                      <button onClick={() => removeField(i)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addField} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">+ 添加字段</button>
              </div>
            </div>

            {/* Preview */}
            {previewLines.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">预览（前5行）</label>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-600 dark:text-zinc-400 space-y-1 overflow-x-auto">
                  {previewLines.map((line, i) => <div key={i} className="whitespace-nowrap">{line}</div>)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{previewData?.newItems.length || 0}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">新增账户</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{previewData?.duplicates.length || 0}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">重复账户</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{previewData?.errors.length || 0}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">错误行</div>
              </div>
            </div>

            {/* Duplicate handling */}
            {(previewData?.duplicates.length || 0) > 0 && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">重复项处理方式</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mode" value="skip" checked={mode === 'skip'} onChange={() => setMode('skip')} className="text-blue-600" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">跳过重复项</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mode" value="overwrite" checked={mode === 'overwrite'} onChange={() => setMode('overwrite')} className="text-blue-600" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">覆盖更新</span>
                  </label>
                </div>
              </div>
            )}

            {/* Duplicates list */}
            {(previewData?.duplicates.length || 0) > 0 && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">重复账户列表</label>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                  {previewData?.duplicates.map((item, i) => (
                    <div key={i} className="text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="font-mono text-yellow-700 dark:text-yellow-300">Line {item.line}:</span> {item.email}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors list */}
            {(previewData?.errors.length || 0) > 0 && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">错误信息</label>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                  {previewData?.errors.map((err, i) => (
                    <div key={i} className="text-xs text-red-600 dark:text-red-400">{err}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          {step === 'preview' && (
            <button onClick={() => setStep('input')} className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              返回
            </button>
          )}
          <button onClick={handleClose} className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            取消
          </button>
          {step === 'input' ? (
            <button onClick={handlePreview} disabled={loading || !content.trim()} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? '分析中...' : '预览'}
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? '导入中...' : '确认导入'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
