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

    // HANDLER FOR GENERATING AND DOWNLOADING THE TXT FILE
    const handleDownloadTxt = () => {
        if (!results) return;

        // Create a file blob with the plain text terminal content
        const blob = new Blob([results], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // Determine the file name dynamically based on the construct name prefix
        const filePrefix = prefix.trim() === '' ? 'Oligo' : prefix.trim();
        const fileName = `${filePrefix}_primerize_report.txt`;

        // Create a temporary hidden anchor element to trigger the browser download anchor sweep
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        // Append, trigger click, and cleanly purge from DOM
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="w-full max-w-xl min-w-0 mx-auto p-6 bg-white shadow-md rounded-lg mt-10 flex flex-col gap-4">
        <header className="border-b pb-2">
        <h1 className="text-xl font-bold text-slate-800">Primerize (Python WASM)</h1>
        <div className="text-xs mt-1">
        <span className="font-semibold text-slate-600">Engine Status: </span>
        <span className={isReady ? 'text-emerald-600 font-bold' : 'text-amber-600 animate-pulse'}>
        {status}
        </span>
        </div>
        </header>

        <Settings
        maxLength={maxLength}
        setMaxLength={setMaxLength}
        minLength={minLength}
        setMinLength={setMinLength}
        minTm={minTm}
        setMinTm={setMinTm}
        numPrimers={numPrimers}
        setNumPrimers={setNumPrimers}
        checkT7={checkT7}
        setCheckT7={setCheckT7}
        engineReady={isReady}
        isLoading={isLoading}
        />

        <SequenceInput
        sequence={sequence}
        setSequence={setSequence}
        prefix={prefix}
        setPrefix={setPrefix}
        onCalculate={handleDesign}
        engineReady={isReady}
        isLoading={isLoading}
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
