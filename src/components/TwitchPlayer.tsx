import React, { useMemo } from 'react';

interface TwitchPlayerProps {
  channel?: string;
  isLive?: boolean;
  streamTitle?: string;
  gameName?: string;
}

export const TwitchPlayer: React.FC<TwitchPlayerProps> = ({
  channel = 'kewisitotv',
  isLive = false,
  streamTitle,
  gameName,
}) => {
  // Compute parent query params safely for Twitch embeds
  const parentParams = useMemo(() => {
    if (typeof window === 'undefined') return 'parent=localhost';

    const domains = new Set<string>();

    if (window.location.hostname) {
      domains.add(window.location.hostname);
    }

    // Common sandbox & dev container hostnames
    domains.add('localhost');
    domains.add('127.0.0.1');
    domains.add('ais-dev-jpdh4mj6mvolnocdoui2tz-708659857030.us-east1.run.app');
    domains.add('ais-pre-jpdh4mj6mvolnocdoui2tz-708659857030.us-east1.run.app');

    try {
      if (document.referrer) {
        const refUrl = new URL(document.referrer);
        if (refUrl.hostname) domains.add(refUrl.hostname);
      }
    } catch {
      // Ignore URL parsing errors
    }

    return Array.from(domains)
      .filter(Boolean)
      .map((d) => `parent=${encodeURIComponent(d)}`)
      .join('&');
  }, []);

  const streamEmbedUrl = `https://player.twitch.tv/?channel=${channel}&${parentParams}&muted=false&autoplay=true`;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-900/85 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Streamer Header Bar: Only title and category */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-950/80 border-b border-slate-800/80 min-h-[52px]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span
              className={`w-3 h-3 rounded-full ${
                isLive ? 'bg-red-500 animate-ping' : 'bg-purple-500'
              } absolute`}
            />
            <span
              className={`w-3 h-3 rounded-full ${
                isLive ? 'bg-red-600' : 'bg-purple-600'
              } relative`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
              {streamTitle || 'Transmisión oficial de Kewisito'}
            </h2>
            {gameName && (
              <span className="inline-flex items-center text-xs font-semibold text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-md shrink-0">
                {gameName}
              </span>
            )}
          </div>
        </div>

        {isLive && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-md shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            EN VIVO
          </span>
        )}
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 bg-black min-h-[420px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[620px] xl:min-h-[680px] flex flex-col overflow-hidden">
        {/* Stream video player */}
        <div className="relative h-full w-full flex-1" style={{ minHeight: '420px' }}>
          <iframe
            src={streamEmbedUrl}
            title={`Directo de ${channel} en Twitch`}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>
      </div>

      {/* Stream Footer Info */}
      <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isLive ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-300 font-medium">
            {isLive
              ? 'Emitiendo en directo en Twitch'
              : 'Kewisito en directo o repetición interactiva'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>¿No carga el reproductor?</span>
          <a
            href={`https://twitch.tv/${channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline font-medium"
          >
            Abrir directo en nueva pestaña
          </a>
        </div>
      </div>
    </div>
  );
};
