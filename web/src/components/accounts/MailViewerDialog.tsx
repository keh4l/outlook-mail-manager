import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useMailStore } from '../../stores/mails';
import { MailList } from '../mail/MailList';
import { MailContent } from '../mail/MailContent';

interface MailViewerDialogProps {
  open: boolean;
  accountId: number;
  accountEmail: string;
  initialMailbox: 'INBOX' | 'Junk';
  onClose: () => void;
}

export function MailViewerDialog({
  open,
  accountId,
  accountEmail,
  initialMailbox,
  onClose,
}: MailViewerDialogProps) {
  const { setCurrentAccount, setMailbox, fetchCachedMails, selectedMail } = useMailStore();

  useEffect(() => {
    if (open) {
      setCurrentAccount(accountId);
      setMailbox(initialMailbox);
      fetchCachedMails(accountId, initialMailbox);
    }
  }, [open, accountId, initialMailbox, setCurrentAccount, setMailbox, fetchCachedMails]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[80vh] bg-background rounded-lg shadow-xl flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">邮件查看</h2>
            <p className="text-sm text-muted-foreground">{accountEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">关闭</span>
          </button>
        </div>

        {/* Content: Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Mail list */}
          <div className="w-[320px] shrink-0 border-r border-border bg-card overflow-hidden">
            <MailList accountId={accountId} />
          </div>

          {/* Right: Mail content */}
          <div className="flex-1 overflow-hidden bg-background">
            <MailContent mail={selectedMail} />
          </div>
        </div>
      </div>
    </div>
  );
}
