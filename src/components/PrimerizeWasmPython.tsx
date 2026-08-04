import { useState } from 'react';

import { usePrimerizeEngine } from '../hooks/usePrimerizeEngine';
import { executePrimerizeDesign } from '../utils/executePrimerizeDesign';

import Notifications from './Notifications';
import Results from './Results';
import SequenceInput from './SequenceInput';
import Settings from './Settings';

export default function PrimerizeWasmPython() {
  const [sequence, setSequence] = useState<string>('');
  // construct's name
  const [prefix, setPrefix] = useState<string>('');
  const [results, setResults] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [engineWarning, setEngineWarning] = useState<string>('');

  const [minTm, setMinTm] = useState<number | string>(60);
  const [maxLength, setMaxLength] = useState<number | string>(60);
  const [minLength, setMinLength] = useState<number | string>(15);
  const [numPrimers, setNumPrimers] = useState<number | string>('');
  const [checkT7, setCheckT7] = useState<boolean>(true);

  const { status, pyodideInstance } = usePrimerizeEngine();
  const isReady = status === 'Ready';

  const handleDesign = async () => {
    setValidationError('');
    setEngineWarning('');
    setResults('');
    setIsLoading(true);

    try {
      const {
        scriptOutput,
        engineWarning: capturedWarning,
        updatedSequence,
      } = await executePrimerizeDesign({
        sequence,
        maxLength,
        minLength,
        minTm,
        numPrimers,
        prefix,
        pyodideInstance,
        checkT7,
      });

      // Update the textarea to reflect the prepended sequence and U to T conversion
      if (sequence.trim().toUpperCase() !== updatedSequence) {
        setSequence(updatedSequence);
      }

      setResults(scriptOutput);

      // python core generated biological alerts
      if (capturedWarning) {
        setEngineWarning(capturedWarning);
      }
    } catch (error: any) {
      // This catches fatal blockages (e.g. invalid letters, 0 primers built)
      setValidationError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // setTimout before handleDesign to properly display info to the user that the engine is running
  const handleDesignClick = () => {
    setValidationError('');
    setEngineWarning('');
    setResults('');
    setIsLoading(true);

    // 50ms for actualization of button appearance
    setTimeout(async () => {
      try {
        await handleDesign();
      } catch (error: any) {
        // in case handleDesign wouldn't catch an error
        setValidationError(error.message);
        setIsLoading(false);
      }
      // setIsLoading(false) will be executed in handleDesign
    }, 50);
  };

  return (
    <div className="mx-auto mt-10 flex w-full max-w-xl min-w-0 flex-col gap-4 rounded-lg bg-white p-6 shadow-md">
      <header className="border-b pb-2">
        <h1 className="text-xl font-bold text-slate-800">
          Primerize 1D (Local - Python WASM)
        </h1>
        <div className="mt-1 text-xs">
          <span className="font-semibold text-slate-600">Engine Status: </span>
          <span
            className={
              isReady
                ? 'font-bold text-emerald-600'
                : 'animate-pulse text-amber-600'
            }
          >
            {status}
          </span>
        </div>
      </header>

      <Settings
        {...{
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

      <footer className="mt-4 border-t border-slate-100 pt-4 text-center">
        <p className="text-[11px] leading-relaxed font-medium text-slate-400 select-none">
          Powered by the Primerize 1D Engine (Developed by Das Lab, Stanford
          University) via WebAssembly.
        </p>
      </footer>
    </div>
  );
}
