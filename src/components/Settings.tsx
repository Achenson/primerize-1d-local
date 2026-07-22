// src/components/Settings.tsx
import React from 'react';

interface SettingsProps {
    maxLength: number | string;
    setMaxLength: (value: number | string) => void;
    minLength: number | string;
    setMinLength: (value: number | string) => void;
    checkT7: boolean;
    setCheckT7: (value: boolean) => void;
    engineReady: boolean;
    isLoading: boolean;
}

export default function Settings({ maxLength, setMaxLength, minLength, setMinLength, checkT7, setCheckT7, engineReady, isLoading }: SettingsProps) {
    const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false);

    // DYNAMICZNA KONTROLA WPISYWANIA DLA MAX LENGTH
    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;

        // Zawsze pozwalamy na czyszczenie pola (pusty string), aby dało się wpisać liczbę od nowa
        if (valStr === '') {
            setMaxLength('');
            return;
        }

        const valNum = Number(valStr);
        // FIZYCZNA BLOKADA: Jeśli liczba przekracza 120, ignorujemy tę akcję i nie pozwalamy wpisać cyfry
        if (valNum > 120) {
            return;
        }

        setMaxLength(valStr);
    };

    // WALIDACJA NA OPUSZCZENIE POLA DLA MAX LENGTH (dolna granica)
    const handleMaxBlur = () => {
        if (maxLength === '') {
            setMaxLength(60); // Fallback do domyślnej
            return;
        }
        const val = Number(maxLength);
        if (val < 15) setMaxLength(15); // Automatyczna korekta dolnej granicy
    };

        // DYNAMICZNA KONTROLA WPISYWANIA DLA MIN LENGTH
        const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const valStr = e.target.value;

            if (valStr === '') {
                setMinLength('');
                return;
            }

            const valNum = Number(valStr);
            // FIZYCZNA BLOKADA: Jeśli liczba przekracza 60, ignorujemy zmianę stanu
            if (valNum > 60) {
                return;
            }

            setMinLength(valStr);
        };

        // WALIDACJA NA OPUSZCZENIE POLA DLA MIN LENGTH (dolna granica)
        const handleMinBlur = () => {
            if (minLength === '') {
                setMinLength(15); // Fallback do domyślnej
                return;
            }
            const val = Number(minLength);
            if (val < 10) setMinLength(10); // Automatyczna korekta dolnej granicy
        };

            return (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-4">

                <div className="flex items-center justify-between">
                <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                type="button"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer focus:outline-none flex items-center gap-1"
                >
                {showAdvanced ? 'Hide Advanced Design Settings' : 'Show Advanced Design Settings'}
                </button>
                </div>

                {showAdvanced && (
                    <div className="flex flex-col gap-4 pt-2 border-t border-slate-200/60 animate-fadeIn">

                    {/* OPTION 1: MAX LENGTH LIMIT */}
                    <div className="flex flex-col gap-1">
                    <label className="block text-xs font-semibold text-slate-600">
                    Max Oligo Length Limit
                    </label>
                    <div className="flex items-center gap-3">
                    <input
                    type="number"
                    className="w-24 p-1.5 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    value={maxLength}
                    onChange={handleMaxChange} // Dynamiczna blokada klawiatury
                    onBlur={handleMaxBlur}     // Korekta dolnej granicy
                    disabled={isLoading}
                    min={15}
                    max={120}
                    />
                    <span className="text-[11px] text-slate-400 italic shrink-0">
                    (Range: 15-120 bp)
                    </span>
                    </div>
                    </div>

                    {/* OPTION 2: MIN LENGTH LIMIT */}
                    <div className="flex flex-col gap-1">
                    <label className="block text-xs font-semibold text-slate-600">
                    Min Oligo Length Limit
                    </label>
                    <div className="flex items-center gap-3">
                    <input
                    type="number"
                    className="w-24 p-1.5 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    value={minLength}
                    onChange={handleMinChange} // Dynamiczna blokada klawiatury
                    onBlur={handleMinBlur}     // Korekta dolnej granicy
                    disabled={isLoading}
                    min={10}
                    max={60}
                    />
                    <span className="text-[11px] text-slate-400 italic shrink-0">
                    (Range: 10-60 bp)
                    </span>
                    </div>
                    </div>

                    </div>
                )}

                {/* T7 Promoter verification sector */}
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
