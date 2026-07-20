// src/utils/executePrimerizeDesign.ts

interface DesignParams {
    sequence: string;
    maxLength: number | string;
    prefix: string;
    pyodideInstance: any;
    checkT7: boolean; // NEW INTERFACE PROPERTY
}

interface DesignResult {
    scriptOutput: string;
    operationalMaxLength: number;
    engineWarning: string;
    updatedSequence: string; // NEW PROPERTY TO RETURN MUTATED TEXT
}

export async function executePrimerizeDesign({ sequence, maxLength, prefix, pyodideInstance, checkT7 }: DesignParams): Promise<DesignResult> {
    let cleanSeq = sequence.trim().toUpperCase();

    if (!cleanSeq) {
        throw new Error('Sequence input cannot be empty.');
    }
    if (!pyodideInstance) {
        throw new Error('Python WebAssembly engine is not initialized.');
    }

    // 1. FRONTEND AUTOMATION: Prepend T7 sequence if missing and option is active
    const T7_PROMOTER = "TTCTAATACGACTCACTATA";
    if (checkT7 && !cleanSeq.startsWith(T7_PROMOTER)) {
        cleanSeq = T7_PROMOTER + cleanSeq;
    }

    // NEW FRONTEND-ONLY T7 INITIATION Gs CHECK (Stanford Rule Replication)
    let t7GWarning = "";
    if (cleanSeq.startsWith(T7_PROMOTER)) {
        // Extract the 3 bases immediately following the 20-bp T7 promoter site
        const initiationBases = cleanSeq.substring(T7_PROMOTER.length, T7_PROMOTER.length + 3);

        // Count consecutive 'G's starting right after the promoter split point
        let gCount = 0;
        for (let i = 0; i < initiationBases.length; i++) {
            if (initiationBases[i] === 'G') {
                gCount++;
            } else {
                break; // Stop counting if the consecutive G pattern breaks
            }
        }

        // Assign specific biological linting warnings matching original server feedback
        if (gCount === 0) {
            t7GWarning = "Warning: sequence does not start with G after T7 promoter. In vitro transcription may fail.";
        } else if (gCount === 1) {
            t7GWarning = "Warning: sequence starts with only one G after T7 promoter. Transcription may be suboptimal.";
        }
    }

    // 2. STRICT NUCLEOTIDE VALIDATION
    const strictPureRegex = /^[ACGTU]+$/;
    if (!strictPureRegex.test(cleanSeq)) {
        throw new Error('Invalid sequence format. Internal spaces, numbers, or special characters are not allowed. Use only A, C, G, T, or U.');
    }

    // 3. LENGTH VALIDATION
    const seqLength = cleanSeq.length;
    if (seqLength < 60) {
        throw new Error(`Sequence too short (${seqLength} bp). Minimum length required is 60 bp.`);
    }
    if (seqLength > 1000) {
        throw new Error(`Sequence too long (${seqLength} bp). Maximum allowed size is 1000 bp.`);
    }

    // 4. SANITYZACJA PARAMETRU PRZED PRZEKAZANIEM DO SILNIKA
    const operationalMaxLength = maxLength === '' ? 60 : Math.min(120, Math.max(15, Number(maxLength)));

    // 5. SANITIZE CONSTRUCT PREFIX (Stanford Rules) - Falls back to default uppercase 'Oligo'
    const activePrefix = prefix.trim() === '' ? 'Oligo' : prefix.trim();

    // 6. MOSTEK PYTHON / WEBASSEMBLY
    pyodideInstance.globals.set("user_sequence", cleanSeq);

    const pyProxyResult = await pyodideInstance.runPythonAsync(`
    import run_primerize
    import importlib

    importlib.reload(run_primerize)

    # Standard clean execution route
    run_primerize.run_design(user_sequence, ${operationalMaxLength}, prefix="${activePrefix}")
    `);

    const resultObj = pyProxyResult.toJs({ dict_convert: Object.fromEntries });
    pyProxyResult.destroy();

    const scriptOutput = resultObj.terminal;
    let engineWarning = resultObj.warning || "";

    // 7. MERGE FRONTEND ALERT AND BACKEND THERMODYNAMIC WARNINGS
    if (t7GWarning) {
        engineWarning = engineWarning
        ? `${t7GWarning}\n\n${engineWarning}`
        : t7GWarning;
    }

    if (scriptOutput.includes('Number of Primers Designed: 0')) {
        throw new Error('No valid assembly found. The engine cannot satisfy the current thermodynamic constraints. Please check and adjust your design parameters (e.g., increase oligo length or relax temperature limits).');
    }

    return {
        scriptOutput,
        operationalMaxLength,
        engineWarning,
        updatedSequence: cleanSeq // Return the sequence so the state hook updates the field
    };
}
