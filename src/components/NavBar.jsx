export default function NavBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-nav-border bg-nav-bg px-5 shadow-[0_1px_0_oklch(0_0_0/0.3),0_2px_8px_oklch(0_0_0/0.18)]">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue to-[oklch(0.38_0.20_270)] shadow-[0_1px_3px_oklch(0_0_0/0.4),inset_0_1px_0_oklch(1_0_0/0.15)]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10M3 8h6M3 12h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight text-nav-ink1">Nexus</span>
      </div>
      <div className="h-[18px] w-px bg-nav-border" />
      <span className="text-xs text-nav-ink2">Legal Request Triage</span>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-nav-ink2">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.16_145)] shadow-[0_0_0_2px_oklch(0.62_0.16_145/0.25)]" />
          API connected
        </div>
        <div className="h-[18px] w-px bg-nav-border" />
        <span className="text-xs text-nav-ink2">Dipan B.</span>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.40_0.15_252)] to-[oklch(0.28_0.12_280)] font-mono text-[10px] font-bold text-[oklch(0.88_0.006_252)] shadow-[0_1px_3px_oklch(0_0_0/0.3)] ring-[1.5px] ring-nav-border">
          DB
        </div>
      </div>
    </header>
  );
}
