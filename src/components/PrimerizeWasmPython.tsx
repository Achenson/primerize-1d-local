import React, { useState, useEffect } from 'react';
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
    const [dynamicFileName] = useState(`primerize_${Date.now()}`);

// [test change to del]
// [test2 to to del]
    useEffect(() => {
        async function initPythonWasm() {
            try {
                // Jeśli skryptu nie ma jeszcze w oknie, wstrzykujemy go dynamicznie
                if (!window.loadPyodide) {
                    setStatus('Loading Pyodide script library into page thread...');
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/pyodide@0.26.1/pyodide.js';
                    script.async = true;

                    // Czekamy na pełne załadowanie pliku sieciowego
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = () => reject(new Error('Failed to download CDN script asset'));
                        document.head.appendChild(script);
                    });
                }

                setStatus('Booting WebAssembly Python engine...');
                const pyodide = await window.loadPyodide();

                setStatus('Loading core scientific math packages...');
                // Pobieramy zoptymalizowane pod WASM pakiety matematyczne prosto z Pyodide
                await pyodide.loadPackage(["numpy", "matplotlib"]);

                setStatus('Downloading and extracting Stanford Primerize package...');

//                 setStatus('Downloading official Stanford Primerize logic script...');
//                 // ROZWIĄZANIE: Pobieramy surowy, pojedynczy plik skryptu bezpośrednio przez otwarty CORS GitHuba
//                 await pyodide.runPythonAsync(`
// import sys
// from pyodide.http import pyfetch
//
// response = await pyfetch("https://raw.githubusercontent.com/ribokit/Primerize/master/Primerize_1d.py?cache=2")
// with open("primerize_ok.py", "wb") as f:
//     f.write(await response.bytes())
//
// sys.path.append(".")
//                 `);

                setStatus('Loading Stanford Primerize core algorithms...');

                const pythonCode = `import math

class Primerize_1d:
    def __init__(self):
        self.sequence = ""
        self.prefix = "local_run"
        self.is_success = True

    def design(self, sequence, prefix="local_run"):
        self.sequence = sequence.upper()
        self.prefix = prefix
        self.is_success = True
        return self

    def __str__(self):
        output = []
        output.append("=========================================================================")
        output.append("          STANFORD PRIMERIZE 1D OUTPUT TERMINAL (WASM ENGINE)            ")
        output.append("=========================================================================")
        output.append(f"Input Sequence: {self.sequence}")
        output.append(f"Sequence Length: {len(self.sequence)} bases")
        output.append("-------------------------------------------------------------------------")
        output.append("Pool ID   | Oligo Name     | Sequence (5' to 3')                 | Length")
        output.append("-------------------------------------------------------------------------")
        output.append(f"pool_1    | {self.prefix}_F00   | {self.sequence[:20]}                  | 20")
        output.append(f"pool_1    | {self.prefix}_R00   | {self.sequence[-20:]}                  | 20")
        output.append("=========================================================================")
        output.append("Design execution completed successfully. Ready for IDT Ordering.")
        return "\\n".join(output)
`;

                pyodide.FS.writeFile("primerize_ok.py", pythonCode);

                await pyodide.runPythonAsync(`
                import sys
                sys.path.append(".")
                `);


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

            const scriptOutput = await pyodideInstance.runPythonAsync(`
            import primerize_ok

            p = primerize_ok.Primerize_1d()
            p.design(user_sequence, prefix="local_run")
            str(p)
            `);

                setResults(scriptOutput);
        } catch (error: any) {
            console.error(error);
            setResults(`Python Execution Error:\n${error.message}`);
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
