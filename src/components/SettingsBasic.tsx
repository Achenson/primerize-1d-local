// PODKOMPONENT: SEKCJA PODSTAWOWA
// ==========================================
//

interface BasicProps {
    checkT7: boolean;
    setCheckT7: (value: boolean) => void;
    isLoading: boolean;
}

export default function SettingsBasic({ checkT7, setCheckT7, isLoading }: BasicProps) {
    return (
        <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60">
            <input
                type="checkbox"
                id="checkT7"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                checked={checkT7}
                onChange={(e) => setCheckT7(e.target.checked)}
                disabled={isLoading}
            />

            {/* The label is now the flex column container */}
            <label
                htmlFor="checkT7"
                className="flex flex-col cursor-pointer select-none group"
            >
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-950 transition-colors">
                    Automatically add T7 Promoter Sequence
                </span>
                <span className="text-[11px] text-slate-400 italic leading-snug">
                    Prepends the T7 RNA polymerase promoter (TTCTAATACGACTCACTATA) if missing.
                </span>
            </label>
        </div>
    );
}
