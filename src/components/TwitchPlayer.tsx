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
    <div className="flex flex-col h-full rounded-[28px] bg-[rgba(0,0,0,0.5)] backdrop-blur-xl border-2 border-[rgba(224,248,255,0.7)] shadow-[inset_0_0_15px_rgba(83,120,149,0.5),0_0_25px_rgba(48,43,99,0.6)] overflow-hidden transition-all duration-300 hover:border-[#e0f8ff]">
      {/* Streamer Header Bar: Only title and category */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[rgba(15,12,41,0.6)] border-b border-[rgba(224,248,255,0.25)] min-h-[52px]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                isLive ? 'bg-red-500 animate-ping' : 'bg-purple-400'
              } absolute`}
            />
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                isLive ? 'bg-red-600' : 'bg-purple-500'
              } relative shadow-[0_0_8px_rgba(169,112,255,0.8)]`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#e0f8ff] tracking-wide truncate kewisito-glow-text">
              {streamTitle || 'Transmisión oficial de Kewisito'}
            </h2>
            {gameName && (
              <span className="inline-flex items-center text-xs font-semibold text-[#e0f8ff] bg-[rgba(83,120,149,0.4)] border border-[rgba(224,248,255,0.5)] px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(83,120,149,0.5)] shrink-0">
                {gameName}
              </span>
            )}
          </div>
        </div>

        {isLive && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-300 bg-red-950/70 border border-red-500/50 px-2.5 py-0.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
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
      <div className="px-5 py-3 bg-[rgba(15,12,41,0.7)] border-t border-[rgba(224,248,255,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#e0f8ff]/80">
        <div className="flex items-center gap-2 font-medium">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              isLive ? 'bg-red-500 animate-ping' : 'bg-cyan-400'
            }`}
          />
          <span className="text-[#e0f8ff]">
            {isLive
              ? 'Emitiendo en directo en Twitch'
              : 'Kewisito en directo o repetición interactiva'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#e0f8ff]/70">
          <span>¿No carga el reproductor?</span>
          <a
            href={`https://twitch.tv/${channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#a5b4fc] hover:text-white underline font-semibold transition-colors"
          >
            Abrir directo en nueva pestaña
          </a>
        </div>
      </div>
    </div>
  );
};
