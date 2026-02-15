import { useState } from 'react';
import type { ImportRequest } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (req: ImportRequest) => Promise<void>;
}

export default function PasteImportDialog({ open, onClose, onImport }: Props) {
  const [content, setContent] = useState('');
  const [separator, setSeparator] = useState('----');
  const [format, setFormat] = useState<string[]>(['email', 'password', 'client_id', 'refresh_token']);
  const [importing, setImporting] = useState(false);

  if (!open) return null;

  const previewLines = content.split('\n').filter(Boolean).slice(0, 5);

  const handleFormatChange = (index: number, value: string) => {
    setFormat(f => { const n = [...f]; n[index] = value; return n; });
  };

  const addField = () => setFormat(f => [...f, '']);
  const removeField = (index: number) => setFormat(f => f.filter((_, i) => i !== index));

  const handleImport = async () => {
    if (!content.trim()) return;
    setImporting(true);
    try {
      await onImport({ content, separator, format });
      onClose();
      setContent('');
    } finally {
      setImporting(false);
    }
  };

  const fieldOptions = ['email', 'password', 'client_id', 'refresh_token'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[85vh] overflow-y-auto animate-[slideUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">粘贴导入</h2>

        <div className="space-y-4">
          {/* Paste area */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">粘贴内容</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={'email----password----client_id----refresh_token\nuser@outlook.com----pass123----abc-def----token...'}
            />
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

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            取消
          </button>
          <button onClick={handleImport} disabled={importing || !content.trim()} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {importing ? '导入中...' : '开始导入'}
          </button>
        </div>
      </div>
    </div>
  );
}
