//real-time validation functions (on-change - upper limit restriction)

export const cleanTmChange = (valStr: string): string | null => {
  if (valStr === '') return '';
  if (Number(valStr) > 80) return null;
  return valStr;
};

export const cleanMaxChange = (valStr: string): string | null => {
  if (valStr === '') return '';
  if (Number(valStr) > 120) return null;
  return valStr;
};

export const cleanMinChange = (valStr: string): string | null => {
  if (valStr === '') return '';
  if (Number(valStr) > 60) return null;
  return valStr;
};

export const cleanNumPrimersChange = (valStr: string): string | null => {
  if (valStr === '') return '';
  if (Number(valStr) > 50) return null;
  return valStr;
};

// Field exit correction functions (on-blur - automatic fallback values)

export const cleanTmBlur = (value: number | string): number => {
  if (value === '') return 60;
  const val = Number(value);
  if (val < 50) return 50;
  return val;
};

export const cleanMaxBlur = (value: number | string): number => {
  if (value === '') return 60;
  const val = Number(value);
  if (val < 15) return 15;
  return val;
};

export const cleanMinBlur = (value: number | string): number => {
  if (value === '') return 15;
  const val = Number(value);
  if (val < 10) return 10;
  return val;
};

export const cleanNumPrimersBlur = (
  value: number | string,
): number | string => {
  if (value === '') return ''; // Blank is allowed (Auto)
  const val = Number(value);
  if (val < 2) return 2;
  return value;
};

// returns true if all advanced parameters match their default values
export const isDefaultSettings = (
  minTm: number | string,
  maxLength: number | string,
  minLength: number | string,
  numPrimers: number | string,
): boolean => {
  return (
    Number(minTm) === 60 &&
    Number(maxLength) === 60 &&
    Number(minLength) === 15 &&
    numPrimers === ''
  );
};
