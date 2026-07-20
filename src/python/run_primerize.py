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


def run_design(user_sequence, max_length=60, prefix="primer"):
    """Executes the Stanford Primerize engine efficiently and formats layout arrays dynamically."""
    try:
        max_len_int = int(max_length)

        # Inicjalizacja silnika i kalkulacja z dynamicznym przedrostkiem
        p = Primerize_1D()
        res = p.design(user_sequence, prefix=prefix, NUM_PRIMERS=None, MAX_LENGTH=max_len_int)

        output = []
        output.append("=========================================================================")
        output.append("          STANFORD PRIMERIZE 1D OUTPUT TERMINAL (WASM ENGINE)            ")
        output.append("=========================================================================")
        output.append(f"Input Sequence Length: {len(user_sequence)} bases")
        output.append(f"Max Oligo Length Limit: {max_len_int} bases")

        primers_list = getattr(res, "primer_set", [])
        output.append(f"Number of Primers Designed: {len(primers_list)}")
        output.append("-------------------------------------------------------------------------")
        # POPRAWKA ESTETYCZNA: Zwiększono szerokość kolumny z 15 na 25 znaków pod dłuższe przedrostki
        output.append(f"{'Oligo Name':<25} | {'Sequence (5` to 3`)':<42} | {'Length':<6}")
        output.append("-------------------------------------------------------------------------")

        # Stanford dzieli listę dokładnie na pół (pierwsza połowa to zawsze Forward, druga to Reverse)
        total_primers = len(primers_list)
        half = total_primers // 2

        for i, primer in enumerate(primers_list):
            direction = "F" if i < half else "R"

            # POPRAWKA NAZEWNICTWA: Dynamicznie łączymy przekazany prefix z indeksem i kierunkiem niczym w IDT
            p_id = f"{prefix}_{i+1}{direction}"
            p_seq = str(primer).strip().upper()

            # Wypisujemy wiersz z zachowaniem szerokości 25 znaków dla unikania przesunięć tabeli
            output.append(f"{p_id:<25} | {p_seq:<42} | {len(p_seq):<6}")



         # NOWA LOGIKA: Wyciągamy ostrzeżenia do osobnej zmiennej, nie łączymy ich z terminalem
        captured_warning = ""
        try:
            warnings_text = res.echo("WARNING")
            warnings_text = str(warnings_text).strip()

            if warnings_text and warnings_text != "None":
                import re
                ansi_escape = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])|\[\d+m")
                captured_warning = ansi_escape.sub("", warnings_text).strip()
        except Exception:
            pass

        output.append("=========================================================================")

        # ZWRACAMY SŁOWNIK zamiast czystego stringa
        return {
            "terminal": "\n".join(output),
            "warning": captured_warning
        }

    except Exception as inner_err:
        # W przypadku błędu krytycznego zachowujemy strukturę słownika
        return {
            "terminal": f"Python Core Exception:\n{traceback.format_exc()}",
            "warning": ""
        }
