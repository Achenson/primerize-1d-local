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

    useEffect(() => {
        async function initPythonWasm() {
            try {
                // 1. Jeśli skryptu nie ma jeszcze w oknie, wstrzykujemy go dynamicznie z CDN
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

                setStatus('Loading core scientific math packages...');
                // Pobieramy pakiety matematyczne i wykresów zoptymalizowane pod WASM prosto z Pyodide
                await pyodide.loadPackage(["numpy", "matplotlib", "micropip"]);

                setStatus('Installing missing Excel dependency (xlwt)...');
                // Uruchamiamy micropip w Pythonie, aby pobrać i zainstalować pakiet xlwt bezpośrednio w WASM
                await pyodide.runPythonAsync(`
                import micropip
                await micropip.install('xlwt')
                `);


                setStatus('Creating wirtual filesystem for Stanford Primerize...');
                // Tworzymy folder pakietu w wirtualnym środowisku Pythona
                try {
                    pyodide.FS.mkdir('/primerize');
                } catch (e) {
                    // Ignoruj błąd, jeśli folder już istnieje
                }

                // Pełna lista plików odczytana z Twojego drzewa katalogów
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
                    'wrapper.py'
                ];

                // 2. Pobieramy wszystkie pliki z public/primerize i zapisujemy je w systemie plików WASM
                for (const file of primerizeFiles) {
                    setStatus(`Loading ${file} into WASM filesystem...`);
                    const response = await fetch(`/primerize/${file}`);
                    if (!response.ok) {
                        throw new Error(`Nie udało się pobrać pliku z folderu public: /primerize/${file}`);
                    }
                    const fileContent = await response.text();
                    pyodide.FS.writeFile(`/primerize/${file}`, fileContent);
                }

                setStatus('Loading Stanford Primerize core algorithms...');
                // Dodajemy katalog główny do sys.path, aby Python traktował folder /primerize jako moduł
                setStatus('Configuring Python paths...');
                await pyodide.runPythonAsync(`
                import sys
                if '/' not in sys.path:
                    sys.path.append('/')
                    print("Python search paths:", sys.path)
                    `);
//                 await pyodide.runPythonAsync(`
//                 import sys
//                 if "." not in sys.path:
//                     sys.path.append(".")
//                     `);

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

            // Wszystkie linie kodu Pythona muszą dotykać lewej krawędzi (brak spacji na początku)
            const scriptOutput = await pyodideInstance.runPythonAsync(`
import traceback
from primerize.primerize_1d import Primerize_1D

try:
    p = Primerize_1D()

    # Wywołujemy silnik projektowy, usuwając limit 0 starterów
    res = p.design(user_sequence, prefix="primer", NUM_PRIMERS=None)

    output = []
    output.append("=========================================================================")
    output.append("          STANFORD PRIMERIZE 1D OUTPUT TERMINAL (WASM ENGINE)            ")
    output.append("=========================================================================")
    output.append(f"Input Sequence Length: {len(user_sequence)} bases")

    # Bezpieczne pobranie listy primerów ze struktury Stanforda
    primers_list = getattr(res, 'primer_set', [])
    output.append(f"Number of Primers Designed: {len(primers_list)}")
    output.append("-------------------------------------------------------------------------")
    output.append(f"{'Oligo Name':<15} | {'Sequence (5\\' to 3\\')':<40} | {'Length':<6}")
    output.append("-------------------------------------------------------------------------")

    for primer in primers_list:
        p_name = getattr(primer, 'name', 'unknown')
        p_seq = getattr(primer, 'seq', '')

        if not p_seq and hasattr(primer, '__str__'):
            p_seq = str(primer)

        output.append(f"{p_name:<15} | {p_seq:<40} | {len(p_seq):<6}")

    warnings = getattr(res, 'warnings', [])
    if warnings:
        output.append("\\n-------------------------------------------------------------------------")
        output.append("WARNINGS:")
        for warn in warnings:
            output.append(f"- {warn}")

    output.append("=========================================================================")
    result_text = "\\n".join(output)

except Exception as inner_err:
    result_text = f"Python Core Exception:\\n{traceback.format_exc()}"

result_text
`);

                        setResults(scriptOutput);
        } catch (error: any) {
            console.error(error);
            setResults(`JavaScript/WASM Bridge Error:\\n${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


/*
    const handleDesign = async () => {
        if (!sequence.trim() || !pyodideInstance) return;
        setIsLoading(true);
        setResults('');

        try {
            pyodideInstance.globals.set("user_sequence", sequence.trim());

            const scriptOutput = await pyodideInstance.runPythonAsync(`
                import traceback
                from primerize.primerize_1d import Primerize_1D

                try:
                    p = Primerize_1D()

                    # Wywołujemy silnik projektowy, usuwając limit 0 starterów
                    res = p.design(user_sequence, prefix="primer", NUM_PRIMERS=None)

                    output = []
                    output.append("=========================================================================")
                    output.append("          STANFORD PRIMERIZE 1D OUTPUT TERMINAL (WASM ENGINE)            ")
                    output.append("=========================================================================")
                    output.append(f"Input Sequence Length: {len(user_sequence)} bases")

                # Bezpieczne pobranie listy primerów ze struktury Stanforda
                primers_list = getattr(res, 'primer_set', [])
                output.append(f"Number of Primers Designed: {len(primers_list)}")
                output.append("-------------------------------------------------------------------------")
                output.append(f"{'Oligo Name':<15} | {'Sequence (5\\' to 3\\')':<40} | {'Length':<6}")
                output.append("-------------------------------------------------------------------------")

                for primer in primers_list:
                    # Wyciągamy dane tekstowe, sprawdzając obecność atrybutów lub rzutując na tekst
                    p_name = getattr(primer, 'name', 'unknown')
                    p_seq = getattr(primer, 'seq', '')

                    # Jeśli obiekt to string lub reprezentacja niestandardowa
                    if not p_seq and hasattr(primer, '__str__'):
                        p_seq = str(primer)

                    output.append(f"{p_name:<15} | {p_seq:<40} | {len(p_seq):<6}")

                # Pobranie ewentualnych ostrzeżeń bioinformatycznych
                warnings = getattr(res, 'warnings', [])
                if warnings:
                    output.append("\\n-------------------------------------------------------------------------")
                    output.append("WARNINGS:")
                    for warn in warnings:
                        output.append(f"- {warn}")

                output.append("=========================================================================")
                result_text = "\\n".join(output)

            except Exception as inner_err:
                # Jeśli cokolwiek wywali się wewnątrz skryptu Pythona,
                # przechwytujemy pełny traceback błędu i przekazujemy go do Reacta
                result_text = f"Python Core Exception:\\n{traceback.format_exc()}"

                result_text
                            `);

            setResults(scriptOutput);
        } catch (error: any) {
            console.error(error);
            setResults(`JavaScript/WASM Bridge Error:\\n${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };*/

//     const handleDesign = async () => {
//         if (!sequence.trim() || !pyodideInstance) return;
//         setIsLoading(true);
//         setResults('');
//
//         try {
//             pyodideInstance.globals.set("user_sequence", sequence.trim());
//
//             const scriptOutput = await pyodideInstance.runPythonAsync(`
//             from primerize.primerize_1d import Primerize_1D
//
//             p = Primerize_1D()
//
//             # Wywołujemy silnik projektowy, usuwając limit 0 starterów
//             res = p.design(user_sequence, prefix="primer", NUM_PRIMERS=None)
//
//             output = []
//             output.append("=========================================================================")
//             output.append("          STANFORD PRIMERIZE 1D OUTPUT TERMINAL (WASM ENGINE)            ")
//             output.append("=========================================================================")
//             output.append(f"Input Sequence Length: {len(user_sequence)} bases")
//
//             # POPRAWKA: Sprawdzamy atrybut primer_set podpowiedziany przez silnik WASM
//             primers_list = getattr(res, 'primer_set', [])
//             output.append(f"Number of Primers Designed: {len(primers_list)}")
//             output.append("-------------------------------------------------------------------------")
//             output.append(f"{'Oligo Name':<15} | {'Sequence (5\\' to 3\\')':<40} | {'Length':<6}")
//             output.append("-------------------------------------------------------------------------")
//
//             # Iterujemy po strukturach obiektów ze zbioru primer_set
//             for primer in primers_list:
//                 # Sprawdzamy czy to obiekt posiadający atrybuty .name i .seq
//                 if hasattr(primer, 'name') and hasattr(primer, 'seq'):
//                     output.append(f"{primer.name:<15} | {primer.seq:<40} | {len(primer.seq):<6}")
//                 # Sprawdzamy czy to słownik
//                 elif isinstance(primer, dict):
//                     output.append(f"{primer.get('name', ''):<15} | {primer.get('seq', ''):<40} | {len(primer.get('seq', '')):<6}")
//                 # Jeśli to obiekt typu tuple (np. [nazwa, sekwencja]) lub inny format tekstowy
//                 else:
//                     output.append(f"{str(primer)}")
//
//                 if getattr(res, 'warnings', None):
//                     output.append("\\n-------------------------------------------------------------------------")
//                     output.append("WARNINGS:")
//                     for warn in res.warnings:
//                         output.append(f"- {warn}")
//
//                 output.append("=========================================================================")
//
//                 "\\n".join(output)
//             `);
//
//                             setResults(scriptOutput);
//         } catch (error: any) {
//             console.error(error);
//             setResults(`Python Execution Error:\n${error.message}`);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleDesign = async () => {
//         if (!sequence.trim() || !pyodideInstance) return;
//         setIsLoading(true);
//         setResults('');
//
//         try {
//             pyodideInstance.globals.set("user_sequence", sequence.trim());
//
//             const scriptOutput = await pyodideInstance.runPythonAsync(`
//             from primerize.primerize_1d import Primerize_1D
//
//             p = Primerize_1D()
//
//             # 1. Wywołujemy design, jawnie przekazując NUM_PRIMERS=None,
//             # co pozwala algorytmowi automatycznie wyliczyć liczbę oligo.
//             res = p.design(user_sequence, prefix="primer", NUM_PRIMERS=None)
//
//             # 2. Obiekt 'res' (Design_Single) zawiera pola: .primers, .warnings, .assembly
//             # Budujemy ładny raport tekstowy z wygenerowanych starterów
//             output = []
//             output.append("=========================================================================")
//             output.append("          STANFORD PRIMERIZE 1D OUTPUT TERMINAL (WASM ENGINE)            ")
//             output.append("=========================================================================")
//             output.append(f"Input Sequence Length: {len(user_sequence)} bases")
//             output.append(f"Number of Primers Designed: {len(res.primers)}")
//             output.append("-------------------------------------------------------------------------")
//             output.append(f"{'Oligo Name':<15} | {'Sequence (5\\' to 3\\')':<40} | {'Length':<6}")
//             output.append("-------------------------------------------------------------------------")
//
//             # Iterujemy po wygenerowanych przez algorytm starterach
//             # Zakładamy, że res.primers to lista obiektów lub słowników z polami 'name' i 'seq'
//             # Jeśli res.primers to zwykła lista struktur, dostosuj poniższy zapis:
//             for primer in res.primers:
//                 # Jeśli primer jest obiektem posiadającym atrybuty name i seq:
//                 if hasattr(primer, 'name') and hasattr(primer, 'seq'):
//                     output.append(f"{primer.name:<15} | {primer.seq:<40} | {len(primer.seq):<6}")
//                     # Jeśli primer jest słownikiem:
//                 elif isinstance(primer, dict):
//                     output.append(f"{primer.get('name', ''):<15} | {primer.get('seq', ''):<40} | {len(primer.get('seq', '')):<6}")
//                 # Jeśli primer to krotka/lista (np. [nazwa, sekwencja]):
//                 else:
//                     output.append(f"{str(primer)}")
//
//             if res.warnings:
//                 output.append("\\n-------------------------------------------------------------------------")
//                 output.append("WARNINGS:")
//                 for warn in res.warnings:
//                     output.append(f"- {warn}")
//
//             output.append("=========================================================================")
//
//             "\\n".join(output)
//         `);
//
//                             setResults(scriptOutput);
//         } catch (error: any) {
//             console.error(error);
//             setResults(`Python Execution Error:\n${error.message}`);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleDesign = async () => {
//         if (!sequence.trim() || !pyodideInstance) return;
//         setIsLoading(true);
//         setResults('');
//
//         try {
//             // Przekazujemy sekwencję wpisaną przez użytkownika do zmiennej globalnej Pythona
//             pyodideInstance.globals.set("user_sequence", sequence.trim());
//
//             // 3. Wywołujemy prawdziwą logikę Stanford Primerize z wklejonych plików
//             const scriptOutput = await pyodideInstance.runPythonAsync(`
//             from primerize.primerize_1d import Primerize_1D
//
//             p = Primerize_1D()
//
//             # ROZWIĄZANIE: Definiujemy poprawne parametry wejściowe
//             # Zmieniamy NUM_PRIMERS na None (lub usunięciem wymuszenia 0), aby algorytm sam dobrał liczbę oligo
//             # Możesz też przekazać parametry jawnie w słowniku, jeśli metoda design przyjmuje kwargs
//
//             p.design(user_sequence, prefix="primer")
//
//             # W zależności od wersji Primerize, jeśli p.design() resetuje parametry,
//             # możemy je nadpisać bezpośrednio na obiekcie przed generowaniem raportu:
//             if hasattr(p, 'num_primers') and p.num_primers == 0:
//                 p.num_primers = None  # Pozwala algorytmowi automatycznie wyliczyć liczbę starterów
//
//                 # Uruchomienie właściwego procesu zapisu/generowania struktur tekstowych, jeśli str(p) nie wyzwala automatycznego designu
//             if hasattr(p, 'get_oligos'):
//                 p.get_oligos() # Niektóre wersje wymagają jawnego wywołania przed str(p)
//
//             str(p)
//         `);
//
//             setResults(scriptOutput);
//         } catch (error: any) {
//             console.error(error);
//             setResults(`Python Execution Error:\n${error.message}`);
//         } finally {
//             setIsLoading(false);
//         }
//     };

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
