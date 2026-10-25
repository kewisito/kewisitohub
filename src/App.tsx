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

  // Helper to apply incoming stats to state
  const applyStats = (data: any) => {
    if (!data) return;
    const { twitch, tiktok, instagram, youtube, discord, whatsapp } = data;

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
  };

  // Immediate fetch via REST
  const fetchFollowersNow = async () => {
    if (!isMountedRef.current) return;
    setIsSyncing(true);

    try {
      const response = await fetch('/api/followers');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          applyStats(json.data);
          setIsSyncing(false);
          return;
        }
      }
    } catch {
      // Fallback to client-side public API
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

    setIsSyncing(false);
  };

  // Instant real-time updates via Server-Sent Events (SSE) + fast polling
  useEffect(() => {
    isMountedRef.current = true;
    fetchFollowersNow();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/followers/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          applyStats(data);
        } catch {
          // Ignore parse errors
        }
      };
      eventSource.onerror = () => {
        // Fallback gracefully to short polling if SSE disconnects
      };
    } catch {
      // Fallback if EventSource not supported
    }

    // High-frequency live polling interval (every 1.5 seconds) ensuring continuous instant updates
    const pollInterval = setInterval(() => {
      fetchFollowersNow();
    }, 1500);

    return () => {
      isMountedRef.current = false;
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  const totalFollowers = socials.reduce((acc, curr) => acc + curr.followers, 0);

  return (
    <div className="min-h-screen text-[#e0f8ff] flex flex-col font-sans selection:bg-[#537895] selection:text-white relative">
      {/* kewisito.com official fondo.png artwork background */}
      <div className="kewisito-bg" />
      {/* kewisito.com cosmic animated gradient overlay */}
      <div className="kewisito-gradient-overlay" />

      {/* Top Navbar */}
      <Header isLiveUpdating={true} lastUpdated={lastSyncTime} />

      {/* Mobile Tab Switcher (Visible on small screens only) */}
      <div className="lg:hidden px-4 pt-3.5 z-10">
        <div className="grid grid-cols-2 p-1 bg-[rgba(0,0,0,0.5)] backdrop-blur-md rounded-full border-2 border-[rgba(224,248,255,0.6)] shadow-[0_0_15px_rgba(83,120,149,0.5)]">
          <button
            type="button"
            onClick={() => setMobileTab('redes')}
            className={`py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'redes'
                ? 'bg-[rgba(83,120,149,0.7)] text-white shadow-[0_0_10px_#537895]'
                : 'text-[#e0f8ff]/70 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>REDES & SEGUIDORES</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('directo')}
            className={`py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'directo'
                ? 'bg-[rgba(145,70,255,0.7)] text-white shadow-[0_0_10px_#9146ff]'
                : 'text-[#e0f8ff]/70 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>DIRECTO TWITCH</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Faithfully implements user wireframe */}
      <main className="relative z-10 flex-1 max-w-[1520px] w-full mx-auto p-4 sm:p-6 lg:p-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: "REDES" */}
          {/* ======================================================== */}
          <section
            className={`lg:col-span-4 xl:col-span-4 flex flex-col gap-4 ${
              mobileTab === 'directo' ? 'hidden lg:flex' : 'flex'
            }`}
            aria-label="Redes Sociales de Kewisito"
          >
            {/* Column Header: "REDES" (Clean: removed "tiempo real") */}
            <div className="flex items-center gap-2.5 pb-1">
              <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#537895] to-[#302b63] shadow-[0_0_10px_#537895]" />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#e0f8ff] tracking-wider uppercase kewisito-glow-text">
                REDES
              </h2>
            </div>

            {/* List of social media casillas in kewisito.com pill style */}
            <div className="flex flex-col gap-3">
              {socials.map((net) => (
                <SocialCard
                  key={net.id}
                  network={net}
                  totalFollowers={totalFollowers}
                />
              ))}
            </div>

            {/* Bottom Section: "total seguidores" in kewisito.com glass card style */}
            <div className="mt-2">
              <TotalFollowersCard
                socials={socials}
                isSyncing={isSyncing}
              />
            </div>
          </section>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: "directo" (Expanded) */}
          {/* ======================================================== */}
          <section
            className={`lg:col-span-8 xl:col-span-8 flex flex-col gap-4 h-full ${
              mobileTab === 'redes' ? 'hidden lg:flex' : 'flex'
            }`}
            aria-label="Directo de Twitch"
          >
            {/* Column Header: "directo" (Clean: removed "kewisitotv en Twitch") */}
            <div className="flex items-center gap-2.5 pb-1">
              <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-red-500 to-purple-600 shadow-[0_0_10px_#ef4444]" />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#e0f8ff] tracking-wider uppercase kewisito-glow-text">
                directo
              </h2>
            </div>

            {/* Twitch Player Container in kewisito.com glass card style */}
            <div className="flex-1">
              <TwitchPlayer
                channel="kewisitotv"
                isLive={streamInfo.isLive}
                streamTitle={streamInfo.title}
                gameName={streamInfo.game}
              />
            </div>

            {/* Bottom Info Cards in kewisito.com style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-[rgba(0,0,0,0.45)] backdrop-blur-md border-2 border-[rgba(224,248,255,0.5)] shadow-[inset_0_0_10px_rgba(83,120,149,0.4),0_0_15px_rgba(48,43,99,0.4)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#a5b4fc]">
                  Canal Principal
                </span>
                <p className="text-base font-bold text-white mt-0.5">
                  twitch.tv/kewisitotv
                </p>
                <p className="text-xs text-[#e0f8ff]/70 mt-1">
                  Transmisión oficial de Kewisito en Twitch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[rgba(0,0,0,0.45)] backdrop-blur-md border-2 border-[rgba(224,248,255,0.5)] shadow-[inset_0_0_10px_rgba(83,120,149,0.4),0_0_15px_rgba(48,43,99,0.4)]">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Comunidad en Vivo
                </span>
                <p className="text-base font-bold text-white mt-0.5">
                  {new Intl.NumberFormat('es-ES').format(totalFollowers)} seguidores
                </p>
                <p className="text-xs text-[#e0f8ff]/70 mt-1">
                  Actualización constante en tiempo real.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[rgba(0,0,0,0.45)] backdrop-blur-md border-2 border-[rgba(224,248,255,0.5)] shadow-[inset_0_0_10px_rgba(83,120,149,0.4),0_0_15px_rgba(48,43,99,0.4)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#a5b4fc]">
                  Hub Comunitario
                </span>
                <p className="text-base font-bold text-white mt-0.5">
                  Discord & WhatsApp
                </p>
                <p className="text-xs text-[#e0f8ff]/70 mt-1">
                  Avisos inmediatos de directos y novedades.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
