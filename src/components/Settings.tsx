import React, { useState } from 'react';
import * as utils from '../utils/settingsUtils';
import SettingsAdvanced from './SettingsAdvanced';
import SettingsBasic from './SettingsBasic';

export interface SettingsProps {
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

export default function Settings({ maxLength, setMaxLength, minLength, setMinLength,
  minTm, setMinTm, numPrimers, setNumPrimers,
  checkT7, setCheckT7, isLoading }: SettingsProps) {
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    // Sprawdzamy przy użyciu utilsa, czy parametry są obecnie domyślne
    const isAlreadyDefault = utils.isDefaultSettings(
        minTm, maxLength, minLength, numPrimers
    );

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
        {showAdvanced && <SettingsAdvanced  {...{ maxLength, setMaxLength, minLength, setMinLength, minTm, setMinTm, numPrimers, setNumPrimers, isLoading } } />}

            {/* SEKCJA PODSTAWOWA */}
            <SettingsBasic
                checkT7={checkT7}
                setCheckT7={setCheckT7}
                isLoading={isLoading}
            />

        </div>
    );
}
