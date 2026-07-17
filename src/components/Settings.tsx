import React from 'react';

interface SettingsProps {
    maxLength: number | string;
    setMaxLength: (value: number | string) => void;
    engineReady: boolean;
    isLoading: boolean;
}

export default function Settings({ maxLength, setMaxLength, engineReady, isLoading }: SettingsProps) {
    const handleBlurMaxLength = () => {
        if (maxLength === '' || Number(maxLength) < 15) {
            setMaxLength(15);
        } else if (Number(maxLength) > 120) {
            setMaxLength(120);
        }
    };

    return (
        <div className="flex flex-col gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded">
        <label className="block text-sm font-semibold text-slate-700">
        Maximum Oligo Length (bp)
        </label>
        <div className="flex items-center gap-2">
        <input
        type="number"
        className="w-24 p-2 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
        value={maxLength}
        onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
                setMaxLength('');
                return;
            }
            const numVal = Number(val);
            if (val.length === 1 || numVal <= 120) {
                setMaxLength(numVal);
            }
        }}
        onBlur={handleBlurMaxLength}
        min={15}
        max={120}
//         disabled={!engineReady || isLoading}
        disabled={isLoading}
        />
        <span className="text-xs text-slate-500 italic">
        Allowed range: 15 to 120 bp.
        </span>
        </div>
        </div>
    );
}
