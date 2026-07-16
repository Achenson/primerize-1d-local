import React from 'react';

interface NotificationsProps {
    error: string;
}

export default function Notifications({ error }: NotificationsProps) {
    if (!error) return null;

    return (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded">
        ⚠️ {error}
        </div>
    );
}
