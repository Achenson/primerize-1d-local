import * as utils from '../utils/settingsUtils';

import { SettingsProps } from './Settings';

export type SettingsAdvancedProps = Omit<
  SettingsProps,
  'checkT7' | 'setCheckT7' | 'engineReady'
>;

export default function SettingsAdvanced({
  maxLength,
  setMaxLength,
  minLength,
  setMinLength,
  minTm,
  setMinTm,
  numPrimers,
  setNumPrimers,
  isLoading,
}: SettingsAdvancedProps) {
  return (
    <div className="animate-fadeIn flex flex-col gap-4 border-t border-slate-200/60 pt-2">
      <div className="flex flex-col gap-1">
        <label className="block text-xs font-semibold text-slate-600">
          Minimum Tm
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            className="w-24 rounded border border-slate-300 bg-white p-1.5 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
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
          <span className="shrink-0 cursor-default text-[11px] text-slate-400 italic select-none">
            Range: 50-80 °C
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="block text-xs font-semibold text-slate-600">
          Max Oligo Length Limit
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            className="w-24 rounded border border-slate-300 bg-white p-1.5 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
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
          <span className="shrink-0 cursor-default text-[11px] text-slate-400 italic select-none">
            Range: 15-120 bp
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="block text-xs font-semibold text-slate-600">
          Min Oligo Length Limit
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            className="w-24 rounded border border-slate-300 bg-white p-1.5 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
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
          <span className="shrink-0 cursor-default text-[11px] text-slate-400 italic select-none">
            Range: 10-60 bp
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="block text-xs font-semibold text-slate-600">
          Number of Primers
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            className="w-24 rounded border border-slate-300 bg-white p-1.5 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
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
          <span className="shrink-0 cursor-default text-[11px] text-slate-400 italic select-none">
            Leave blank for automatic calculation. Range: 2-50
          </span>
        </div>
      </div>
    </div>
  );
}
