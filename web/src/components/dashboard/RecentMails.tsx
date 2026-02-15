import { motion } from 'framer-motion';
import { Mail, Clock, Inbox, AlertTriangle } from 'lucide-react';
import { timeAgo, getInitials, getAvatarColor } from '../../lib/utils';
import type { MailMessage } from '../../types';

function MailItem({ mail, index }: { mail: MailMessage; index: number }) {
  const initials = getInitials(mail.sender_name || mail.sender);
  const avatarBg = getAvatarColor(mail.sender);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-secondary/50 transition-colors"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: avatarBg }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {mail.sender_name || mail.sender}
          </p>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(mail.mail_date)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {mail.subject || '(无主题)'}
        </p>
      </div>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
          mail.mailbox === 'INBOX'
            ? 'bg-primary/10 text-primary'
            : 'bg-amber-500/10 text-amber-500'
        }`}
      >
        {mail.mailbox === 'INBOX' ? '收件箱' : '垃圾箱'}
      </span>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      <Mail className="h-10 w-10 mb-2 opacity-30" />
      <p className="text-sm">暂无邮件数据</p>
    </div>
  );
}

export function RecentMails({ mails }: { mails: MailMessage[] }) {
  const inboxCount = mails.filter((m) => m.mailbox === 'INBOX').length;
  const junkCount = mails.filter((m) => m.mailbox === 'Junk').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="glass-card flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          最近邮件
        </h2>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Inbox className="h-3 w-3 text-primary" /> {inboxCount}
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" /> {junkCount}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[360px] p-2">
        {mails.length > 0 ? (
          mails.map((mail, i) => <MailItem key={mail.id} mail={mail} index={i} />)
        ) : (
          <EmptyState />
        )}
      </div>
    </motion.div>
  );
}
