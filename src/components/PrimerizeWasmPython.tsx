// src/components/PrimerizeWasmPython.tsx
import React, { useState } from 'react';
import { executePrimerizeDesign } from '../utils/executePrimerizeDesign';
// Import the custom initialization hook
import { usePrimerizeEngine } from '../hooks/usePrimerizeEngine';

// Import UI sub-components
import Settings from './Settings';
import SequenceInput from './SequenceInput';
import Notifications from './Notifications';
import Results from './Results';

export default function PrimerizeWasmPython() {
    const [sequence, setSequence] = useState<string>('');
    const [prefix, setPrefix] = useState<string>(''); // NEW CONSTRUCT NAME STATE
    const [results, setResults] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string>('');
    const [engineWarning, setEngineWarning] = useState<string>(''); // NEW BIOLOGICAL WARNING STATE
    const [maxLength, setMaxLength] = useState<number | string>(60);
    const [minLength, setMinLength] = useState<number | string>(15); // NEW STATE (Defaults to 15 bp)
    const [minTm, setMinTm] = useState<number | string>(60);
    const [numPrimers, setNumPrimers] = useState<number | string>('');

    // 1. ADD T7 CHECKBOX STATE (Defaults to true matching Stanford's default settings)
    const [checkT7, setCheckT7] = useState<boolean>(true);

    // CONSUME THE CUSTOM HOOK
    const { status, pyodideInstance, isLoadingEngine } = usePrimerizeEngine();
    const isReady = status === 'Ready';

    const handleDesign = async () => {
        setValidationError('');
        setEngineWarning(''); // Clear any previous biochemical warnings
        setResults('');
        setIsLoading(true);

        try {
            const { scriptOutput, operationalMaxLength, operationalMinLength, engineWarning: capturedWarning, updatedSequence } = await executePrimerizeDesign({
                sequence,
                maxLength,
                minLength,
                minTm,        // Przekazanie Tm
                numPrimers,   // Przekazanie liczby starterów
                prefix,
                pyodideInstance,
                checkT7
            });

            // Sync any metadata fallback modifications returned back up from the runtime module:
            if (minLength !== operationalMinLength) {
                setMinLength(operationalMinLength);
            }

            // 3. OPTIONAL VISUAL FEEDBACK: Update the textarea to reflect the prepended sequence
            if (sequence.trim().toUpperCase() !== updatedSequence) {
                setSequence(updatedSequence);
            }

            setResults(scriptOutput);

            // If the python core generated biological alerts, store them in the warning state
            if (capturedWarning) {
                setEngineWarning(capturedWarning);
            }

            if (maxLength !== operationalMaxLength) {
                setMaxLength(operationalMaxLength);
            }
        } catch (error: any) {
            // This catches fatal blockages (e.g. invalid letters, 0 primers built)
            setValidationError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDesignClick = () => {
        // 1. Natychmiast czyścimy stare błędy i włączamy tryb ładowania
        setValidationError('');
        setEngineWarning('');
        setResults('');
        setIsLoading(true);

        // 2. Dajemy Reactowi i przeglądarce 50ms na zaktualizowanie wyglądu przycisku
        setTimeout(async () => {
            try {
                // Wywołujemy Twoją oryginalną logikę obliczeniową
                await handleDesign();
            } catch (error: any) {
                // Na wypadek gdyby handleDesign sam nie złapał błędu
                setValidationError(error.message);
                setIsLoading(false);
            }
            // UWAGA: setIsLoading(false) jest już wywoływane wewnątrz
            // bloku finally Twojej oryginalnej funkcji handleDesign,
            // więc nie musimy go tu dublować, jeśli wszystko pójdzie dobrze.
        }, 50);
    };

    return (
        <div className="w-full max-w-xl min-w-0 mx-auto p-6 bg-white shadow-md rounded-lg mt-10 flex flex-col gap-4">
        <header className="border-b pb-2">
        <h1 className="text-xl font-bold text-slate-800">Primerize 1D (Local - Python WASM)</h1>
        <div className="text-xs mt-1">
        <span className="font-semibold text-slate-600">Engine Status: </span>
        <span className={isReady ? 'text-emerald-600 font-bold' : 'text-amber-600 animate-pulse'}>
        {status}
        </span>
        </div>
        </header>

        <Settings
            {...{
                maxLength, setMaxLength, minLength, setMinLength, minTm, setMinTm,
                numPrimers, setNumPrimers, checkT7, setCheckT7, isLoading
            }}
            engineReady={isReady}
        />


        <SequenceInput
            {...{ sequence, setSequence, prefix, setPrefix, isLoading }}
            onCalculate={handleDesignClick}
            engineReady={isReady}
            clearError={() => {
                setValidationError('');
                setEngineWarning('');
            }}
        />

        {/* NOTIFICATION LAYER: Critical validation blocker (Red) */}
        <Notifications message={validationError} variant="error" />

        {/* NOTIFICATION LAYER: Biological/Thermodynamic warnings (Yellow/Orange) */}
        <Notifications message={engineWarning} variant="warning" />

        <Results results={results} prefix={prefix} isLoading={isLoading} />

        <footer className="mt-4 pt-4 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed select-none">
        Powered by the Primerize 1D Engine (Developed by Das Lab, Stanford University) via WebAssembly.
        </p>
        </footer>
        </div>
    );
}
