export function MailSkeleton() {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-lg border border-border p-3 animate-pulse">
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-3.5 w-2/3 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
          </div>
          <div className="h-3 w-10 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
