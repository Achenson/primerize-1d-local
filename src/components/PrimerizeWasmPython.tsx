import React, { useState, useEffect } from 'react';
import primerizeRunnerScript from '../python/run_primerize.py?raw';

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
    const [maxLength, setMaxLength] = useState<number>(60);

    // NEW STATE: Captures local client-side validation errors
    const [validationError, setValidationError] = useState<string>('');

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
        // .trim() automatically removes all spaces/newlines from the beginning and the end
        const cleanSeq = sequence.trim();
        if (!cleanSeq || !pyodideInstance) return;

        setValidationError('');
        setResults('');

        // 1. STRICT NUCLEOTIDE VALIDATION
        // Since leading/trailing spaces are already trimmed, the sequence
        // must consist strictly of A, C, G, T, or U from start to finish.
        const upperSeq = cleanSeq.toUpperCase();
        const strictPureRegex = /^[ACGTU]+$/;

        if (!strictPureRegex.test(upperSeq)) {
            setValidationError('Invalid sequence format. Internal spaces, numbers, or special characters are not allowed. Use only A, C, G, T, or U.');
            return;
        }

        // 2. LENGTH VALIDATION
        // Since there are no internal spaces, cleanSeq.length represents the exact bp count
        const seqLength = cleanSeq.length;
        if (seqLength < 60) {
            setValidationError(`Sequence too short (${seqLength} bp). Minimum length required is 60 bp.`);
            return;
        }
        if (seqLength > 1000) {
            setValidationError(`Sequence too long (${seqLength} bp). Maximum allowed size is 1000 bp.`);
            return;
        }

        setIsLoading(true);

        try {
            pyodideInstance.globals.set("user_sequence", cleanSeq);

            const scriptOutput = await pyodideInstance.runPythonAsync(`
            import run_primerize
            import importlib

            importlib.reload(run_primerize)

            run_primerize.run_design(user_sequence, ${maxLength})
            `);

            setResults(scriptOutput);
        } catch (error: any) {
            console.error(error);
            setResults(`JavaScript/WASM Bridge Error:\n${error.message}`);
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
        <span className={status === 'Ready' ? 'text-emerald-600 font-bold' : 'text-amber-600 animate-pulse'}>
        {status}
        </span>
        </div>
        </header>

        <div className="flex flex-col gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded">
        <label className="block text-sm font-semibold text-slate-700">
        Maximum Oligo Length (bp)
        </label>
        <div className="flex items-center gap-2">
        <input
        type="number"
        className="w-24 p-2 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
        value={maxLength}
        onChange={(e) => setMaxLength(Math.max(15, Number(e.target.value)))}
        min={15}
        max={120}
        disabled={status !== 'Ready' || isLoading}
        />
        <span className="text-xs text-slate-500 italic">
        Allowed range: 15 to 120 bp.
        </span>
        </div>
        </div>

        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Sequence Input</label>
        <textarea
        className="w-full p-2 border border-slate-300 rounded font-mono text-sm h-32 focus:ring-1 focus:ring-blue-500 outline-none"
        // UPDATED: Dynamic context placeholder informing users about constraints
        placeholder="Paste your ATCG or AUCG sequence here... (Sequence must be between 60 and 1000 bp long)"
        value={sequence}
        onChange={(e) => {
            setSequence(e.target.value);
            if (validationError) setValidationError(''); // Clear warning on type
        }}
        disabled={status !== 'Ready' || isLoading}
        />
        </div>

        <button
        onClick={handleDesign}
        disabled={status !== 'Ready' || !sequence.trim() || isLoading}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:bg-slate-300"
        >
        {isLoading ? 'Running Optimization Engine...' : 'Calculate Primers'}
        </button>

        {/* NEW: Displays interactive frontend range errors nicely styled */}
        {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded">
            ⚠️ {validationError}
            </div>
        )}

        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Results Output</label>
        <pre className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded min-h-[150px] max-h-80 overflow-y-auto whitespace-pre-wrap">
        {results ? results : <span className="text-slate-500 italic">No output yet. Enter sequence and run.</span>}
        </pre>
        </div>
        </div>
    );
}
