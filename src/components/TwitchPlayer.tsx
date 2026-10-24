import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Share2,
  Check,
} from 'lucide-react';

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
  const [showChat, setShowChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
  const chatEmbedUrl = `https://www.twitch.tv/embed/${channel}/chat?${parentParams}&darkpopout`;

  const handleShareStream = () => {
    navigator.clipboard.writeText(`https://twitch.tv/${channel}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-900/85 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Streamer Header Bar corresponding to "directo" in wireframe */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-ping' : 'bg-purple-500'} absolute`} />
            <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-600' : 'bg-purple-600'} relative`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${isLive ? 'text-red-400' : 'text-purple-400'}`}>
                {isLive ? '🔴 En Directo' : 'Canal Oficial'}
              </span>
              <span className="text-slate-500 text-xs">/</span>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Twitch: <span className="text-purple-400 font-mono">@{channel}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {streamTitle || 'Transmisión oficial en vivo de Kewisito'}
              {gameName && <span className="text-purple-300 ml-1.5 font-medium">· {gameName}</span>}
            </p>
          </div>
        </div>

        {/* Player controls (without the removed purple Twitch.tv button) */}
        <div className="flex items-center gap-2">
          {/* Toggle Chat */}
          <button
            type="button"
            onClick={() => setShowChat(!showChat)}
            title={showChat ? 'Ocultar Chat' : 'Mostrar Chat en Vivo'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showChat
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {showChat ? 'Ocultar Chat' : 'Ver Chat'}
            </span>
          </button>

          {/* Reload embed */}
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            title="Recargar reproductor"
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            aria-label="Recargar reproductor"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShareStream}
            title="Compartir stream"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compartir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 bg-black min-h-[340px] sm:min-h-[420px] lg:min-h-[500px] flex flex-col md:flex-row overflow-hidden">
        {/* Stream video player */}
        <div
          className={`relative h-full transition-all duration-300 flex-1 ${
            showChat ? 'md:w-2/3 lg:w-3/4' : 'w-full'
          }`}
          style={{ minHeight: '340px' }}
        >
          <iframe
            key={`stream-${reloadKey}`}
            src={streamEmbedUrl}
            title={`Directo de ${channel} en Twitch`}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>

        {/* Live Twitch Chat Panel (Toggled) */}
        {showChat && (
          <div className="w-full md:w-1/3 lg:w-1/4 h-80 md:h-full border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950 flex flex-col">
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Chat del canal
              </span>
              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 relative">
              <iframe
                key={`chat-${reloadKey}`}
                src={chatEmbedUrl}
                title={`Chat de ${channel}`}
                className="w-full h-full border-0 absolute inset-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stream Footer Info */}
      <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
          <span className="text-slate-300 font-medium">
            {isLive ? 'Emitiendo en directo en Twitch' : 'Kewisito en directo o repetición interactiva'}
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-slate-400 hidden sm:inline">
            Directos regulares
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
