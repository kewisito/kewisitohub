import React, { useEffect, useState } from 'react';
import { Activity, Radio, Target, Zap } from 'lucide-react';
import { SocialNetwork } from '../types';
import { NEXT_GOAL } from '../data/socials';

interface TotalFollowersCardProps {
  socials: SocialNetwork[];
  isSyncing?: boolean;
}

export const TotalFollowersCard: React.FC<TotalFollowersCardProps> = ({
  socials,
  isSyncing = false,
}) => {
  const total = socials.reduce((acc, curr) => acc + curr.followers, 0);
  const [displayCount, setDisplayCount] = useState(total);

  // Smooth number ticker effect on total change
  useEffect(() => {
    let start = displayCount;
    const duration = 500;
    const stepTime = 16;
    const totalSteps = Math.max(1, duration / stepTime);
    const increment = (total - start) / totalSteps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (
        (increment >= 0 && current >= total) ||
        (increment < 0 && current <= total)
      ) {
        setDisplayCount(total);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [total]);

  const progressPercent = Math.min(
    100,
    parseFloat(((total / NEXT_GOAL) * 100).toFixed(1))
  );

  const formattedTotal = new Intl.NumberFormat('es-ES').format(displayCount);
  const formattedGoal = new Intl.NumberFormat('es-ES').format(NEXT_GOAL);
  const remaining = Math.max(0, NEXT_GOAL - total);
  const formattedRemaining = new Intl.NumberFormat('es-ES').format(remaining);

  return (
    <div className="relative rounded-xl p-4 sm:p-5 bg-gradient-to-br from-[#0c0f18] via-[#090b12] to-[#07080d] border-2 border-slate-700/80 shadow-2xl overflow-hidden group">
      {/* Corner Technical Crosshairs */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-lime-500/60" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-lime-500/60" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-lime-500/60" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-lime-500/60" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[9px] font-bold tracking-widest text-lime-400 uppercase">
              MASTER TALLY // TOTAL SEGUIDORES
            </span>
            <h4 className="font-display text-base font-black text-white uppercase tracking-wider leading-none">
              SUMA GLOBAL DE LA COMUNIDAD
            </h4>
          </div>
        </div>

        {/* Live telemetry pulse */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#07090f] border border-slate-800 text-[10px] font-mono text-lime-400">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          <span>SYNC LIVE</span>
        </div>
      </div>

      {/* Main big digital LED display */}
      <div className="my-3 z-10 relative bg-[#06080e]/90 p-3 sm:p-4 rounded-lg border border-slate-800/90 shadow-inner">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-4xl sm:text-5xl tracking-tight text-white drop-shadow-[0_0_12px_rgba(163,230,53,0.3)]">
              {formattedTotal}
            </span>
            <span className="font-mono text-[11px] font-bold text-lime-400 uppercase tracking-widest">
              SEGUIDORES ACTIVOS
            </span>
          </div>

          <div className="text-right hidden sm:block">
            <span className="font-mono text-[9px] text-slate-500 uppercase block">
              PLATAFORMAS CONECTADAS
            </span>
            <span className="font-mono text-xs font-bold text-slate-300">
              {socials.length} CANALES
            </span>
          </div>
        </div>
      </div>

      {/* Community distribution audio-meter style visualizer */}
      <div className="space-y-1.5 z-10 relative pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="tracking-wider uppercase">BALANCE POR PLATAFORMA</span>
          <span className="text-slate-500">100% DISTRIBUCIÓN</span>
        </div>

        {/* Multi-segment broadcast bar */}
        <div className="h-3 w-full bg-[#06080e] rounded-sm overflow-hidden flex p-0.5 gap-0.5 border border-slate-800">
          {socials.map((net) => {
            const widthPct = total > 0 ? (net.followers / total) * 100 : 0;
            return (
              <div
                key={net.id}
                title={`${net.name}: ${net.followers.toLocaleString('es-ES')} (${widthPct.toFixed(1)}%)`}
                className="h-full rounded-[1px] transition-all hover:opacity-100 opacity-90"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: net.brandColor,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Goal Progress readout */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono z-10 relative">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Target className="w-3.5 h-3.5 text-lime-400" />
          <span>
            META: <strong className="text-white">{formattedGoal}</strong>
          </span>
        </div>
        <span className="text-[11px] text-lime-400 font-semibold">
          {progressPercent}% COMPLETADO (FALTAN {formattedRemaining})
        </span>
      </div>
    </div>
  );
};
