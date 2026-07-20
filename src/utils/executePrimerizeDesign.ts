// src/utils/executePrimerizeDesign.ts

interface DesignParams {
    sequence: string;
    maxLength: number | string;
    prefix: string;
    pyodideInstance: any;
}

interface DesignResult {
    scriptOutput: string;
    operationalMaxLength: number;
    engineWarning: string; // NOWE POLE NA OSTRZEŻENIE Z SILNIKA
}

export async function executePrimerizeDesign({ sequence, maxLength, prefix, pyodideInstance }: DesignParams): Promise<DesignResult> {
    const cleanSeq = sequence.trim();

    if (!cleanSeq) {
        throw new Error('Sequence input cannot be empty.');
    }
    if (!pyodideInstance) {
        throw new Error('Python WebAssembly engine is not initialized.');
    }

    // 1. STRICT NUCLEOTIDE VALIDATION
    const upperSeq = cleanSeq.toUpperCase();
    const strictPureRegex = /^[ACGTU]+$/;
    if (!strictPureRegex.test(upperSeq)) {
        throw new Error('Invalid sequence format. Internal spaces, numbers, or special characters are not allowed. Use only A, C, G, T, or U.');
    }

    // 2. LENGTH VALIDATION
    const seqLength = cleanSeq.length;
    if (seqLength < 60) {
        throw new Error(`Sequence too short (${seqLength} bp). Minimum length required is 60 bp.`);
    }
    if (seqLength > 1000) {
        throw new Error(`Sequence too long (${seqLength} bp). Maximum allowed size is 1000 bp.`);
    }

    // 3. SANITYZACJA PARAMETRU PRZED PRZEKAZANIEM DO SILNIKA
    const operationalMaxLength = maxLength === '' ? 60 : Math.min(120, Math.max(15, Number(maxLength)));

    // 4. SANITIZE CONSTRUCT PREFIX (Stanford Rules)
    const activePrefix = prefix.trim() === '' ? 'primer' : prefix.trim();

    // 5. WYWOŁANIE MOSTEK PYTHON / WEBASSEMBLY
    pyodideInstance.globals.set("user_sequence", cleanSeq);

    // Zmieniamy runPythonAsync, aby przypisać wynik do zmiennej w Pythonie, którą zaraz pobierzemy
    const pyProxyResult = await pyodideInstance.runPythonAsync(`
    import run_primerize
    import importlib

    importlib.reload(run_primerize)

    # Funkcja zwraca teraz słownik {'terminal': ..., 'warning': ...}
    run_primerize.run_design(user_sequence, ${operationalMaxLength}, prefix="${activePrefix}")
    `);

    // Konwertujemy obiekt PyProxy ze środowiska Pythona na czysty obiekt JavaScript
    const resultObj = pyProxyResult.toJs({ dict_convert: Object.fromEntries });
    pyProxyResult.destroy(); // Bardzo ważne: zwalniamy referencję w pamięci WASM

    const scriptOutput = resultObj.terminal;
    const engineWarning = resultObj.warning;

    if (scriptOutput.includes('Number of Primers Designed: 0')) {
        throw new Error('No valid assembly found. The engine cannot satisfy the current thermodynamic constraints. Please check and adjust your design parameters (e.g., increase oligo length or relax temperature limits).');
    }

    return {
        scriptOutput,
        operationalMaxLength,
        engineWarning // Zwracamy wyciągnięte ostrzeżenie do komponentu React
    };
}
