import React, { useState, useEffect, useRef } from 'react';
import { Tv, Users } from 'lucide-react';
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
      // Fallback
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

  // Continuous background synchronization interval (polls silently every 6 seconds)
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Dynamic ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-indigo-900/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[25%] w-[40vw] h-[40vw] bg-cyan-900/10 rounded-full blur-[140px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Navbar */}
      <Header isLiveUpdating={true} lastUpdated={lastSyncTime} />

      {/* Mobile Tab Switcher (Visible on small screens only) */}
      <div className="lg:hidden px-4 pt-3 z-10">
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMobileTab('redes')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'redes'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>REDES & SEGUIDORES</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('directo')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'directo'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>DIRECTO TWITCH</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Faithfully implements user wireframe */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: "REDES" */}
          {/* ======================================================== */}
          <section
            className={`lg:col-span-5 flex flex-col gap-4 ${
              mobileTab === 'directo' ? 'hidden lg:flex' : 'flex'
            }`}
            aria-label="Redes Sociales de Kewisito"
          >
            {/* Column Header: "REDES" */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-purple-500 to-indigo-600" />
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase">
                  REDES
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tiempo Real</span>
              </div>
            </div>

            {/* List of social media casillas */}
            <div className="flex flex-col gap-2.5">
              {socials.map((net) => (
                <SocialCard
                  key={net.id}
                  network={net}
                  totalFollowers={totalFollowers}
                />
              ))}
            </div>

            {/* Bottom Section: "total seguidores" */}
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
            className={`lg:col-span-7 flex flex-col gap-4 h-full ${
              mobileTab === 'redes' ? 'hidden lg:flex' : 'flex'
            }`}
            aria-label="Directo de Twitch"
          >
            {/* Column Header: "directo" */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-red-500 to-pink-600" />
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase">
                  directo
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  kewisitotv en Twitch
                </span>
              </div>
            </div>

            {/* Twitch Player Container */}
            <div className="flex-1">
              <TwitchPlayer
                channel="kewisitotv"
                isLive={streamInfo.isLive}
                streamTitle={streamInfo.title}
                gameName={streamInfo.game}
              />
            </div>

            {/* Stream info status badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Canal Principal
                </span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  twitch.tv/kewisitotv
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Transmisión oficial de Kewisito.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Comunidad en Vivo
                </span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  {new Intl.NumberFormat('es-ES').format(totalFollowers)} seguidores
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Actualización constante en segundo plano.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Comunidad Directa
                </span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  Discord & WhatsApp
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Avisos inmediatos de directos y eventos.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 px-4 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white tracking-wider">
              KEWISITO HUB
            </span>
            <span>·</span>
            <span>Canal Twitch: @kewisitotv · Redes: @kewisito</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sincronización activa
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
