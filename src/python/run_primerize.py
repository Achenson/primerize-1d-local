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
        # Podkładamy pustą klasę, aby wywołanie Primerize_2D() w __init__.py nie wyrzuciło błędu
        class DummyClass:
            def __init__(self, *args, **kwargs): pass

        # Mapujemy nazwy klas tak, jak nazywają się w plikach oryginalnych
        class_name = "Primerize_2D" if "2d" in fake_mod else ("Primerize_3D" if "3d" in fake_mod else "Primerize_Custom")
        setattr(dummy, class_name, DummyClass)
        sys.modules[fake_mod] = dummy
# =========================================================================

# Teraz bezpiecznie i super szybko importujemy czysty moduł 1D
from primerize.primerize_1d import Primerize_1D


def run_design(user_sequence, max_length=60):
    """Executes the Stanford Primerize engine efficiently by skipping 2D/3D compilation."""
    try:

        max_len_int = int(max_length)

        # Silnik 1D pod matryce IVT RNA ruszy teraz z maksymalną prędkością
        p = Primerize_1D()
        res = p.design(user_sequence, prefix="primer", NUM_PRIMERS=None, MAX_LENGTH=max_len_int)

        output = []
        output.append("=========================================================================")
        output.append("          STANFORD PRIMERIZE 1D OUTPUT TERMINAL (WASM ENGINE)            ")
        output.append("=========================================================================")
        output.append(f"Input Sequence Length: {len(user_sequence)} bases")
        output.append(f"Max Oligo Length Limit: {max_len_int} bases")

        primers_list = getattr(res, "primer_set", [])
        output.append(f"Number of Primers Designed: {len(primers_list)}")
        output.append("-------------------------------------------------------------------------")
        output.append(f"{'Oligo Name':<15} | {'Sequence (5` to 3`)':<42} | {'Length':<6}")
        output.append("-------------------------------------------------------------------------")

        # Określamy punkt podziału: Stanford dzieli listę dokładnie na pół (pierwsza połowa to F, druga to R)
        total_primers = len(primers_list)
        half = total_primers // 2

        for i, primer in enumerate(primers_list):
            # Dynamiczne przypisywanie kierunku F lub R na podstawie indeksu z oryginalnej listy
            direction = "F" if i < half else "R"
            p_id = f"{i+1}{direction}"

            p_seq = str(primer).strip().upper()
            output.append(f"{p_id:<15} | {p_seq:<42} | {len(p_seq):<6}")

        try:
            warnings_text = res.echo("WARNING")
            warnings_text = str(warnings_text).strip()

            if warnings_text and warnings_text != "None":
                import re
                ansi_escape = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])|\[\d+m")
                clean_warnings = ansi_escape.sub("", warnings_text)

                output.append("\n-------------------------------------------------------------------------")
                output.append("WARNINGS & MISPRIMING ALERTS:")
                output.append(clean_warnings)
        except Exception:
            pass

        output.append("=========================================================================")
        return "\n".join(output)

    except Exception as inner_err:
        return f"Python Core Exception:\n{traceback.format_exc()}"
