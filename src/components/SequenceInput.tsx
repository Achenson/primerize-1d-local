import React from 'react';

interface SequenceInputProps {
  sequence: string;
  setSequence: (value: string) => void;
  prefix: string; // NEW STATE
  setPrefix: (value: string) => void; // NEW DISPATCHER
  onCalculate: () => void;
  engineReady: boolean;
  isLoading: boolean;
  clearError: () => void;
}

export default function SequenceInput({
  sequence,
  setSequence,
  prefix,
  setPrefix,
  onCalculate,
  engineReady,
  isLoading,
  clearError,
}: SequenceInputProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* NEW CONSTRUCT PREFIX INPUT FIELD */}
      <div className="flex flex-col gap-1">
        <label className="block text-sm font-semibold text-slate-700">
          Construct Name
        </label>
        <input
          type="text"
          className="w-full rounded border border-slate-300 bg-white p-2 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500"
          placeholder=""
          value={prefix}
          maxLength={20} // Original Stanford string length cap
          onChange={(e) => {
            const val = e.target.value;
            // Stanford strict verification match: allows letters, numbers, and underscores only
            const sanitizedVal = val.replace(/[^A-Za-z0-9_]/g, '');
            setPrefix(sanitizedVal);
          }}
          disabled={isLoading}
        />
        <span className="text-[11px] text-slate-400 italic">
          Alphanumeric and underscores only. Max 20 chars.
        </span>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Sequence Input
        </label>
        <textarea
          className="h-32 w-full rounded border border-slate-300 p-2 font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Paste your ATCG or AUCG sequence here... (Sequence must be between 60 and 1000 bp long)"
          value={sequence}
          onChange={(e) => {
            setSequence(e.target.value);
            clearError();
          }}
          //         disabled={!engineReady || isLoading}
          disabled={isLoading}
        />
      </div>

      <button
        onClick={onCalculate}
        disabled={!engineReady || !sequence.trim() || isLoading}
        className="w-full cursor-pointer rounded bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-default disabled:bg-slate-300"
      >
        {isLoading ? 'Running Engine... Please wait' : 'Calculate Primers'}
      </button>
    </div>
  );
}
