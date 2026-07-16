// src/utils/primerizeUtil.ts

interface DesignParams {
    sequence: string;
    maxLength: number | string;
    pyodideInstance: any;
}

interface DesignResult {
    scriptOutput: string;
    operationalMaxLength: number;
}

export async function executePrimerizeDesign({ sequence, maxLength, pyodideInstance }: DesignParams): Promise<DesignResult> {
    const cleanSeq = sequence.trim();

    if (!cleanSeq) {
        throw new Error('Sequence input cannot be empty.');
    }
    if (!pyodideInstance) {
        throw new Error('Python WebAssembly engine is not initialized.');
    }

    // 1. RESTRYKCYJNA WALIDACJA ZNAKÓW
    const upperSeq = cleanSeq.toUpperCase();
    const strictPureRegex = /^[ACGTU]+$/;

    if (!strictPureRegex.test(upperSeq)) {
        throw new Error('Invalid sequence format. Internal spaces, numbers, or special characters are not allowed. Use only A, C, G, T, or U.');
    }

    // 2. WALIDACJA DŁUGOŚCI SEKWENCJI
    const seqLength = cleanSeq.length;
    if (seqLength < 60) {
        throw new Error(`Sequence too short (${seqLength} bp). Minimum length required is 60 bp.`);
    }
    if (seqLength > 1000) {
        throw new Error(`Sequence too long (${seqLength} bp). Maximum allowed size is 1000 bp.`);
    }

    // 3. SANITYZACJA PARAMETRU PRZED PRZEKAZANIEM DO SILNIKA
    const operationalMaxLength = maxLength === '' ? 60 : Math.min(120, Math.max(15, Number(maxLength)));

    // 4. WYWOŁANIE MOSTEK PYTHON / WEBASSEMBLY
    pyodideInstance.globals.set("user_sequence", cleanSeq);

    const scriptOutput = await pyodideInstance.runPythonAsync(`
    import run_primerize
    import importlib

    importlib.reload(run_primerize)

    run_primerize.run_design(user_sequence, ${operationalMaxLength})
    `);

    // Zwracamy spakowany wynik oraz ostateczną długość
    return { scriptOutput, operationalMaxLength };
}
