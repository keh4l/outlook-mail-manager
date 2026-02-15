import { useRef, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../lib/utils';
import type { MailMessage } from '../../types';

interface MailContentProps {
  mail: MailMessage | null;
}

export function MailContent({ mail }: MailContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!mail?.html_content || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
            padding: 0;
            margin: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          img { max-width: 100%; height: auto; }
          a { color: #3b82f6; }
          pre { overflow-x: auto; }
          table { max-width: 100%; }
        </style>
      </head>
      <body>${mail.html_content}</body>
      </html>
    `);
    doc.close();
  }, [mail?.html_content]);

  if (!mail) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <Mail className="h-12 w-12 opacity-30" />
        <p className="text-sm">选择一封邮件查看内容</p>
      </div>
    );
  }

  const initials = getInitials(mail.sender_name || mail.sender);
  const avatarColor = getAvatarColor(mail.sender);
  const dateStr = new Date(mail.mail_date).toLocaleString('zh-CN');

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">
              {mail.sender_name || mail.sender}
            </p>
            <p className="text-xs text-muted-foreground">{mail.sender}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{dateStr}</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {mail.subject || '(无主题)'}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mail.html_content ? (
          <iframe
            ref={iframeRef}
            sandbox="allow-same-origin"
            title="邮件内容"
            className="h-full w-full border-0"
          />
        ) : (
          <div className="p-4">
            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {mail.text_content || '(无内容)'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
