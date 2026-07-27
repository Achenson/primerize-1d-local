// src/utils/executePrimerizeDesign.ts

interface DesignParams {
    sequence: string;
    maxLength: number | string;
    minLength: number | string;
    minTm: number | string;
    numPrimers: number | string;
    prefix: string;
    pyodideInstance: any;
    checkT7: boolean;
}

interface DesignResult {
    scriptOutput: string;
    operationalMaxLength: number;
    operationalMinLength: number;
    engineWarning: string;
    updatedSequence: string;
}

export async function executePrimerizeDesign({
    sequence,
    maxLength,
    minLength,
    minTm,
    numPrimers,
    prefix,
    pyodideInstance,
    checkT7
}: DesignParams): Promise<DesignResult> {
    let cleanSeq = sequence.trim().toUpperCase();

    if (!cleanSeq) {
        throw new Error('Sequence input cannot be empty.');
    }
    if (!pyodideInstance) {
        throw new Error('Python WebAssembly engine is not initialized.');
    }

    // 1. AUTOMATYZACJA FRONTENDU: Doklejanie promotora T7 jeśli zaznaczone i brakuje go na start
    const T7_PROMOTER = "TTCTAATACGACTCACTATA";
    if (checkT7 && !cleanSeq.startsWith(T7_PROMOTER)) {
        cleanSeq = T7_PROMOTER + cleanSeq;
    }

    // FRONTENDOWA REPLIKACJA SPRAWDZANIA PROMOTORA T7 (ZASADY STANFORDA)
    let t7GWarning = "";
    if (cleanSeq.startsWith(T7_PROMOTER)) {
        const initiationBases = cleanSeq.substring(T7_PROMOTER.length, T7_PROMOTER.length + 3);
        let gCount = 0;
        for (let i = 0; i < initiationBases.length; i++) {
            if (initiationBases[i] === 'G') {
                gCount++;
            } else {
                break;
            }
        }
        if (gCount === 0) {
            t7GWarning = "Sequence does not start with G after T7 promoter. In vitro transcription may fail.";
        } else if (gCount === 1) {
            t7GWarning = "Sequence starts with only one G after T7 promoter. Transcription may be suboptimal.";
        }
    }

    // 2. RESTRYKCYJNA WALIDACJA NUKLEOTYDÓW
    const strictPureRegex = /^[ACGTU]+$/;
    if (!strictPureRegex.test(cleanSeq)) {
        throw new Error('Invalid sequence format. Internal spaces, numbers, or special characters are not allowed. Use only A, C, G, T, or U.');
    }

    // 3. WALIDACJA DŁUGOŚCI SEKWENCJI WEJŚCIOWEJ
    const seqLength = cleanSeq.length;
    if (seqLength < 60) {
        throw new Error(`Sequence too short (${seqLength} bp). Minimum length required is 60 bp.`);
    }
    if (seqLength > 1000) {
        throw new Error(`Sequence too long (${seqLength} bp). Maximum allowed size is 1000 bp.`);
    }

    // 4. SANITYZACJA PARAMETRÓW BIOINFORMATYCZNYCH PRZED PRZEKAZANIEM DO PYTHONA
    const operationalMaxLength = maxLength === '' ? 60 : Math.min(120, Math.max(15, Number(maxLength)));
    const operationalMinLength = minLength === '' ? 15 : Math.min(60, Math.max(10, Number(minLength)));
    const operationalMinTm = minTm === '' ? 60 : Math.min(80, Math.max(50, Number(minTm)));
    const operationalNumPrimers = numPrimers === '' ? null : Math.min(50, Math.max(2, Number(numPrimers)));

    const activePrefix = prefix.trim() === '' ? 'Oligo' : prefix.trim();

    // 5. REJESTRACJA PARAMETRÓW W GLOBALNYM ŚRODOWISKU WASM (BEZPIECZEŃSTWO EVENT LOOP)
    pyodideInstance.globals.set("user_sequence", cleanSeq);
    pyodideInstance.globals.set("js_max_length", operationalMaxLength);
    pyodideInstance.globals.set("js_min_length", operationalMinLength);
    pyodideInstance.globals.set("js_min_tm", operationalMinTm);
    pyodideInstance.globals.set("js_num_primers", operationalNumPrimers);
    pyodideInstance.globals.set("js_prefix", activePrefix);

    // 6. URUCHOMIENIE SILNIKA PYTHON
    const pyProxyResult = pyodideInstance.runPython(`
    import run_primerize
    import importlib

    importlib.reload(run_primerize)

    # Wywołujemy funkcję orkiestracji przekazując bezpieczne odwołania do zmiennych globalnych
    run_primerize.run_design(
        user_sequence,
        max_length=js_max_length,
        min_length=js_min_length,
        min_tm=js_min_tm,
        num_primers=js_num_primers,
        prefix=js_prefix
    )
    `);

    const resultObj = pyProxyResult.toJs({ dict_convert: Object.fromEntries });
    pyProxyResult.destroy();

    const scriptOutput = resultObj.terminal;
    let engineWarning = resultObj.warning || "";

    // 7. ŁĄCZENIE OSTRZEŻEŃ FRONTENDOWYCH (T7) ORAZ TERMODYNAMICZNYCH Z SILNIKA
    if (t7GWarning) {
        engineWarning = engineWarning
        ? `${t7GWarning}\n\n${engineWarning}`
        : t7GWarning;
    }

    if (scriptOutput.includes('Number of Primers Designed: 0')) {
        throw new Error('No valid assembly found. The engine cannot satisfy the current thermodynamic constraints. Please adjust your design parameters.');
    }

    return {
        scriptOutput,
        operationalMaxLength,
        operationalMinLength,
        engineWarning,
        updatedSequence: cleanSeq
    };
}
