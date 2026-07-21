// src/components/Notifications.tsx
import React from 'react';

interface NotificationsProps {
    message: string;
    variant?: 'error' | 'warning'; // Nowy opcjonalny parametr stylizacji
}

export default function Notifications({ message, variant = 'error' }: NotificationsProps) {
    if (!message) return null;

    if (variant === 'warning') {
        return (
            <div data-testid="primerize-warning" className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded shadow-sm flex items-start gap-2">
            <span className="shrink-0 text-base">⚠️</span>
            <div>
            <strong className="block font-bold text-amber-900 mb-0.5">Engine Warning:</strong>
            <span className="whitespace-pre-wrap">{message}</span>
            </div>
            </div>
        );
    }

    // Domyślny, niezmieniony styl krytyczny (np. pusta sekwencja, złe litery)
    return (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded shadow-sm">
        ⚠️ {message}
        </div>
    );
}
