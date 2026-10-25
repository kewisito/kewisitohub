import React from 'react';
import { SocialNetwork } from '../types';
import { getSocialIcon } from './SocialIcons';

interface SocialCardProps {
  network: SocialNetwork;
  totalFollowers: number;
  index?: number;
}

export const SocialCard: React.FC<SocialCardProps> = ({
  network,
  totalFollowers,
  index = 0,
}) => {
  const percentage =
    totalFollowers > 0
      ? ((network.followers / totalFollowers) * 100).toFixed(1)
      : '0';

  const formattedCount = new Intl.NumberFormat('es-ES').format(
    network.followers
  );

  // Staggered animation delay matching kewisito.com
  const animDelay = `${0.35 + index * 0.05}s`;

  return (
    <a
      href={network.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        animationDelay: animDelay,
        borderColor: network.borderColor,
      }}
      className="kewisito-link-card anim-slide-up group relative flex items-center justify-between p-3.5 sm:p-4 rounded-full overflow-hidden cursor-pointer block border shadow-lg hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)]"
      title={`Abrir perfil de ${network.name} (${network.handle})`}
    >
      {/* Subtle brand glow overlay inside the card */}
      <div
        className="absolute inset-0 opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none rounded-full"
        style={{
          background: `radial-gradient(circle at 15% 50%, ${network.brandColor}, transparent 65%)`,
        }}
      />

      {/* Left side: Icon + Name + Handle */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 z-10 pl-1 sm:pl-2">
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 border border-white/10 transition-transform duration-300 group-hover:scale-110 shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          style={{
            backgroundColor: network.brandBg || 'rgba(10, 8, 26, 0.7)',
            color: network.brandColor,
          }}
        >
          {getSocialIcon(network.id, 'w-6 h-6')}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#e0f8ff] tracking-wide truncate group-hover:text-white transition-colors">
              {network.name}
            </h3>
            {network.id === 'twitch' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-200 bg-[rgba(145,70,255,0.3)] border border-[rgba(169,112,255,0.4)] px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-ping" />
                Stream
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#e0f8ff]/80">
            <span className="text-[#c7d2fe] font-semibold truncate">
              {network.handle}
            </span>
            <span className="text-[#e0f8ff]/40">·</span>
            <span className="text-[11px] text-[#e0f8ff]/70 shrink-0">
              {percentage}% com.
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Exact Counter in harmonious cosmic palette */}
      <div className="text-right shrink-0 z-10 pr-2 sm:pr-3">
        <div className="flex items-baseline justify-end gap-1 font-bold">
          <span className="text-xl sm:text-2xl font-bold text-[#e0f8ff] tracking-tight group-hover:scale-105 transition-transform kewisito-glow-text">
            {formattedCount}
          </span>
        </div>
        <div className="text-[11px] font-semibold text-[#a5b4fc]/80 uppercase tracking-wider">
          {network.labelFollowers}
        </div>
      </div>
    </a>
  );
};
