import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Users,
  Radio,
  Image as ImageIcon,
  X,
  Activity,
  Terminal,
  Zap,
} from 'lucide-react';
import { SocialNetwork } from './types';
import { INITIAL_SOCIALS } from './data/socials';
import { SocialCard } from './components/SocialCard';
import { TotalFollowersCard } from './components/TotalFollowersCard';
import { TwitchPlayer } from './components/TwitchPlayer';
import { Header } from './components/Header';

export default function App() {
  const [socials, setSocials] = useState<SocialNetwork[]>(INITIAL_SOCIALS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<{
    isLive: boolean;
    title?: string;
    game?: string;
  }>({ isLive: false });
  const [showWireframeModal, setShowWireframeModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'all' | 'directo' | 'redes'>('all');

  const isMountedRef = useRef(true);

  // Background real-time synchronization function
  const syncFollowers = async () => {
    if (!isMountedRef.current) return;
    setIsSyncing(true);

    try {
      const response = await fetch('/api/followers');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const { twitch, tiktok, instagram, youtube, discord, whatsapp } =
            json.data;

          setSocials((prev) =>
            prev.map((item) => {
              if (item.id === 'twitch' && twitch?.followers !== undefined) {
                return { ...item, followers: twitch.followers };
              }
              if (item.id === 'tiktok' && tiktok?.followers !== undefined) {
                return { ...item, followers: tiktok.followers };
              }
              if (item.id === 'instagram' && instagram?.followers !== undefined) {
                return { ...item, followers: instagram.followers };
              }
              if (item.id === 'youtube' && youtube?.followers !== undefined) {
                return { ...item, followers: youtube.followers };
              }
              if (item.id === 'discord' && discord?.followers !== undefined) {
                return { ...item, followers: discord.followers };
              }
              if (item.id === 'whatsapp' && whatsapp?.followers !== undefined) {
                return { ...item, followers: whatsapp.followers };
              }
              return item;
            })
          );

          if (twitch) {
            setStreamInfo({
              isLive: !!twitch.isLive,
              title: twitch.title,
              game: twitch.game,
            });
          }

          setLastSyncTime(new Date().toLocaleTimeString('es-ES'));
          setIsSyncing(false);
          return;
        }
      }
    } catch {
      // Fallback to direct decapi public call for twitch
    }

    try {
      const twitchRes = await fetch(
        'https://decapi.me/twitch/followcount/kewisitotv'
      );
      if (twitchRes.ok) {
        const text = await twitchRes.text();
        const count = parseInt(text.trim(), 10);
        if (!isNaN(count)) {
          setSocials((prev) =>
            prev.map((item) =>
              item.id === 'twitch' ? { ...item, followers: count } : item
            )
          );
        }
      }
    } catch {
      // Ignore
    }

    setLastSyncTime(new Date().toLocaleTimeString('es-ES'));
    setIsSyncing(false);
  };

  // Continuous background synchronization interval (polls every 6 seconds)
  useEffect(() => {
    isMountedRef.current = true;
    syncFollowers();

    const intervalId = setInterval(() => {
      syncFollowers();
    }, 6000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  const totalFollowers = socials.reduce((acc, curr) => acc + curr.followers, 0);

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col font-sans selection:bg-lime-500 selection:text-black relative">
      {/* Precision studio grid overlay */}
      <div className="fixed inset-0 studio-grid pointer-events-none opacity-40 z-0" />

      {/* Top Navbar */}
      <Header isLiveUpdating={true} lastUpdated={lastSyncTime} />

      {/* Broadcast Technical Status Strip */}
      <div className="relative z-10 border-b border-slate-800/80 bg-[#07080c]/90 px-4 py-2 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-lime-400 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span>STATION ONLINE</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span>FEED: <strong className="text-white">TWITCH @kewisitotv</strong></span>
              <span className="text-slate-600">·</span>
              <span>NETWORK: <strong className="text-white">@kewisito</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            {lastSyncTime && (
              <span>SYNC TIME: <span className="text-slate-300 font-semibold">{lastSyncTime}</span></span>
            )}
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => setShowWireframeModal(true)}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-lime-300 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-lime-400" />
              <span>BOCETO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Switcher (Small Screens Only) */}
      <div className="lg:hidden px-4 pt-3 z-10">
        <div className="grid grid-cols-2 p-1 bg-[#0d0f17] rounded-lg border border-slate-800 font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => setMobileTab('redes')}
            className={`py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'redes'
                ? 'bg-lime-500 text-black font-extrabold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>CANALES & TALLY</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('directo')}
            className={`py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'directo'
                ? 'bg-purple-600 text-white font-extrabold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>TWITCH LIVE</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport (Wireframe-aligned composition) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: "REDES" */}
          {/* ======================================================== */}
          <section
            className={`lg:col-span-5 flex flex-col gap-3.5 ${
              mobileTab === 'directo' ? 'hidden lg:flex' : 'flex'
            }`}
            aria-label="Canales oficiales de Kewisito"
          >
            {/* Column Header: "REDES" */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 bg-lime-400 rounded-sm" />
                <h2 className="font-display font-black text-2xl text-white tracking-widest uppercase">
                  REDES
                </h2>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-lime-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                <span>REAL-TIME FEEDS</span>
              </div>
            </div>

            {/* List of social rack channel strips */}
            <div className="flex flex-col gap-2">
              {socials.map((net, idx) => (
                <SocialCard
                  key={net.id}
                  network={net}
                  totalFollowers={totalFollowers}
                  channelIndex={idx + 1}
                />
              ))}
            </div>

            {/* Bottom Section: "total seguidores" master tally */}
            <div className="mt-1">
              <TotalFollowersCard
                socials={socials}
                isSyncing={isSyncing}
              />
            </div>
          </section>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: "directo" */}
          {/* ======================================================== */}
          <section
            className={`lg:col-span-7 flex flex-col gap-3.5 h-full ${
              mobileTab === 'redes' ? 'hidden lg:flex' : 'flex'
            }`}
            aria-label="Directo de Twitch"
          >
            {/* Column Header: "directo" */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-5 bg-red-500 rounded-sm" />
                <h2 className="font-display font-black text-2xl text-white tracking-widest uppercase">
                  DIRECTO
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-slate-400">CHANNEL:</span>
                <span className="text-purple-400 font-bold uppercase">
                  @kewisitotv // TWITCH
                </span>
              </div>
            </div>

            {/* Twitch Studio Monitor */}
            <div className="flex-1">
              <TwitchPlayer
                channel="kewisitotv"
                isLive={streamInfo.isLive}
                streamTitle={streamInfo.title}
                gameName={streamInfo.game}
              />
            </div>

            {/* Technical Station Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-mono">
              <div className="p-3.5 rounded-lg bg-[#0d0f17] border border-slate-800">
                <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 block">
                  CANAL PRINCIPAL
                </span>
                <p className="text-sm font-black text-white mt-0.5">
                  twitch.tv/kewisitotv
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Transmisión oficial de Kewisito en Twitch.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0d0f17] border border-slate-800">
                <span className="text-[9px] font-bold uppercase tracking-widest text-lime-400 block">
                  AUDIENCIA GLOBAL
                </span>
                <p className="text-sm font-black text-white mt-0.5">
                  {new Intl.NumberFormat('es-ES').format(totalFollowers)} TOTAL
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Cifras extraídas en vivo desde APIs públicas.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0d0f17] border border-slate-800">
                <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 block">
                  HUB COMUNITARIO
                </span>
                <p className="text-sm font-black text-white mt-0.5">
                  Discord & WhatsApp
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Alertas directas de streams y eventos.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Industrial Broadcast Footer */}
      <footer className="mt-auto border-t border-slate-800/90 bg-[#07080c] py-4 px-4 z-10 font-mono text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-white tracking-widest text-sm">
              KEWISITO BROADCAST HUB
            </span>
            <span className="text-slate-700">/</span>
            <span className="text-[11px]">TWITCH: @kewisitotv · REDES: @kewisito</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-lime-400">TELEMETRY: ACTIVE (6s)</span>
            <span className="text-slate-700">/</span>
            <button
              type="button"
              onClick={() => setShowWireframeModal(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              VER BOCETO ORIGINAL
            </button>
          </div>
        </div>
      </footer>

      {/* Wireframe Preview Modal */}
      {showWireframeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#0d0f16] border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#07080d]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-lime-400" />
                <h3 className="font-display font-bold text-base text-white tracking-wider uppercase">
                  BOCETO ORIGINAL DE KEWISITO
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWireframeModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col items-center">
              <div className="border border-slate-700 rounded-lg overflow-hidden bg-white max-h-[55vh]">
                <img
                  src="/assets/aistudio/imagen_49e2f78e.png"
                  alt="Boceto original del diseño"
                  className="max-h-[50vh] object-contain w-auto mx-auto"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-3">
                Estructura 1:1: Columna izquierda <strong>REDES</strong> con <strong>total seguidores</strong>, y columna derecha con <strong>directo</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
