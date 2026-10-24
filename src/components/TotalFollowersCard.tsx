import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Radio } from 'lucide-react';
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
    const duration = 600; // ms
    const stepTime = 16;
    const totalSteps = Math.max(1, duration / stepTime);
    const increment = (total - start) / totalSteps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment >= 0 && current >= total) || (increment < 0 && current <= total)) {
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
    <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-900/90 via-purple-950/40 to-slate-900/90 border-2 border-purple-500/40 shadow-2xl backdrop-blur-md overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar (without the removed edit & sparkle buttons) */}
      <div className="flex items-center justify-between mb-3 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-purple-300 uppercase">
              Suma Global
            </span>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Total Seguidores
            </h4>
          </div>
        </div>

        {/* Live sync indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/60 border border-purple-500/30 text-[11px] font-mono text-purple-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>En vivo</span>
        </div>
      </div>

      {/* Main big counter display */}
      <div className="my-3 z-10 relative">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl lg:text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300 drop-shadow-sm">
            {formattedTotal}
          </span>
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            seguidores combinados
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Audiencia activa sincronizada en tiempo real.
        </p>
      </div>

      {/* Community distribution segmented bar */}
      <div className="space-y-1.5 z-10 relative pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Distribución por red</span>
          <span className="font-mono text-purple-300">
            {socials.length} plataformas
          </span>
        </div>

        <div className="h-2.5 w-full bg-slate-800/90 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-700/60">
          {socials.map((net) => {
            const widthPct = total > 0 ? (net.followers / total) * 100 : 0;
            return (
              <div
                key={net.id}
                title={`${net.name}: ${net.followers.toLocaleString('es-ES')} (${widthPct.toFixed(1)}%)`}
                className="h-full rounded-sm transition-all hover:opacity-90"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: net.brandColor,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Goal Progress to next milestone */}
      <div className="mt-3.5 pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs z-10 relative">
        <div className="flex items-center gap-1.5 text-slate-300">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Meta: <strong className="text-white font-mono">{formattedGoal}</strong>
          </span>
        </div>
        <span className="text-[11px] text-purple-300 font-mono">
          Faltan {formattedRemaining} ({progressPercent}%)
        </span>
      </div>
    </div>
  );
};
