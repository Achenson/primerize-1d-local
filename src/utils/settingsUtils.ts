// src/utils/settingsUtils.ts

// =========================================================================
// FUNKCJE WALIDACJI W LOCIE (ON-CHANGE - BLOKADA GÓRNEJ GRANICY)
// =========================================================================

export const cleanTmChange = (valStr: string): string | null => {
    if (valStr === '') return '';
    if (Number(valStr) > 80) return null; // Ignorujemy zmianę jeśli powyżej 80°C
    return valStr;
};

export const cleanMaxChange = (valStr: string): string | null => {
    if (valStr === '') return '';
    if (Number(valStr) > 120) return null; // Ignorujemy zmianę jeśli powyżej 120 bp
    return valStr;
};

export const cleanMinChange = (valStr: string): string | null => {
    if (valStr === '') return '';
    if (Number(valStr) > 60) return null; // Ignorujemy zmianę jeśli powyżej 60 bp
    return valStr;
};

export const cleanNumPrimersChange = (valStr: string): string | null => {
    if (valStr === '') return '';
    if (Number(valStr) > 50) return null; // Ignorujemy zmianę jeśli powyżej 50 starterów
    return valStr;
};

// =========================================================================
// FUNKCJE KOREKTY PO OPUSZCZENIU POLA (ON-BLUR - AUTOMATYCZNE UZUPEŁNIANIE)
// =========================================================================

export const cleanTmBlur = (value: number | string): number => {
    if (value === '') return 60; // Domyślna Stanford
    const val = Number(value);
    if (val < 50) return 50;     // Minimalna granica
    return val;
};

export const cleanMaxBlur = (value: number | string): number => {
    if (value === '') return 60; // Domyślna Stanford
    const val = Number(value);
    if (val < 15) return 15;     // Minimalna granica
    return val;
};

export const cleanMinBlur = (value: number | string): number => {
    if (value === '') return 15; // Domyślna Stanford
    const val = Number(value);
    if (val < 10) return 10;     // Minimalna granica
    return val;
};

export const cleanNumPrimersBlur = (value: number | string): number | string => {
    if (value === '') return ''; // Pozwalamy na puste (Auto)
    const val = Number(value);
    if (val < 2) return 2;       // Minimalna granica
    return value;
};
