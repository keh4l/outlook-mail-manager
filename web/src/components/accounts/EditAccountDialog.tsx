import { useState, useEffect } from 'react';
import type { Account, Tag } from '../../types';

interface Props {
  open: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: (data: Partial<Account>) => Promise<void>;
  tags?: Tag[];
  accountTagIds?: number[];
  onTagToggle?: (tagId: number) => void;
  onCreateTag?: (name: string, color?: string) => Promise<void>;
  onDeleteTag?: (tagId: number) => void;
}

export default function EditAccountDialog({ open, account, onClose, onSave, tags = [], accountTagIds = [], onTagToggle, onCreateTag, onDeleteTag }: Props) {
  const [form, setForm] = useState({ email: '', password: '', client_id: '', refresh_token: '', remark: '' });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    if (account) {
      setForm({ email: account.email, password: account.password, client_id: account.client_id, refresh_token: account.refresh_token, remark: account.remark || '' });
    } else {
      setForm({ email: '', password: '', client_id: '', refresh_token: '', remark: '' });
    }
    setShowPassword(false);
  }, [account, open]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-[slideUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          {account ? '编辑邮箱' : '新增邮箱'}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">邮箱地址</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@outlook.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">密码</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">客户端 ID</label>
            <input
              type="text"
              value={form.client_id}
              onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Azure App Client ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">刷新令牌</label>
            <textarea
              value={form.refresh_token}
              onChange={e => setForm(f => ({ ...f, refresh_token: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Refresh Token"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">备注</label>
            <input
              type="text"
              value={form.remark}
              onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="可选备注信息"
            />
          </div>
          {/* 标签管理 */}
          {account && tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">标签</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const isSelected = accountTagIds.includes(tag.id);
                  return (
                    <div key={tag.id} className="group/tag relative inline-flex">
                      <button
                        type="button"
                        onClick={() => onTagToggle?.(tag.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'border-transparent'
                            : 'hover:border-zinc-400 dark:hover:border-zinc-500'
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: tag.color, color: '#fff', borderColor: tag.color }
                            : { color: tag.color, borderColor: tag.color, backgroundColor: tag.color + '18' }
                        }
                      >
                        {tag.name}
                        {isSelected && <span className="ml-0.5">✓</span>}
                      </button>
                      {onDeleteTag && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`确定要删除标签"${tag.name}"吗？`)) {
                              onDeleteTag(tag.id);
                            }
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover/tag:opacity-100 hover:bg-red-600 transition-opacity flex items-center justify-center text-xs"
                          title="删除标签"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* 新建标签 */}
          {account && onCreateTag && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newTagName.trim()) {
                      e.preventDefault();
                      onCreateTag(newTagName.trim());
                      setNewTagName('');
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="新建标签，回车确认"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTagName.trim()) {
                      onCreateTag(newTagName.trim());
                      setNewTagName('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                >
                  添加
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            取消
          </button>
          <button onClick={handleSave} disabled={saving || !form.email} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
