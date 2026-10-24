import React from 'react';
import { SocialNetwork } from '../types';
import { getSocialIcon } from './SocialIcons';

interface SocialCardProps {
  network: SocialNetwork;
  totalFollowers: number;
}

export const SocialCard: React.FC<SocialCardProps> = ({
  network,
  totalFollowers,
}) => {
  const percentage =
    totalFollowers > 0
      ? ((network.followers / totalFollowers) * 100).toFixed(1)
      : '0';

  const formattedCount = new Intl.NumberFormat('es-ES').format(
    network.followers
  );

  return (
    <a
      href={network.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all duration-300 backdrop-blur-md bg-slate-900/75 border border-slate-800/80 hover:border-slate-600/90 hover:bg-slate-800/70 shadow-lg hover:shadow-xl hover:translate-y-[-2px] overflow-hidden cursor-pointer block"
      style={{
        boxShadow: `0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 15px -3px ${network.glowColor}`,
      }}
      title={`Visitar ${network.name} (${network.handle})`}
    >
      {/* Subtle brand glow on card background */}
      <div
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(circle at 10% 50%, ${network.brandColor}, transparent 60%)`,
        }}
      />

      {/* Left side: Icon + Name + Handle */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 z-10">
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 shadow-inner"
          style={{
            backgroundColor: network.brandBg,
            borderColor: network.borderColor,
            color: network.brandColor,
          }}
        >
          {getSocialIcon(network.id, 'w-6 h-6')}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate group-hover:text-purple-300 transition-colors">
              {network.name}
            </h3>
            {network.id === 'twitch' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                Stream
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-mono text-slate-300 font-medium truncate">
              {network.handle}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400 shrink-0">
              {percentage}% com.
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Exact Counter (clean, without the removed action buttons) */}
      <div className="text-right shrink-0 z-10 pl-2">
        <div className="flex items-baseline justify-end gap-1 font-mono">
          <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:scale-105 transition-transform">
            {formattedCount}
          </span>
        </div>
        <div className="text-[11px] font-medium text-slate-400 capitalize">
          {network.labelFollowers}
        </div>
      </div>
    </a>
  );
};
