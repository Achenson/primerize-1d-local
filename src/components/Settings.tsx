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

export default function Settings({
  maxLength,
  setMaxLength,
  minLength,
  setMinLength,
  minTm,
  setMinTm,
  numPrimers,
  setNumPrimers,
  checkT7,
  setCheckT7,
  isLoading,
}: SettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Sprawdzamy przy użyciu utilsa, czy parametry są obecnie domyślne
  const isAlreadyDefault = utils.isDefaultSettings(
    minTm,
    maxLength,
    minLength,
    numPrimers,
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
    <div className="flex flex-col gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
      {/* NAGŁÓWEK Z ELESTYCZNYM ROZSTAWIENIEM PRZYCISKÓW */}
      <div className="flex w-full items-center justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          type="button"
          className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950 focus:outline-none"
        >
          {showAdvanced
            ? 'Hide Advanced Design Settings'
            : 'Show Advanced Design Settings'}
        </button>

        {showAdvanced && (
          <button
            onClick={handleResetToDefault}
            disabled={isAlreadyDefault || isLoading}
            type="button"
            className="cursor-pointer text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800 focus:outline-none disabled:cursor-default disabled:text-slate-400"
          >
            Reset to Defaults
          </button>
        )}
      </div>

      {/* SEKCJA ZAAWANSOWANA */}
      {showAdvanced && (
        <SettingsAdvanced
          {...{
            maxLength,
            setMaxLength,
            minLength,
            setMinLength,
            minTm,
            setMinTm,
            numPrimers,
            setNumPrimers,
            isLoading,
          }}
        />
      )}

      {/* SEKCJA PODSTAWOWA */}
      <SettingsBasic
        checkT7={checkT7}
        setCheckT7={setCheckT7}
        isLoading={isLoading}
      />
    </div>
  );
}
