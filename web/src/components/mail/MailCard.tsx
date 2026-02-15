import { timeAgo, getInitials, getAvatarColor, cn } from '../../lib/utils';
import type { MailMessage } from '../../types';

interface MailCardProps {
  mail: MailMessage;
  isSelected: boolean;
  onClick: () => void;
}

export function MailCard({ mail, isSelected, onClick }: MailCardProps) {
  const initials = getInitials(mail.sender_name || mail.sender);
  const avatarColor = getAvatarColor(mail.sender);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full gap-3 rounded-lg border p-3 text-left transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-secondary/50'
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            'truncate text-sm',
            !mail.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'
          )}>
            {mail.sender_name || mail.sender}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {timeAgo(mail.mail_date)}
          </span>
        </div>
        <p className="truncate text-sm text-foreground">
          {mail.subject || '(无主题)'}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {mail.text_content?.slice(0, 120) || '(无内容)'}
        </p>
      </div>
    </button>
  );
}
