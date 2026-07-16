import React, { useState, useEffect } from 'react';
import primerizeRunnerScript from '../python/run_primerize.py?raw';
import { executePrimerizeDesign } from '../utils/executePrimerizeDesign';

// Import newly separated UI sub-components
import Settings from './Settings';
import SequenceInput from './SequenceInput';
import Notifications from './Notifications';
import Results from './Results';

declare global {
    interface Window {
        loadPyodide: any;
    }
}

export default function PrimerizeWasmPython() {
    const [sequence, setSequence] = useState<string>('');
    const [results, setResults] = useState<string>('');
    const [status, setStatus] = useState<string>('Booting WebAssembly Python engine...');
    const [pyodideInstance, setPyodideInstance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string>('');
    const [maxLength, setMaxLength] = useState<number | string>(60);

    const isReady = status === 'Ready';

    useEffect(() => {
        async function initPythonWasm() {
            try {
                if (!window.loadPyodide) {
                    setStatus('Loading Pyodide script library into page thread...');
                    const script = document.createElement('script');
                    script.src = 'https://jsdelivr.net';
                    script.async = true;

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = () => reject(new Error('Failed to download CDN script asset'));
                        document.head.appendChild(script);
                    });
                }

                setStatus('Booting WebAssembly Python engine...');
                const pyodide = await window.loadPyodide();

                setStatus('Loading core scientific math packages & package manager...');
                await pyodide.loadPackage(["numpy", "matplotlib", "micropip"]);

                setStatus('Installing missing Excel dependency (xlwt)...');
                await pyodide.runPythonAsync(`
                import micropip
                await micropip.install('xlwt')
                `);

                setStatus('Creating virtual filesystem for Stanford Primerize...');
                try { pyodide.FS.mkdir('primerize'); } catch (e) {}

                const primerizeFiles = [
                    '__init__.py', 'misprime.py', 'primerize_1d.py', 'primerize_2d.py',
                    'primerize_3d.py', 'primerize_custom.py', 'thermo.py', 'util.py',
                    'util_class.py', 'util_func.py', 'util_server.py', 'wrapper.py'
                ];

                for (const file of primerizeFiles) {
                    setStatus(`Loading ${file} into WASM filesystem...`);
                    const response = await fetch(`/primerize/${file}`);
                    if (!response.ok) throw new Error(`Failed to download public asset: ${file}`);
                    const fileContent = await response.text();
                    pyodide.FS.writeFile(`primerize/${file}`, fileContent);
                }

                setStatus('Loading Stanford Primerize core algorithms...');
                await pyodide.runPythonAsync(`
                import sys
                if "." not in sys.path:
                    sys.path.append(".")
                    `);

                setStatus('Saving runner script to virtual disk...');
                pyodide.FS.writeFile('run_primerize.py', primerizeRunnerScript);

                setPyodideInstance(pyodide);
                setStatus('Ready');
            } catch (err: any) {
                console.error(err);
                setStatus(`Failed to launch Python WebAssembly: ${err.message}`);
            }
        }

        initPythonWasm();
    }, []);

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
        isLoading={isLoading}
        clearError={() => setValidationError('')}
        />

        <Notifications error={validationError} />

        <Results results={results} />
        </div>
    );
}
