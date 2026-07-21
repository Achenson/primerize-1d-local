// src/components/Results.tsx
import React from 'react';
import { downloadReportTxt } from '../utils/downloadReport';

interface ResultsProps {
    results: string;
    prefix: string;
    isLoading?: boolean;
}

export default function Results({ results, prefix, isLoading = false }: ResultsProps) {
    if (!results) return null;

    return (
        <div className="flex flex-col gap-2 mt-2 w-full max-w-full">
        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
        Results Output
        </label>

        {/*
            - whitespace-pre-wrap: Gwarantuje, że okno nie spuchnie.
            - break-words: Zapewnia estetyczne zawijanie długich ciągów.
            - Brak suwaków na dole strony – wszystko mieści się w pionie.
            */}
            <div data-testid="primerize-terminal" className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded min-h-[150px] max-h-90 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed border border-slate-950 shadow-inner">
            {results}
            </div>
            </div>

            {!isLoading && (
                <div className="flex justify-end mt-1">
                <button
                onClick={() => downloadReportTxt({ results, prefix })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-900 text-white text-xs font-semibold rounded shadow-sm transition-colors border border-slate-600 duration-150 disabled:cursor-default cursor-pointer"
                >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Report (.txt)
                </button>
                </div>
            )}
            </div>
    );
}
