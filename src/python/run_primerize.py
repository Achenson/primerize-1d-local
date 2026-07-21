# src/python/run_primerize.py
import sys
import traceback
from types import ModuleType

# =========================================================================
# BLOK BLOKOWANIA MODUŁÓW 2D/3D (PRZYSPIESZENIE STRONY)
# Tworzymy puste moduły-widma w pamięci Pythona. Dzięki temu plik __init__.py
# Stanforda nie uruchomi procesów kompilacji dla wersji 2D, 3D i Custom!
# =========================================================================
for fake_mod in ["primerize.primerize_2d", "primerize.primerize_3d", "primerize.primerize_custom"]:
    if fake_mod not in sys.modules:
        dummy = ModuleType(fake_mod)
        class DummyClass:
            def __init__(self, *args, **kwargs): pass
        class_name = "Primerize_2D" if "2d" in fake_mod else ("Primerize_3D" if "3d" in fake_mod else "Primerize_Custom")
        setattr(dummy, class_name, DummyClass)
        sys.modules[fake_mod] = dummy
# =========================================================================

# Bezpieczny i zoptymalizowany import oryginalnego silnika 1D
from primerize.primerize_1d import Primerize_1D


def run_design(user_sequence, max_length=60, prefix="Oligo"):
    """Executes the Stanford Primerize engine efficiently and formats layout arrays dynamically."""
    try:
        max_len_int = int(max_length)
        user_sequence_clean = str(user_sequence).strip().upper()

        p = Primerize_1D()
        res = p.design(user_sequence_clean, prefix=prefix, NUM_PRIMERS=None, MAX_LENGTH=max_len_int)

        # Skracamy linie separatorów do 48 znaków, aby idealnie pasowały do szerokości okna
        sep = "=" * 48
        sub_sep = "-" * 48

        output = []
        output.append(sep)
        output.append("       STANFORD PRIMERIZE 1D TERMINAL REPORT")
        output.append(sep)

        output.append("Input Sequence:")
        output.append(user_sequence_clean)
        output.append(f"Length: {len(user_sequence_clean)} bases | Max Limit: {max_len_int} bases")

        primers_list = getattr(res, "primer_set", [])
        output.append(f"Number of Primers Designed: {len(primers_list)}")

        # POPRAWKA 2: Tylko jedna linia przerywana pod statystyką, bez dodatkowego nagłówka tekstowego
        output.append(sub_sep)

        total_primers = len(primers_list)
        half = total_primers // 2

        for i, primer in enumerate(primers_list):
            direction = "F" if i < half else "R"
            p_id = f"{prefix}_{i+1}{direction}"
            p_seq = str(primer).strip().upper()

            # POPRAWKA 1: Nazwa starteru bez nawiasów kwadratowych (np. Oligo_1F (60 bp))
            output.append(f"{p_id} ({len(p_seq)} bp)")
            output.append(p_seq)

            if i < total_primers - 1:
                output.append("") # Mały odstęp zamiast brzydkich kresek

        try:
            warnings_text = res.echo("WARNING")
            warnings_text = str(warnings_text).strip()

            if warnings_text and warnings_text != "None":
                import re
                ansi_escape = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])|\[\d+m")
                clean_warnings = ansi_escape.sub("", warnings_text).strip()

                output.append("\n" + sub_sep)
                output.append("WARNINGS & MISPRIMING ALERTS:")
                output.append(clean_warnings)
        except Exception:
            pass

        output.append(sep)

        return {
            "terminal": "\n".join(output),
            "warning": clean_warnings if ('clean_warnings' in locals() and clean_warnings) else ""
        }

    except Exception as inner_err:
        return {
            "terminal": f"Python Core Exception:\n{traceback.format_exc()}",
            "warning": ""
        }
