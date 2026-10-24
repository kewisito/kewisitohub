import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Share2,
  Check,
  Radio,
  Tv,
  Volume2,
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
      // Ignore
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
    <div className="flex flex-col h-full rounded-xl bg-[#0b0d14] border-2 border-slate-800 shadow-2xl overflow-hidden relative group">
      {/* Top Studio Monitor Tally Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#07080d] border-b border-slate-800/90 font-mono">
        <div className="flex items-center gap-3">
          {/* Tally Light Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-red-500 animate-ping' : 'bg-purple-500'
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                isLive ? 'text-red-400' : 'text-purple-400'
              }`}
            >
              {isLive ? 'ON AIR' : 'FEED READY'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">/</span>
            <span className="font-display font-bold text-base text-white tracking-wider uppercase">
              TWITCH MONITOR: <span className="text-purple-400">@{channel}</span>
            </span>
          </div>
        </div>

        {/* Technical control buttons */}
        <div className="flex items-center gap-2 text-xs">
          {/* Toggle Chat */}
          <button
            type="button"
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider uppercase border transition-colors cursor-pointer ${
              showChat
                ? 'bg-purple-950/80 text-purple-200 border-purple-500/60'
                : 'bg-[#121520] text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{showChat ? 'CHAT: ACTIVO' : 'CHAT: OFF'}</span>
          </button>

          {/* Reload feed */}
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            title="Recargar señal de video"
            className="p-1 rounded bg-[#121520] text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            aria-label="Recargar señal de video"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShareStream}
            title="Copiar enlace de Twitch"
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#121520] text-slate-400 hover:text-white border border-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-lime-400" />
                <span className="text-lime-400">COPIADO</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                <span>LINK</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Stream Viewport */}
      <div className="relative flex-1 bg-black min-h-[350px] sm:min-h-[440px] lg:min-h-[520px] flex flex-col md:flex-row overflow-hidden">
        {/* Stream video player */}
        <div
          className={`relative h-full transition-all duration-300 flex-1 ${
            showChat ? 'md:w-2/3 lg:w-3/4' : 'w-full'
          }`}
          style={{ minHeight: '350px' }}
        >
          {/* Subtle corner crosshairs */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/20 pointer-events-none z-10" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/20 pointer-events-none z-10" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/20 pointer-events-none z-10" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/20 pointer-events-none z-10" />

          <iframe
            key={`stream-${reloadKey}`}
            src={streamEmbedUrl}
            title={`Directo oficial de ${channel} en Twitch`}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>

        {/* Live Twitch Chat Panel (Toggled) */}
        {showChat && (
          <div className="w-full md:w-1/3 lg:w-1/4 h-80 md:h-full border-t md:border-t-0 md:border-l border-slate-800 bg-[#090b10] flex flex-col z-20">
            <div className="px-3 py-2 bg-[#06080e] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="font-bold text-purple-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                <MessageSquare className="w-3.5 h-3.5" />
                CHAT DEL CANAL
              </span>
              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="text-slate-500 hover:text-white text-[11px] cursor-pointer"
              >
                CERRAR
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

      {/* Broadcast Technical Telemetry Footer */}
      <div className="px-4 py-2.5 bg-[#07080d] border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          {/* Animated audio level meter */}
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-1 h-2 bg-lime-500 animate-pulse" />
            <span className="w-1 h-3 bg-lime-400 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2.5 bg-lime-400 animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-1.5 bg-emerald-500" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white font-bold uppercase tracking-wider text-[11px]">
              {streamTitle || 'TRANSMISIÓN OFICIAL DE KEWISITO'}
            </span>
            {gameName && (
              <span className="text-purple-400 font-semibold text-[11px] bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                {gameName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span>SOURCE: TWITCH.TV/{channel.toUpperCase()}</span>
          <span>·</span>
          <span>FORMAT: 1080p60</span>
        </div>
      </div>
    </div>
  );
};
