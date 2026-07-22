// src/components/Settings.tsx
import React, { useState } from 'react';

interface SettingsProps {
    maxLength: number | string;
    setMaxLength: (value: number | string) => void;
    minLength: number | string;
    setMinLength: (value: number | string) => void;
    minTm: number | string;
    setMinTm: (value: number | string) => void;
    numPrimers: number | string;
    setNumPrimers: (value: number | string) => void;
    checkT7: boolean;
    setCheckT7: (value: boolean) => void;
    engineReady: boolean;
    isLoading: boolean;
}

export default function Settings({
    maxLength, setMaxLength,
    minLength, setMinLength,
    minTm, setMinTm,
    numPrimers, setNumPrimers,
    checkT7, setCheckT7,
    engineReady, isLoading
}: SettingsProps) {
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    // =========================================================================
    // DYNAMICZNA KONTROLA WPISYWANIA (ON-CHANGE BLOKADA GÓRNEJ GRANICY)
    // =========================================================================
    const handleTmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        if (valStr === '') { setMinTm(''); return; }
        if (Number(valStr) > 80) return; // Maksymalnie 80°C
        setMinTm(valStr);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        if (valStr === '') { setMaxLength(''); return; }
        if (Number(valStr) > 120) return; // Maksymalnie 120 bp
        setMaxLength(valStr);
    };

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        if (valStr === '') { setMinLength(''); return; }
        if (Number(valStr) > 60) return; // Maksymalnie 60 bp
        setMinLength(valStr);
    };

    const handleNumPrimersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        if (valStr === '') { setNumPrimers(''); return; }
        if (Number(valStr) > 50) return; // Maksymalnie 50 starterów
        setNumPrimers(valStr);
    };

    // =========================================================================
    // KOREKTA WARTOŚCI GRANICZNYCH (ON-BLUR AUTOMATYCZNE UZUPELNIANIE)
    // =========================================================================
    const handleTmBlur = () => {
        if (minTm === '') { setMinTm(60); return; } // Domyślna Stanford: 60°C
        if (Number(minTm) < 50) setMinTm(50);      // Minimalnie 50°C
    };

        const handleMaxBlur = () => {
            if (maxLength === '') { setMaxLength(60); return; } // Domyślna Stanford: 60 bp
            if (Number(maxLength) < 15) setMaxLength(15);      // Minimalnie 15 bp
        };

            const handleMinBlur = () => {
                if (minLength === '') { setMinLength(15); return; } // Domyślna Stanford: 15 bp
                if (Number(minLength) < 10) setMinLength(10);      // Minimalnie 10 bp
            };

                const handleNumPrimersBlur = () => {
                    if (numPrimers === '') return; // Pozwalamy na puste (tryb Auto)
                    if (Number(numPrimers) < 2) setNumPrimers(2); // Minimalnie 2 startery
                };

                    return (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-4">

                        {/* PRZYCISK TOGGLE ROZWIJANIA OPCJI */}
                        <div className="flex items-center justify-between">
                        <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        type="button"
                        className="text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer focus:outline-none flex items-center gap-1"
                        >
                        {showAdvanced ? 'Hide Advanced Design Settings' : 'Show Advanced Design Settings'}
                        </button>
                        </div>

                        {/* SEKCJA ZAAWANSOWANA (WYSWIETLANA WARUNKOWO) */}
                        {showAdvanced && (
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
                            onChange={handleTmChange}
                            onBlur={handleTmBlur}
                            disabled={isLoading}
                            min={50}
                            max={80}
                            />
                            <span className="text-[11px] text-slate-400 italic shrink-0">
                            (Range: 50-80 °C, Default: 60)
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
                            onChange={handleMaxChange}
                            onBlur={handleMaxBlur}
                            disabled={isLoading}
                            min={15}
                            max={120}
                            />
                            <span className="text-[11px] text-slate-400 italic shrink-0">
                            (Range: 15-120 bp)
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
                            onChange={handleMinChange}
                            onBlur={handleMinBlur}
                            disabled={isLoading}
                            min={10}
                            max={60}
                            />
                            <span className="text-[11px] text-slate-400 italic shrink-0">
                            (Range: 10-60 bp)
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
                            onChange={handleNumPrimersChange}
                            onBlur={handleNumPrimersBlur}
                            disabled={isLoading}
                            placeholder="Auto"
                            min={2}
                            max={50}
                            />
                            <span className="text-[11px] text-slate-400 italic shrink-0">
                            (Leave blank for automatic minimum calculation)
                            </span>
                            </div>
                            </div>

                            </div>
                        )}

                        {/* SEKCJA Z PROMOTOREM T7 (ZAWSZE WIDOCZNA NA DOLE KONTENERA) */}
                        <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60">
                        <input
                        type="checkbox"
                        id="checkT7"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                        checked={checkT7}
                        onChange={(e) => setCheckT7(e.target.checked)}
                        disabled={isLoading}
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
