// /src/hooks/usePrimerizeEngine.ts
import { useState, useEffect } from 'react';
// @ts-ignore - Vite uses the '?raw' suffix to import the Python script as a plain text string, which TS doesn't natively recognize as a module.
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
        let isMounted = true;

        async function initPythonWasm() {
            try {
                // 1. WCZYTANIE BIBLIOTEKI GLÓWNEGO PYODIDE Z CDN (WERSJA 0.26.1)
                if (!(window as Window & { loadPyodide?: unknown }).loadPyodide)  {
                    setStatus('Loading Pyodide script library into page thread...');
                    const script = document.createElement('script');
                    script.src = 'https://jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
                    script.async = true;

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = () => reject(new Error('Failed to download CDN script asset'));
                        document.head.appendChild(script);
                    });
                }

                if (!isMounted) return;

                // 2. INICJALIZACJA INSTANCJI Z PRECYZYJNYM INDEXURL (WERSJA 0.26.1)
              setStatus('Initializing Pyodide virtual instance runtime...');
               // Type set to 'any' because loadPyodide is attached
               // globally to the window object by an external CDN script at runtime.
                const pyodide = await (window as any).loadPyodide({indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/'});

                if (!isMounted) return;

                // 3. ŁADOWANIE KRYTYCZNYCH PAKIETÓW MATEMATYCZNYCH (NUMPY + MICROPIP)
                // Numpy waży niewiele i jest niezbędny do obliczeń macierzy delH/delS.
                setStatus('Loading required scientific packages...');
                await pyodide.loadPackage(['micropip', 'numpy']);

                if (!isMounted) return;

                // 4. INSTALACJA PAKIETU XLWT BEZ DODATKOWYCH ZALEZNOSCI (DEPS=FALSE)
                setStatus('Installing file export extensions...');
                await pyodide.runPythonAsync(`
                import micropip
                await micropip.install('xlwt', deps=False)
                `);

                if (!isMounted) return;

                // 5. TWORZENIE WIRTUALNEGO SYSTEMU PLIKÓW DLA SILNIKA STANFORDA
                setStatus('Creating virtual filesystem for Stanford Primerize...');
                try {
                    pyodide.FS.mkdir('primerize');
                } catch (e) {}

                const primerizeFiles = [
                    '__init__.py', 'misprime.py', 'primerize_1d.py', 'primerize_2d.py',
                    'primerize_3d.py', 'primerize_custom.py', 'thermo.py', 'util.py',
                    'util_class.py', 'util_func.py', 'util_server.py', 'wrapper.py'
                ];

                for (const file of primerizeFiles) {
                    if (!isMounted) return;
                    setStatus(`Loading ${file} into WASM filesystem...`);
                    const response = await fetch(`/primerize/${file}`);
                    if (!response.ok) throw new Error(`Failed to download public asset: ${file}`);
                    const fileContent = await response.text();
                    pyodide.FS.writeFile(`primerize/${file}`, fileContent);
                }

                if (!isMounted) return;

                // 6. BLOKADA WYŁĄCZNIE CIĘŻKICH BIBLIOTEK GRAFICZNYCH (MATPLOTLIB I PILLOW)
                setStatus('Loading Stanford Primerize core algorithms...');

                // Wywołujemy synchroniczne .runPython() dla idealnego odcięcia skanera JS
                // /src/hooks/usePrimerizeEngine.ts

                // ZNAJDŹ SEKCJĘ 6 I PODMIEŃ W NIEJ CAŁY KOD WEWNĄTRZ pyodide.runPython NA TEN:
                pyodide.runPython(`
                import sys
                from types import ModuleType

                # Inteligentna atrapa, która potrafi podać wersję tekstową lub zwrócić pustą funkcję
                class DummyMock(ModuleType):
                    def __getattr__(self, name):
                    # Jeśli kod Stanforda pyta o wersję Matplotlib, podajemy poprawny ciąg tekstowy
                        if name == "__version__":
                            return "3.0.0"

                        # Dla wszystkich innych wywołań zwracamy bezpieczną, pustą funkcję
                        def dummy_func(*args, **kwargs):
                            return None
                        return dummy_func

                    # Blokujemy ciężki silnik rysowania wykresów (Matplotlib, Pillow, Fonttools)
                for heavy_mod in ["matplotlib", "matplotlib.pyplot", "Pillow", "PIL", "kiwisolver", "cycler", "fonttools"]:
                    if heavy_mod not in sys.modules:
                        sys.modules[heavy_mod] = DummyMock(heavy_mod)

                if "." not in sys.path:
                    sys.path.append(".")
                `);


                        // 7. ZAPIS SKRYPTU ORKIESTRACJI I FINALIZACJA STARTU
                        pyodide.FS.writeFile('run_primerize.py', primerizeRunnerScript);

                    if (!isMounted) return;

                    setPyodideInstance(pyodide);
                setStatus('Ready');

            } catch (err: any) {
                console.error('WebAssembly Core Engine Initialization Fault:', err);
                if (isMounted) {
                    setStatus(`Failed to launch Python WebAssembly: ${err.message || 'Unknown allocation failure'}`);
                }
            }
        }

        initPythonWasm();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        status,
        pyodideInstance,
        isLoadingEngine: status !== 'Ready'
    };
}
