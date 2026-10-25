import React, { useEffect, useState } from 'react';
import { Users, TrendingUp } from 'lucide-react';
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

  // Instantaneous smooth number ticker effect on total change
  useEffect(() => {
    let start = displayCount;
    const duration = 200; // 200ms for instantaneous responsive update
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
    <div
      style={{ animationDelay: '0.65s' }}
      className="anim-slide-up relative rounded-[28px] p-5 sm:p-6 bg-gradient-to-br from-[rgba(24,19,60,0.65)] to-[rgba(10,8,28,0.75)] backdrop-blur-xl border border-purple-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden transition-all duration-300 hover:border-purple-400/50 hover:shadow-[0_16px_50px_rgba(48,43,99,0.55),inset_0_1px_0_rgba(255,255,255,0.15)]"
    >
      {/* Subtle cosmic background nebula */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-700/25 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-2.5 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#a5b4fc] uppercase">
              Suma Global
            </span>
            <h4 className="text-base font-bold text-[#e0f8ff] uppercase tracking-wider leading-none">
              Total Seguidores
            </h4>
          </div>
        </div>

        {/* Live sync indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(15,12,41,0.7)] border border-purple-500/30 text-xs text-[#e0f8ff] font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#38bdf8]" />
          <span>En vivo</span>
        </div>
      </div>

      {/* Main big counter display */}
      <div className="my-3 z-10 relative">
        <div className="flex items-baseline gap-2.5">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#e0f8ff] drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            {formattedTotal}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#a5b4fc] uppercase tracking-wider">
            seguidores combinados
          </span>
        </div>
        <p className="text-xs text-[#e0f8ff]/75 mt-0.5">
          Audiencia activa sincronizada en tiempo real con las redes oficiales.
        </p>
      </div>

      {/* Community distribution segmented bar */}
      <div className="space-y-1.5 z-10 relative pt-1">
        <div className="flex items-center justify-between text-xs text-[#e0f8ff]/80 font-medium">
          <span>Distribución por plataforma</span>
          <span className="text-[#a5b4fc]">
            {socials.length} redes
          </span>
        </div>

        <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-purple-500/20 shadow-inner">
          {socials.map((net) => {
            const widthPct = total > 0 ? (net.followers / total) * 100 : 0;
            return (
              <div
                key={net.id}
                title={`${net.name}: ${net.followers.toLocaleString('es-ES')} (${widthPct.toFixed(1)}%)`}
                className="h-full rounded-full transition-all hover:opacity-100 opacity-90 shadow-sm"
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
      <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs z-10 relative">
        <div className="flex items-center gap-1.5 text-[#e0f8ff]">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>
            Meta:{' '}
            <strong className="text-white font-bold">{formattedGoal}</strong>
          </span>
        </div>
        <span className="text-xs text-[#a5b4fc] font-semibold">
          Faltan {formattedRemaining} ({progressPercent}%)
        </span>
      </div>
    </div>
  );
};
