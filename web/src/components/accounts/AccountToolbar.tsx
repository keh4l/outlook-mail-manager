import { useState, useRef, useEffect } from 'react';
import { ALL_COLUMNS } from './AccountTable';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCount: number;
  onFileImport: () => void;
  onPasteImport: () => void;
  onExportSelected: () => void;
  onExportAll: () => void;
  onDeleteSelected: () => void;
  onDeleteAll: () => void;
  visibleColumns: string[];
  onColumnsChange: (cols: string[]) => void;
}

function ColumnSettingsDropdown({ visibleColumns, onColumnsChange }: { visibleColumns: string[]; onColumnsChange: (cols: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (key: string) => {
    const next = visibleColumns.includes(key)
      ? visibleColumns.filter(k => k !== key)
      : [...visibleColumns, key];
    onColumnsChange(next);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        title="列设置"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg py-1">
          <div className="px-3 py-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">显示列</div>
          {ALL_COLUMNS.map(col => (
            <label
              key={col.key}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer text-sm text-zinc-700 dark:text-zinc-300"
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={() => toggle(col.key)}
                className="rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
              />
              {col.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountToolbar({
  searchQuery, onSearchChange, selectedCount,
  onFileImport, onPasteImport, onExportSelected, onExportAll,
  onDeleteSelected, onDeleteAll,
  visibleColumns, onColumnsChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[150px] md:min-w-[200px] max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="搜索邮箱..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Import buttons */}
        <button onClick={onFileImport} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" /></svg>
          <span className="hidden sm:inline">文件导入</span>
        </button>
        <button onClick={onPasteImport} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <span className="hidden sm:inline">粘贴导入</span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {/* Export buttons */}
        <button onClick={onExportSelected} disabled={selectedCount === 0} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          <span className="hidden sm:inline">导出选中{selectedCount > 0 && ` (${selectedCount})`}</span>
        </button>
        <button onClick={onExportAll} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <span className="hidden sm:inline">全部导出</span>
          <span className="sm:hidden">导出</span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {/* Delete buttons */}
        <button onClick={onDeleteSelected} disabled={selectedCount === 0} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          <span className="hidden sm:inline">删除选中{selectedCount > 0 && ` (${selectedCount})`}</span>
        </button>
        <button onClick={onDeleteAll} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <span className="hidden sm:inline">全部删除</span>
          <span className="sm:hidden">删除</span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {/* Column settings */}
        <ColumnSettingsDropdown visibleColumns={visibleColumns} onColumnsChange={onColumnsChange} />
      </div>
    </div>
  );
}
