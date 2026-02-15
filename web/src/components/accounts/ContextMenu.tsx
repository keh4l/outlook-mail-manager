import { useEffect, useRef } from 'react';
import type { Account, Tag } from '../../types';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  separator?: false;
}

interface SeparatorItem {
  separator: true;
}

type MenuItemType = MenuItem | SeparatorItem;

interface Props {
  x: number;
  y: number;
  account: Account;
  tags: Tag[];
  onClose: () => void;
  onCopyEmail: () => void;
  onCopyPassword: () => void;
  onCopyToken: () => void;
  onEdit: () => void;
  onToggleTag: (tagId: number) => void;
  onViewMail: (mailbox: 'INBOX' | 'Junk') => void;
  onDelete: () => void;
}

export default function ContextMenu({ x, y, account, tags, onClose, onCopyEmail, onCopyPassword, onCopyToken, onEdit, onToggleTag, onViewMail, onDelete }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const accountTagIds = (account.tags || []).map(t => t.id);

  useEffect(() => {
    const handleClick = () => onClose();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menuRef.current.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menuRef.current.style.top = `${y - rect.height}px`;
    }
  }, [x, y]);

  const items: MenuItemType[] = [
    { label: '复制邮箱', onClick: onCopyEmail, icon: <CopyIcon /> },
    { label: '复制密码', onClick: onCopyPassword, icon: <CopyIcon /> },
    { label: '复制 Token', onClick: onCopyToken, icon: <CopyIcon /> },
    { separator: true },
    { label: '编辑', onClick: onEdit, icon: <EditIcon /> },
    { separator: true },
    { label: '查看收件箱', onClick: () => onViewMail('INBOX'), icon: <MailIcon /> },
    { label: '查看垃圾邮件', onClick: () => onViewMail('Junk'), icon: <MailIcon /> },
    { separator: true },
    { label: '删除', onClick: onDelete, danger: true, icon: <DeleteIcon /> },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[80] min-w-[180px] py-1 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 animate-[fadeIn_0.1s_ease-out]"
      style={{ left: x, top: y }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) => {
        if ('separator' in item && item.separator) {
          return <div key={i} className="my-1 border-t border-zinc-200 dark:border-zinc-700" />;
        }
        const mi = item as MenuItem;
        return (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); mi.onClick(); onClose(); }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
              mi.danger
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            {mi.icon && <span className="w-4 h-4 flex-shrink-0">{mi.icon}</span>}
            {mi.label}
          </button>
        );
      })}

      {/* Tag submenu inline */}
      {tags.length > 0 && (
        <>
          <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />
          <div className="px-3 py-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">标签</div>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={(e) => { e.stopPropagation(); onToggleTag(tag.id); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 border"
                style={{
                  backgroundColor: accountTagIds.includes(tag.id) ? tag.color : 'transparent',
                  borderColor: tag.color,
                }}
              />
              {tag.name}
              {accountTagIds.includes(tag.id) && (
                <svg className="w-3.5 h-3.5 ml-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
