// src/hooks/usePrimerizeEngine.ts
import { useState, useEffect } from 'react';
import primerizeRunnerScript from '../python/run_primerize.py?raw';

export interface UsePrimerizeEngineResult {
    status: string;
    pyodideInstance: any;
    isLoadingEngine: boolean;
}

export function usePrimerizeEngine(): UsePrimerizeEngineResult {
    const [status, setStatus] = useState<string>('Booting WebAssembly Python engine...');
    const [pyodideInstance, setPyodideInstance] = useState<any>(null);

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
    }, []); // Maintained with an empty dependency array as requested

    return {
        status,
        pyodideInstance,
        isLoadingEngine: status !== 'Ready'
    };
}
