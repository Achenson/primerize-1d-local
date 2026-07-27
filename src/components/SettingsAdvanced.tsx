
import React from 'react';
import * as utils from '../utils/settingsUtils';

// Samodzielna definicja typu dla komponentu zaawansowanego
interface AdvancedProps {
    maxLength: number | string;
    setMaxLength: (value: number | string) => void;
    minLength: number | string;
    setMinLength: (value: number | string) => void;
    minTm: number | string;
    setMinTm: (value: number | string) => void;
    numPrimers: number | string;
    setNumPrimers: (value: number | string) => void;
    isLoading: boolean;
}

export default function SettingsAdvanced({
    maxLength, setMaxLength,
    minLength, setMinLength,
    minTm, setMinTm,
    numPrimers, setNumPrimers,
    isLoading
}: AdvancedProps) {
    return (
        <div className="flex flex-col gap-4 pt-2 border-t border-slate-200/60 animate-fadeIn">

            {/* POZYCJA 1: MINIMUM TM */}
            <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-slate-600">
                    Minimum Tm
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        className="w-24 p-1.5 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                        value={minTm}
                        onChange={(e) => {
                            const cleaned = utils.cleanTmChange(e.target.value);
                            if (cleaned !== null) setMinTm(cleaned);
                        }}
                        onBlur={() => setMinTm(utils.cleanTmBlur(minTm))}
                        disabled={isLoading}
                        min={50}
                        max={80}
                    />
                    <span className="text-[11px] text-slate-400 italic shrink-0 cursor-default select-none">
                        Range: 50-80 °C
                    </span>
                </div>
            </div>

            {/* POZYCJA 2: MAX OLIGO LENGTH LIMIT */}
            <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-slate-600">
                    Max Oligo Length Limit
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        className="w-24 p-1.5 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                        value={maxLength}
                        onChange={(e) => {
                            const cleaned = utils.cleanMaxChange(e.target.value);
                            if (cleaned !== null) setMaxLength(cleaned);
                        }}
                        onBlur={() => setMaxLength(utils.cleanMaxBlur(maxLength))}
                        disabled={isLoading}
                        min={15}
                        max={120}
                    />
                    <span className="text-[11px] text-slate-400 italic shrink-0 cursor-default select-none">
                        Range: 15-120 bp
                    </span>
                </div>
            </div>

            {/* POZYCJA 3: MIN OLIGO LENGTH LIMIT */}
            <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-slate-600">
                    Min Oligo Length Limit
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        className="w-24 p-1.5 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                        value={minLength}
                        onChange={(e) => {
                            const cleaned = utils.cleanMinChange(e.target.value);
                            if (cleaned !== null) setMinLength(cleaned);
                        }}
                        onBlur={() => setMinLength(utils.cleanMinBlur(minLength))}
                        disabled={isLoading}
                        min={10}
                        max={60}
                    />
                    <span className="text-[11px] text-slate-400 italic shrink-0 cursor-default select-none">
                        Range: 10-60 bp
                    </span>
                </div>
            </div>

            {/* POZYCJA 4: NUMBER OF PRIMERS */}
            <div className="flex flex-col gap-1">
                <label className="block text-xs font-semibold text-slate-600">
                    Number of Primers
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        className="w-24 p-1.5 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                        value={numPrimers}
                        onChange={(e) => {
                            const cleaned = utils.cleanNumPrimersChange(e.target.value);
                            if (cleaned !== null) setNumPrimers(cleaned);
                        }}
                        onBlur={() => setNumPrimers(utils.cleanNumPrimersBlur(numPrimers))}
                        disabled={isLoading}
                        placeholder="Auto"
                        min={2}
                        max={50}
                        step={2}
                    />
                    <span className="text-[11px] text-slate-400 italic shrink-0 cursor-default select-none">
                        Leave blank for automatic calculation. Range: 2-50
                    </span>
                </div>
            </div>

        </div>
    );
}
