// src/components/Results.tsx
import React from 'react';
import { downloadReportTxt } from '../utils/downloadReport';

interface ResultsProps {
  results: string;
  prefix: string;
  isLoading?: boolean;
}

export default function Results({
  results,
  prefix,
  isLoading = false,
}: ResultsProps) {
  if (!results) return null;

  return (
    <div className="mt-2 flex w-full max-w-full flex-col gap-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Results Output
        </label>

        {/*
            - whitespace-pre-wrap: Gwarantuje, że okno nie spuchnie.
            - break-words: Zapewnia estetyczne zawijanie długich ciągów.
            - Brak suwaków na dole strony – wszystko mieści się w pionie.
            */}
        <div
          data-testid="primerize-terminal"
          className="max-h-90 min-h-[150px] w-full overflow-y-auto rounded border border-slate-950 bg-slate-900 p-3 font-mono text-xs leading-relaxed wrap-break-word whitespace-pre-wrap text-emerald-400 shadow-inner"
        >
          {results}
        </div>
      </div>

      {!isLoading && (
        <div className="mt-1 flex justify-end">
          <button
            onClick={() => downloadReportTxt({ results, prefix })}
            className="inline-flex cursor-pointer items-center gap-2 rounded border border-slate-600 bg-slate-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-slate-900 disabled:cursor-default"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Report (.txt)
          </button>
        </div>
      )}
    </div>
  );
}
