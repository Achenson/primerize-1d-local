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
    const [results, setResults] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string>('');
    const [maxLength, setMaxLength] = useState<number | string>(60);

    // CONSUME THE CUSTOM HOOK
    const { status, pyodideInstance, isLoadingEngine } = usePrimerizeEngine();
    const isReady = status === 'Ready';

    const handleDesign = async () => {
        setValidationError('');
        setResults('');
        setIsLoading(true);

        try {
            const { scriptOutput, operationalMaxLength } = await executePrimerizeDesign({
                sequence,
                maxLength,
                pyodideInstance
            });

            setResults(scriptOutput);

            if (maxLength !== operationalMaxLength) {
                setMaxLength(operationalMaxLength);
            }
        } catch (error: any) {
            setValidationError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10 flex flex-col gap-4">
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
        engineReady={isReady}
        isLoading={isLoading}
        />

        <SequenceInput
        sequence={sequence}
        setSequence={setSequence}
        onCalculate={handleDesign}
        engineReady={isReady}
//         isLoading={isLoading || isLoadingEngine}
        isLoading={isLoading}
        clearError={() => setValidationError('')}
        />

        <Notifications error={validationError} />

        <Results results={results} />
        </div>
    );
}
