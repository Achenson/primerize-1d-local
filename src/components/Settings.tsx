// src/components/Settings.tsx
import React, { useState } from 'react';
import * as utils from '../utils/settingsUtils';

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
    isLoading
}: SettingsProps) {
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    // Sprawdzamy przy użyciu utilsa, czy parametry są obecnie domyślne
    const isAlreadyDefault = utils.isDefaultSettings(minTm, maxLength, minLength, numPrimers);

    // Funkcja masowego przywracania wartości fabrycznych Stanforda
    const handleResetToDefault = () => {
        if (isLoading) return;
        setMinTm(60);
        setMaxLength(60);
        setMinLength(15);
        setNumPrimers('');
    };

    return (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-4">

        {/* NAGŁÓWEK Z ELESTYCZNYM ROZSTAWIENIEM PRZYCISKÓW */}
        <div className="flex items-center justify-between w-full">
        <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        type="button"
        className="text-sm font-semibold text-slate-700 hover:text-slate-950 cursor-pointer focus:outline-none flex items-center gap-1"
        >
        {showAdvanced ? 'Hide Advanced Design Settings' : 'Show Advanced Design Settings'}
        </button>

        {/*
            PRZYCISK RESETU:
            - Widoczny tylko gdy showAdvanced === true
            - Szary i nieaktywny gdy isAlreadyDefault === true lub trwa ładowanie obliczeń
            */}
            {showAdvanced && (
                <button
                onClick={handleResetToDefault}
                disabled={isAlreadyDefault || isLoading}
                type="button"
                className="text-xs font-semibold transition-colors focus:outline-none disabled:text-slate-400 disabled:cursor-default text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                Reset to Defaults
                </button>
            )}
            </div>

            {/* SEKCJA ZAAWANSOWANA */}
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
                onChange={(e) => {
                    const cleaned = utils.cleanTmChange(e.target.value);
                    if (cleaned !== null) setMinTm(cleaned);
                }}
                onBlur={() => setMinTm(utils.cleanTmBlur(minTm))}
                disabled={isLoading}
                min={50}
                max={80}
                />
                <span className="text-[11px] text-slate-400 italic shrink-0">
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
                <span className="text-[11px] text-slate-400 italic shrink-0">
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
                <span className="text-[11px] text-slate-400 italic shrink-0">
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
                />
                <span className="text-[11px] text-slate-400 italic shrink-0">
                Leave blank for automatic calculation. Range: 2-50
                </span>
                </div>
                </div>

                </div>
            )}

            {/* SEKCJA Z PROMOTOREM T7 */}
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
