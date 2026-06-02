/** Ranura vacía con brillo — invita a desbloquear medallas en Progreso. */
export default function EmptyNavbarMedalSlot() {
  return (
    <div
      className="relative shrink-0 w-11 h-[54px] flex items-center justify-center"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-[#34C759]/20 blur-md animate-pulse" />
      <div
        className="absolute inset-0 rounded-full border border-[#5DD4F7]/30 animate-ping opacity-40"
        style={{ animationDuration: "2.5s" }}
      />
      <svg viewBox="0 0 80 96" width={44} height={54} className="relative z-[1]">
        <defs>
          <linearGradient id="empty-medal-shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5DD4F7" stopOpacity="0.9">
              <animate attributeName="stop-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#34C759" stopOpacity="0.7">
              <animate attributeName="stop-opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#5DD4F7" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          d="M40 4 L68 20 L68 52 L40 72 L12 52 L12 20 Z"
          fill="none"
          stroke="url(#empty-medal-shine)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <path
          d="M40 14 L60 26 L60 50 L40 62 L20 50 L20 26 Z"
          fill="#252525"
          stroke="#4A4A4A"
          strokeWidth="1"
          opacity="0.9"
        />
        <path d="M12 20 L20 26 M68 20 L60 26" stroke="#5DD4F7" strokeWidth="1" opacity="0.35" strokeLinecap="round" />
        <path d="M40 4 L40 14 M40 62 L40 72" stroke="#34C759" strokeWidth="1" opacity="0.35" strokeLinecap="round" />
        <text
          x="40"
          y="42"
          textAnchor="middle"
          fill="#5DD4F7"
          fontSize="18"
          fontWeight="bold"
          opacity="0.85"
        >
          ?
        </text>
        <path
          d="M22 76 L40 88 L58 76 L58 82 L40 94 L22 82 Z"
          fill="#2D2D2D"
          stroke="#4A4A4A"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
