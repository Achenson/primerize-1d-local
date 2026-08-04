import sys
import traceback
from types import ModuleType

# =========================================================================
# 2d/3d module blocking block (page acceleration)
# we create empty ghost modules in python's memory. this prevents stanford's
# __init__.py from triggering compilation processes for 2d, 3d, and custom versions!
# =========================================================================
for fake_mod in [
    "primerize.primerize_2d",
    "primerize.primerize_3d",
    "primerize.primerize_custom",
]:
    if fake_mod not in sys.modules:
        dummy = ModuleType(fake_mod)

        class DummyClass:
            def __init__(self, *args, **kwargs):
                pass

        class_name = (
            "Primerize_2D"
            if "2d" in fake_mod
            else ("Primerize_3D" if "3d" in fake_mod else "Primerize_Custom")
        )
        setattr(dummy, class_name, DummyClass)
        sys.modules[fake_mod] = dummy
# =========================================================================

from primerize.primerize_1d import (  # type: ignore - Package is located in the client-side static public/ folder for Pyodide execution
    Primerize_1D,
)


def run_design(
    user_sequence,
    max_length=60,
    min_length=15,
    min_tm=60,
    num_primers=None,
    prefix="Oligo",
):
    """Executes the Stanford Primerize engine efficiently with extended biochemical arguments."""
    try:
        max_len_int = int(max_length)
        min_len_int = int(min_length)
        min_tm_float = float(min_tm)

        # if javascript passed null, NUM_PRIMERS in the engine must receive None for automatic calculation
        num_primers_val = int(num_primers) if num_primers is not None else None

        p = Primerize_1D()

        # invoke the official design() method from the stanford / ribokit engine with the full set of parameters
        res = p.design(
            str(user_sequence).strip().upper(),
            prefix=prefix,
            NUM_PRIMERS=num_primers_val,
            MAX_LENGTH=max_len_int,
            MIN_LENGTH=min_len_int,
            MIN_TM=min_tm_float,
        )

        # separator lines matching the window width

        sep = "=" * 69
        sub_sep = "-" * 69

        output = []
        output.append(sep)

        clean_seq_str = str(user_sequence).strip().upper()
        output.append(f"Input Sequence ({len(clean_seq_str)} bp):")
        output.append(clean_seq_str)

        output.append(
            f"Min Tm: {min_tm_float}°C | Max Limit: {max_len_int} bp | Min Limit: {min_len_int} bp"
        )

        # add a line indicating the specified setting for number of primers
        # if the user left the box empty, num_primers_val is none, so we display "auto"
        primers_setting_text = (
            "Auto" if num_primers_val is None else str(num_primers_val)
        )
        output.append(f"Number of Primers Constraint: {primers_setting_text}")

        primers_list = getattr(res, "primer_set", [])
        output.append(f"Number of Primers Designed: {len(primers_list)}")

        # minimalist transition straight to the generated primers list
        output.append(sub_sep)

        total_primers = len(primers_list)

        for i, primer in enumerate(primers_list):
            primer_num = i + 1
            direction = "F" if (i % 2 == 0) else "R"

            p_id = f"{prefix}_{primer_num}{direction}"
            p_seq = str(primer).strip().upper()

            output.append(f"{p_id} ({len(p_seq)} bp)")
            output.append(p_seq)

            if i < total_primers - 1:
                output.append("")
        clean_warnings = ""

        try:
            warnings_text = res.echo("WARNING")
            warnings_text = str(warnings_text).strip()

            # extract, strip ansi color codes, and format engine warnings for the ui output
            if warnings_text and warnings_text != "None":
                import re

                ansi_escape = re.compile(
                    r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])|\[\d+m"
                )
                clean_warnings = ansi_escape.sub("", warnings_text).strip()

                output.append(sub_sep)
                output.append(clean_warnings)
        except Exception as e:  # noqa: BLE001 - Exception is intentionally logged to console to prevent Pyodide from crashing on unhandled layout edge-cases
            print(f"Primerize layout engine captured an internal exception: {e}")

        output.append(sep)

        return {
            "terminal": "\n".join(output),
            "warning": clean_warnings
            if ("clean_warnings" in locals() and clean_warnings)
            else "",
        }

    except Exception as _inner_err:  # noqa: BLE001 - Catching general exception is required to safely forward unexpected core layout errors to the React state
        return {
            "terminal": f"Python Core Exception:\n{traceback.format_exc()}",
            "warning": "",
        }
