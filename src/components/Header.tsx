import React from 'react';
import { Radio } from 'lucide-react';

interface HeaderProps {
  isLiveUpdating?: boolean;
  lastUpdated?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  isLiveUpdating = true,
  lastUpdated,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Streamer identity & avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-purple-950/60">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden">
                <span className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-purple-200">
                  K
                </span>
              </div>
            </div>
            {/* Live pulsing dot */}
            <span
              className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5"
              title="Streamer Activo"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-slate-950" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                KEWISITO
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Verificado
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-purple-400 font-mono font-medium">
                @kewisitotv
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300 font-mono">@kewisito</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="hidden sm:inline text-slate-400">
                Creador de Contenido & Streamer
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Real-time live status indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 font-mono font-medium text-[11px] sm:text-xs">
            EN TIEMPO REAL
          </span>
        </div>
      </div>
    </header>
  );
};
