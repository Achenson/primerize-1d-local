interface SettingsBasicProps {
  checkT7: boolean;
  setCheckT7: (value: boolean) => void;
  isLoading: boolean;
}

export default function SettingsBasic({
  checkT7,
  setCheckT7,
  isLoading,
}: SettingsBasicProps) {
  return (
    <div className="flex items-start gap-2 border-t border-slate-200/60 pt-2">
      <input
        type="checkbox"
        id="checkT7"
        className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-default disabled:opacity-50"
        checked={checkT7}
        onChange={(e) => setCheckT7(e.target.checked)}
        disabled={isLoading}
      />
      <label
        htmlFor="checkT7"
        className="group flex cursor-pointer flex-col select-none"
      >
        <span className="text-xs font-semibold text-slate-700 transition-colors group-hover:text-slate-950">
          Automatically add T7 Promoter Sequence
        </span>
        <span className="text-[11px] leading-snug text-slate-400 italic">
          Prepends the T7 RNA polymerase promoter (TTCTAATACGACTCACTATA) if
          missing.
        </span>
      </label>
    </div>
  );
}
