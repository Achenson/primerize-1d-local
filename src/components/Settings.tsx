// src/components/Settings.tsx
import React from 'react';

interface SettingsProps {
    maxLength: number | string;
    setMaxLength: (value: number | string) => void;
    checkT7: boolean;
    setCheckT7: (value: boolean) => void;
    engineReady: boolean;
    isLoading: boolean;
}

export default function Settings({ maxLength, setMaxLength, checkT7, setCheckT7, engineReady, isLoading }: SettingsProps) {
    return (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-800">Advanced Design Settings</h3>

        <div className="flex flex-col gap-1">
        <label className="block text-xs font-semibold text-slate-600">
        Max Oligo Length Limit
        </label>
        <input
        type="number"
        className="w-24 p-1.5 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
        value={maxLength}
        onChange={(e) => setMaxLength(e.target.value)}
        disabled={isLoading || !engineReady}
        min={15}
        max={120}
        />
        </div>

        {/* T7 PROMOTER AUTOMATED PREPEND ELEMENT */}
        <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 mt-1">
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
