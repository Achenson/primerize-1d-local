import re
import traceback
from primerize.primerize_1d import Primerize_1D


def run_design(user_sequence):
    """Executes the Stanford Primerize engine and returns a clean, polished report string."""
    try:
        p = Primerize_1D()
        res = p.design(user_sequence, prefix="primer", NUM_PRIMERS=None)

        output = []
        output.append(
            "========================================================================="
        )
        output.append(
            "          STANFORD PRIMERIZE 1D OUTPUT TERMINAL (WASM ENGINE)            "
        )
        output.append(
            "========================================================================="
        )
        output.append(f"Input Sequence Length: {len(user_sequence)} bases")

        primers_list = getattr(res, "primer_set", [])
        output.append(f"Number of Primers Designed: {len(primers_list)}")
        output.append(
            "-------------------------------------------------------------------------"
        )
        output.append(
            f"{'Oligo Name':<15} | {'Sequence (5` to 3`)':<42} | {'Length':<6}"
        )
        output.append(
            "-------------------------------------------------------------------------"
        )

        for i, primer in enumerate(primers_list):
            p_id = f"primer_oligo_{i+1}"
            p_seq = str(primer).strip().upper()
            output.append(f"{p_id:<15} | {p_seq:<42} | {len(p_seq):<6}")

        # POBIERANIE I OCZYSZCZANIE OSTRZEŻEŃ Z KODÓW ANSI ([93m, [0m itd.)
        try:
            warnings_text = res.echo("WARNING")
            warnings_text = str(warnings_text).strip()

            if warnings_text and warnings_text != "None":
                # Wyrażenie regularne usuwające sekwencje sterujące kolorami terminala
                ansi_escape = re.compile(
                    r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])|\[\d+m"
                )
                clean_warnings = ansi_escape.sub("", warnings_text)

                output.append(
                    "\n-------------------------------------------------------------------------"
                )
                output.append("WARNINGS & MISPRIMING ALERTS:")
                output.append(clean_warnings)
        except Exception:
            pass

        output.append(
            "========================================================================="
        )
        return "\n".join(output)

    except Exception as inner_err:
        return f"Python Core Exception:\n{traceback.format_exc()}"
