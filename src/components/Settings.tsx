// src/components/Settings.tsx
import React, { useState } from 'react';

interface SettingsProps {
    maxLength: number | string;
    setMaxLength: (value: number | string) => void;
    checkT7: boolean;
    setCheckT7: (value: boolean) => void;
    engineReady: boolean;
    isLoading: boolean;
}

export default function Settings({ maxLength, setMaxLength, checkT7, setCheckT7, engineReady, isLoading }: SettingsProps) {
    // STAN: Steruje widocznością dodatkowych opcji (domyślnie ukryte)
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    return (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-4">

        {/* PRZYCISK TOGGLE: Przełącza tekst Show / Hide i wymusza kursor pointer */}
        <div className="flex items-center justify-between">
        <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        type="button"
        className="text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer focus:outline-none flex items-center gap-1"
        >
        {/* Dynamiczny tekst przycisku */}
        {showAdvanced ? 'Hide Advanced Design Settings' : 'Show Advanced Design Settings'}
        </button>
        </div>

        {/* SEKCJA UKRYTA: Pojawia się tylko, gdy showAdvanced jest true */}
        {showAdvanced && (
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-200/60 animate-fadeIn">
            <div className="flex flex-col gap-1">
            <label className="block text-xs font-semibold text-slate-600">
            Max Oligo Length Limit
            </label>
            <input
            type="number"
            className="w-24 p-1.5 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            disabled={isLoading || !engineReady}
            min={15}
            max={120}
            />
            </div>
            {/* Tutaj w przyszłości możesz bez problemu dopisywać kolejne zaawansowane pola */}
            </div>
        )}

        {/* SEKCJA Z PROMOTOREM T7: Zawsze na dole, niezależnie od stanu ukrycia zaawansowanych pól */}
        <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60">
        <input
        type="checkbox"
        id="checkT7"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
        checked={checkT7}
        onChange={(e) => setCheckT7(e.target.checked)}
        disabled={isLoading || !engineReady}
        />
        <div className="flex flex-col">
        <label htmlFor="checkT7" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
        Automatically add T7 Promoter Sequence
        </label>
        <span className="text-[11px] text-slate-400 italic leading-snug">
        Prepends the T7 RNA polymerase promoter (TTCTAATACGACTCACTATA) if missing.
        </span>
        </div>
        </div>

        </div>
    );
}
