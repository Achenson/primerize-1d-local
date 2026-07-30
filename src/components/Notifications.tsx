interface NotificationsProps {
  message: string | null | undefined;
  variant?: 'error' | 'warning';
}

export default function Notifications({
  message,
  variant = 'error',
}: NotificationsProps) {
  if (!message) return null;

  if (variant === 'warning') {
    //the notification already has one "Warning"
    const cleanMessage =
      typeof message === 'string'
        ? message.replace(/WARNING:\s*/g, '').trim()
        : message;

    return (
      <div
        data-testid="primerize-warning"
        className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800 shadow-sm"
      >
        <span className="shrink-0 pt-0.5 text-base leading-none">⚠️</span>
        <div>
          <strong className="mb-0.5 block font-bold text-amber-900">
            Warning
          </strong>
          <span className="whitespace-pre-wrap">{cleanMessage}</span>
        </div>
      </div>
    );
  }

  // variant === 'error'
  return (
    <div
      data-testid="primerize-error"
      className="flex items-start gap-2 rounded border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800 shadow-sm"
    >
      <span className="shrink-0 pt-0.5 text-base leading-none">⚠️</span>
      <div>
        <strong className="mb-0.5 block font-bold text-rose-900">
          Engine Error
        </strong>
        <span className="whitespace-pre-wrap">{message}</span>
      </div>
    </div>
  );
}
