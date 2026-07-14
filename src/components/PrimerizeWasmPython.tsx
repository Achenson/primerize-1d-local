import React, { useState, useEffect } from 'react';
// 1. Import the python code directly as a raw string!
import primerizeRunnerScript from '../python/run_primerize.py?raw'

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
    useEffect(() => {
        async function initPythonWasm() {
            try {
                // 1. Jeśli skryptu Pyodide nie ma jeszcze w oknie, wstrzykujemy go dynamicznie z CDN
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
                // Ładujemy podstawowe środowiska oraz micropip
                await pyodide.loadPackage(["numpy", "matplotlib", "micropip"]);

                setStatus('Installing missing Excel dependency (xlwt)...');
                // Dynamiczna instalacja brakującej biblioteki xlwt z repozytorium PyPI
                await pyodide.runPythonAsync(`
                import micropip
                await micropip.install('xlwt')
                `);

                setStatus('Creating virtual filesystem for Stanford Primerize...');
                try {
                    pyodide.FS.mkdir('primerize');
                } catch (e) {
                    // Ignoruj błąd, jeśli folder już istnieje
                }

                // Pełna lista plików z Twojego folderu public/primerize
                const primerizeFiles = [
                    '__init__.py', 'misprime.py', 'primerize_1d.py', 'primerize_2d.py',
                    'primerize_3d.py', 'primerize_custom.py', 'thermo.py', 'util.py',
                    'util_class.py', 'util_func.py', 'util_server.py', 'wrapper.py'
                ];

                // Pobieramy wszystkie pliki ze Stanforda z katalogu publicznego
                for (const file of primerizeFiles) {
                    setStatus(`Loading ${file} into WASM filesystem...`);
                    const response = await fetch(`/primerize/${file}`);
                    if (!response.ok) {
                        throw new Error(`Nie udało się pobrać pliku z folderu public: /primerize/${file}`);
                    }
                    const fileContent = await response.text();
                    pyodide.FS.writeFile(`primerize/${file}`, fileContent);
                }

                setStatus('Loading Stanford Primerize core algorithms...');
                // Dodajemy katalog bieżący do ścieżki, aby pakiet był widoczny dla importów
                await pyodide.runPythonAsync(`
                import sys
                if "." not in sys.path:
                    sys.path.append(".")
                    `);

                // =========================================================================
                // ZAPIS TWÓJEGO PLIKU: Zapisujemy zawartość run_primerize.py na wirtualny dysk
                // =========================================================================
                setStatus('Saving runner script to virtual disk...');
                pyodide.FS.writeFile('run_primerize.py', primerizeRunnerScript);
                // =========================================================================

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
        if (!sequence.trim() || !pyodideInstance) return;
        setIsLoading(true);
        setResults('');

        try {
            pyodideInstance.globals.set("user_sequence", sequence.trim());

            // Wywołujemy skrypt jako moduł zaimportowany bezpośrednio z dysku wirtualnego WASM
            const scriptOutput = await pyodideInstance.runPythonAsync(`
            import run_primerize
            import importlib

            # Przeładowujemy moduł, aby wspierać Hot-Reload w React podczas edycji pliku .py w edytorze
            importlib.reload(run_primerize)

            # Uruchomienie metody z pliku źródłowego
            run_primerize.run_design(user_sequence)
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

        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Sequence Input</label>
        <textarea
        className="w-full p-2 border border-slate-300 rounded font-mono text-sm h-32 focus:ring-1 focus:ring-blue-500 outline-none"
        placeholder="Paste ATCG sequence here..."
        value={sequence}
        onChange={(e) => setSequence(e.target.value)}
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

        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Results Output</label>
        <pre className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded min-h-[150px] max-h-80 overflow-y-auto whitespace-pre-wrap">
        {results ? results : <span className="text-slate-500 italic">No output yet. Enter sequence and run.</span>}
        </pre>
        </div>
        </div>
    );
}
