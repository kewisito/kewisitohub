import React, { useState, useEffect } from 'react';
import { Activity, Radio, Cpu } from 'lucide-react';

interface HeaderProps {
  isLiveUpdating?: boolean;
  lastUpdated?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  isLiveUpdating = true,
  lastUpdated,
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-slate-800/90 bg-[#090b10]/95 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Broadcast Brand Identity */}
        <div className="flex items-center gap-3.5">
          {/* Custom Studio Emblem with Kiwi accent */}
          <div className="relative group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-lime-500 via-emerald-600 to-slate-900 p-[1.5px] shadow-lg shadow-lime-950/40">
              <div className="w-full h-full rounded-[6.5px] bg-[#0c0e14] flex items-center justify-center relative overflow-hidden">
                <span className="font-display font-black text-xl text-lime-400 tracking-tighter">
                  KW
                </span>
                {/* Tech corner accent */}
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-lime-400" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-wider leading-none uppercase">
                KEWISITO
              </h1>
              <span className="font-mono text-[9px] font-bold text-lime-400 bg-lime-950/70 border border-lime-500/40 px-1.5 py-0.5 rounded tracking-widest uppercase">
                STATION // VERIFIED
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
              <span className="text-purple-400 font-semibold">
                TWITCH:@kewisitotv
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 font-semibold">
                REDES:@kewisito
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="text-slate-500 hidden sm:inline text-[11px]">
                MARACAIBO, VZLA
              </span>
            </div>
          </div>
        </div>

        {/* Right: Technical Telemetry Status */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs font-mono">
          {/* Studio clock */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[9px] uppercase tracking-widest text-slate-500">
              STUDIO CLOCK
            </span>
            <span className="text-slate-200 font-semibold tracking-wider">
              {time || '--:--:--'}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Real-time telemetry feed badge */}
          <div className="flex items-center gap-2 bg-[#0c0e15] border border-slate-800/90 px-2.5 py-1.5 rounded-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500" />
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-lime-400 tracking-wider uppercase leading-none">
                LIVE TELEMETRY
              </span>
              <span className="text-[9px] text-slate-500 leading-none mt-0.5 hidden sm:inline">
                API SYNC ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
