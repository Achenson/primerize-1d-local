interface NotificationsProps {
    message: string | null | undefined;
    variant?: 'error' | 'warning';
}

export default function Notifications({ message, variant = 'error' }: NotificationsProps) {
    if (!message) return null;

    if (variant === 'warning') {
        const cleanMessage = typeof message === 'string'
            ? message.replace(/WARNING:\s*/g, '').trim()
            : message;

        return (
            <div data-testid="primerize-warning" className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded shadow-sm flex items-start gap-2">
                <span className="shrink-0 text-base leading-none pt-0.5">⚠️</span>
                <div>
                    <strong className="block font-bold text-amber-900 mb-0.5">Warning</strong>
                    <span className="whitespace-pre-wrap">{cleanMessage}</span>
                </div>
            </div>
        );
    }

    // Zunifikowany styl dla variant === 'error' z dodanym nagłówkiem
    return (
        <div data-testid="primerize-error" className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium rounded shadow-sm flex items-start gap-2">
            <span className="shrink-0 text-base leading-none pt-0.5">⚠️</span>
            <div>
                <strong className="block font-bold text-rose-900 mb-0.5">Engine Error</strong>
                <span className="whitespace-pre-wrap">{message}</span>
            </div>
        </div>
    );
}
