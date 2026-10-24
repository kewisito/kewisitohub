import React from 'react';
import { SocialNetwork } from '../types';
import { getSocialIcon } from './SocialIcons';

interface SocialCardProps {
  network: SocialNetwork;
  totalFollowers: number;
  channelIndex?: number;
}

export const SocialCard: React.FC<SocialCardProps> = ({
  network,
  totalFollowers,
  channelIndex = 1,
}) => {
  const percentage =
    totalFollowers > 0
      ? ((network.followers / totalFollowers) * 100).toFixed(1)
      : '0';

  const formattedCount = new Intl.NumberFormat('es-ES').format(
    network.followers
  );

  const channelTag = `CH-0${channelIndex}`;

  return (
    <a
      href={network.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl transition-all duration-200 bg-[#0d0f16] border border-slate-800/80 hover:border-slate-600 hover:bg-[#121520] shadow-md hover:shadow-xl hover:translate-x-1 overflow-hidden block"
      title={`Abrir canal oficial de ${network.name}`}
    >
      {/* Left Accent Channel Indicator Strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 group-hover:w-1.5"
        style={{ backgroundColor: network.brandColor }}
      />

      {/* Background technical watermarked index */}
      <span className="absolute right-36 top-1/2 -translate-y-1/2 font-mono font-black text-4xl text-slate-900/60 select-none pointer-events-none tracking-tighter hidden sm:block">
        {channelTag}
      </span>

      {/* Left side: Channel Index + Icon + Info */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 z-10 pl-2">
        {/* Technical icon badge */}
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: network.brandBg,
            borderColor: network.borderColor,
            color: network.brandColor,
          }}
        >
          {getSocialIcon(network.id, 'w-5 h-5')}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-slate-500 font-bold tracking-widest uppercase">
              {channelTag}
            </span>
            <span className="text-slate-700">/</span>
            <h3 className="font-display font-bold text-base sm:text-lg text-white tracking-wide truncate group-hover:text-lime-300 transition-colors uppercase">
              {network.name}
            </h3>
            {network.id === 'twitch' && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-wider uppercase text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                PRIMARY
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
            <span className="text-slate-300 font-medium truncate">
              {network.handle}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-500 shrink-0">
              {percentage}% DEL TOTAL
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Exact Live Digital Counter */}
      <div className="text-right shrink-0 z-10 pl-2">
        <div className="flex items-baseline justify-end gap-1 font-mono">
          <span className="text-lg sm:text-2xl font-black text-white tracking-tight group-hover:text-lime-400 transition-colors">
            {formattedCount}
          </span>
        </div>
        <div className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {network.labelFollowers}
        </div>
      </div>
    </a>
  );
};
