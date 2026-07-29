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
from primerize.primerize_1d import (  # type: ignore - Package is located in the client-side static public/ folder for Pyodide execution
    Primerize_1D,
)

def run_design(user_sequence, max_length=60, min_length=15, min_tm=60, num_primers=None, prefix="Oligo"):
    """Executes the Stanford Primerize engine efficiently with extended biochemical arguments."""
    try:
        max_len_int = int(max_length)
        min_len_int = int(min_length)
        min_tm_float = float(min_tm)

        # Jeśli JavaScript przekazał null, NUM_PRIMERS w silniku musi dostać None dla automatycznego wyliczenia
        num_primers_val = int(num_primers) if num_primers is not None else None

        p = Primerize_1D()

        # Wywołujemy oficjalną metodę design() silnika Stanford / RiboKit z kompletem parametrów
        res = p.design(
            str(user_sequence).strip().upper(),
            prefix=prefix,
            NUM_PRIMERS=num_primers_val,
            MAX_LENGTH=max_len_int,
            MIN_LENGTH=min_len_int,
            MIN_TM=min_tm_float
        )

        # Skracamy linie separatorów do 48 znaków, aby idealnie pasowały do szerokości okna i nie łamały się
        sep = "=" * 69
        sub_sep = "-" * 69

        output = []
        output.append(sep)

        # POPRAWKA 1: Przeniesienie długości do linii nagłówka sekwencji wejściowej
        clean_seq_str = str(user_sequence).strip().upper()
        output.append(f"Input Sequence ({len(clean_seq_str)} bp):")
        output.append(clean_seq_str)

        # ROZBUDOWANA LINIA METADANYCH: Wyświetla jednocześnie wszystkie ograniczenia długości oraz temperaturę topnienia Tm
        #
        output.append(f"Min Tm: {min_tm_float}°C | Max Limit: {max_len_int} bp | Min Limit: {min_len_int} bp")

        # POPRAWKA 2: Dodanie linii wskazującej zdefiniowane ustawienie dla Number of Primers
        # Jeśli użytkownik pozostawił boks pusty, num_primers_val to None, czyli wyświetlamy "Auto"
        primers_setting_text = "Auto" if num_primers_val is None else str(num_primers_val)
        output.append(f"Number of Primers Constraint: {primers_setting_text}")

        primers_list = getattr(res, "primer_set", [])
        output.append(f"Number of Primers Designed: {len(primers_list)}")

        # Minimalistyczne przejście od razu do listy wygenerowanych starterów
        output.append(sub_sep)

        total_primers = len(primers_list)
        half = total_primers // 2

        for i, primer in enumerate(primers_list):
            direction = "F" if i < half else "R"

            # Konstruujemy identyfikator identycznie jak w oryginalnym narzędziu Stanforda
            p_id = f"{prefix}_{i+1}{direction}"
            p_seq = str(primer).strip().upper()

            # Nowy, czytelny układ: Nazwa i długość w nagłówku, czysta sekwencja w linii poniżej
            output.append(f"{p_id} ({len(p_seq)} bp)")
            output.append(p_seq)

            if i < total_primers - 1:
                output.append("") # Subtelna czysta linia odstępu między starterami
        clean_warnings = ""

        try:
            warnings_text = res.echo("WARNING")
            warnings_text = str(warnings_text).strip()

            if warnings_text and warnings_text != "None":
                import re
                ansi_escape = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])|\[\d+m")
                clean_warnings = ansi_escape.sub("", warnings_text).strip()

                output.append(sub_sep)
                output.append(clean_warnings)
        except Exception as e:  # noqa: BLE001 - Exception is intentionally logged to console to prevent Pyodide from crashing on unhandled layout edge-cases
            print(f"Primerize layout engine captured an internal exception: {e}")


        output.append(sep)

        return {
            "terminal": "\n".join(output),
            "warning": clean_warnings if ('clean_warnings' in locals() and clean_warnings) else ""
        }

    except Exception as _inner_err:  # noqa: BLE001 - Catching general exception is required to safely forward unexpected core layout errors to the React state
        return {
            "terminal": f"Python Core Exception:\n{traceback.format_exc()}",
            "warning": ""
        }
