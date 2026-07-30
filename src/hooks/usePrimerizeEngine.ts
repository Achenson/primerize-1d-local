import { useState, useEffect } from 'react';
// @ts-ignore - Vite uses the '?raw' suffix to import the Python script as a plain text string, which TS doesn't natively recognize as a module.
import primerizeRunnerScript from '../python/run_primerize.py?raw';

export interface UsePrimerizeEngineResult {
  status: string;
  pyodideInstance: any;
}

export function usePrimerizeEngine(): UsePrimerizeEngineResult {
  const [status, setStatus] = useState<string>(
    'Booting WebAssembly Python engine...',
  );
  const [pyodideInstance, setPyodideInstance] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initPythonWasm() {
      try {
        if (!(window as Window & { loadPyodide?: unknown }).loadPyodide) {
          setStatus('Loading Pyodide script library into page thread...');
          const script = document.createElement('script');
          script.src = 'https://jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
          script.async = true;

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () =>
              reject(new Error('Failed to download CDN script asset'));
            document.head.appendChild(script);
          });
        }

        if (!isMounted) return;

        setStatus('Initializing Pyodide virtual instance runtime...');
        // Type set to 'any' because loadPyodide is attached
        // globally to the window object by an external CDN script at runtime.
        const pyodide = await (window as any).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/',
        });

        if (!isMounted) return;

        setStatus('Loading required scientific packages...');
        await pyodide.loadPackage(['micropip', 'numpy']);

        if (!isMounted) return;

        // XLWT without dependencies (DEPS=FALSE)
        setStatus('Installing file export extensions...');
        await pyodide.runPythonAsync(`
                import micropip
                await micropip.install('xlwt', deps=False)
                `);

        if (!isMounted) return;

        setStatus('Creating virtual filesystem for Stanford Primerize...');
        try {
          pyodide.FS.mkdir('primerize');
        } catch (e) {}

        const primerizeFiles = [
          '__init__.py',
          'misprime.py',
          'primerize_1d.py',
          'primerize_2d.py',
          'primerize_3d.py',
          'primerize_custom.py',
          'thermo.py',
          'util.py',
          'util_class.py',
          'util_func.py',
          'util_server.py',
          'wrapper.py',
        ];

        for (const file of primerizeFiles) {
          if (!isMounted) return;
          setStatus(`Loading ${file} into WASM filesystem...`);
          const response = await fetch(`/primerize/${file}`);
          if (!response.ok)
            throw new Error(`Failed to download public asset: ${file}`);
          const fileContent = await response.text();
          pyodide.FS.writeFile(`primerize/${file}`, fileContent);
        }

        if (!isMounted) return;

        setStatus('Loading Stanford Primerize core algorithms...');

        // synchronous .runPython() for a clean separation from the JS scanner.
        pyodide.runPython(`
                import sys
                from types import ModuleType

                # Smart mock capable of providing a version string or returning an empty function
                class DummyMock(ModuleType):
                    def __getattr__(self, name):
                    # If the Stanford core code requests the Matplotlib version, return a valid version string
                        if name == "__version__":
                            return "3.0.0"

                        # For all other property or method calls, return a safe, empty fallback function
                        def dummy_func(*args, **kwargs):
                            return None
                        return dummy_func

                    # Block heavy rendering engines and graphing libraries (Matplotlib, Pillow, Fonttools)
                for heavy_mod in ["matplotlib", "matplotlib.pyplot", "Pillow", "PIL", "kiwisolver", "cycler", "fonttools"]:
                    if heavy_mod not in sys.modules:
                        sys.modules[heavy_mod] = DummyMock(heavy_mod)

                if "." not in sys.path:
                    sys.path.append(".")
                `);
        // Writes the Python orchestration script into Pyodide's virtual file system so it can be imported.
        pyodide.FS.writeFile('run_primerize.py', primerizeRunnerScript);

        if (!isMounted) return;

        setPyodideInstance(pyodide);
        setStatus('Ready');
      } catch (err: any) {
        console.error('WebAssembly Core Engine Initialization Fault:', err);
        if (isMounted) {
          setStatus(
            `Failed to launch Python WebAssembly: ${err.message || 'Unknown allocation failure'}`,
          );
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
    pyodideInstance
  };
}
