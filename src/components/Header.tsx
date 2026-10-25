import React from 'react';

interface HeaderProps {
  isLiveUpdating?: boolean;
  lastUpdated?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  isLiveUpdating = true,
  lastUpdated,
}) => {
  return (
    <header className="w-full border-b border-purple-500/20 bg-[rgba(15,12,41,0.75)] backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Streamer identity & official avatar from kewisito.com */}
        <div className="flex items-center gap-3.5">
          <div
            style={{ animationDelay: '0.2s' }}
            className="anim-slide-up relative shrink-0"
          >
            <img
              src="/streamer-avatar.png"
              alt="Kewisito Avatar"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-purple-400/40 shadow-[0_0_15px_#537895,0_0_25px_#302b63] transition-transform duration-300 hover:scale-110"
            />
            {/* Live pulsing dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5"
              title="Streamer Activo"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400 border-2 border-[#0f0c29]" />
            </span>
          </div>

          <div
            style={{ animationDelay: '0.3s' }}
            className="anim-slide-up"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#e0f8ff] tracking-wide leading-none kewisito-glow-text">
                @Kewisito
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#e0f8ff] bg-purple-950/50 border border-purple-500/35 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                Oficial
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#e0f8ff]/80 mt-0.5 font-medium">
              <span className="text-[#a5b4fc] font-semibold">
                @kewisitotv
              </span>
              <span className="text-[#e0f8ff]/40">·</span>
              <span className="text-[#e0f8ff]/90">@kewisito</span>
              <span className="text-[#e0f8ff]/40 hidden sm:inline">·</span>
              <span className="hidden sm:inline text-[#e0f8ff]/70 text-[11px]">
                ¡Bienvenido a mi rincón de internet!
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Real-time live status indicator with animation */}
        <div
          style={{ animationDelay: '0.35s' }}
          className="anim-slide-up flex items-center gap-2 text-xs"
        >
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          </span>
          <span className="text-[#e0f8ff] font-semibold tracking-wider text-[11px] sm:text-xs uppercase">
            EN TIEMPO REAL
          </span>
        </div>
      </div>
    </header>
  );
};
