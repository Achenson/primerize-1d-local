import React from 'react';

interface SequenceInputProps {
    sequence: string;
    setSequence: (value: string) => void;
    onCalculate: () => void;
    engineReady: boolean;
    isLoading: boolean;
    clearError: () => void;
}

export default function SequenceInput({ sequence, setSequence, onCalculate, engineReady, isLoading, clearError }: SequenceInputProps) {
    return (
        <div className="flex flex-col gap-4">
        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Sequence Input</label>
        <textarea
        className="w-full p-2 border border-slate-300 rounded font-mono text-sm h-32 focus:ring-1 focus:ring-blue-500 outline-none"
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
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:bg-slate-300"
        >
        {isLoading ? 'Running Optimization Engine...' : 'Calculate Primers'}
        </button>
        </div>
    );
}
