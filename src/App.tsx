import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Users,
  Radio,
  Image as ImageIcon,
  X,
  RefreshCw,
  Bell,
  BellRing,
} from 'lucide-react';
import { SocialNetwork } from './types';
import { INITIAL_SOCIALS } from './data/socials';
import { SocialCard } from './components/SocialCard';
import { TotalFollowersCard } from './components/TotalFollowersCard';
import { TwitchPlayer } from './components/TwitchPlayer';
import { Header } from './components/Header';
import { ToastNotification, ToastData } from './components/ToastNotification';
import { playBroadcastChime } from './utils/audio';

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
  const [toast, setToast] = useState<ToastData | null>(null);
  const [browserNotificationAllowed, setBrowserNotificationAllowed] =
    useState<boolean>(() => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    });

  const isMountedRef = useRef(true);
  const prevIsLiveRef = useRef<boolean | null>(null);
  const streamSectionRef = useRef<HTMLDivElement>(null);

  // Trigger live alert toast + browser notification + sound chime
  const triggerLiveAlert = (title?: string, game?: string) => {
    playBroadcastChime();

    setToast({
      id: `live-${Date.now()}`,
      channel: 'kewisitotv',
      title: title || '¡Kewisito acaba de iniciar transmisión en Twitch!',
      game: game || 'Just Chatting',
    });

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification('🔴 ¡KEWISITO EN DIRECTO EN TWITCH!', {
            body: `${title || 'Transmisión oficial en vivo'} ${
              game ? `· ${game}` : ''
            }`,
            icon: '/assets/aistudio/imagen_49e2f78e.png',
            tag: 'kewisito-live-alert',
          });

          notif.onclick = () => {
            window.focus();
            handleWatchNow();
          };
        } catch (err) {
          console.warn('Native notification error', err);
        }
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotificationAllowed(permission === 'granted');
        if (permission === 'granted') {
          playBroadcastChime();
        }
      } catch (err) {
        console.error('Error requesting notification permission', err);
      }
    }
  };

  // Background real-time synchronization function
  const syncFollowers = async () => {
    if (!isMountedRef.current) return;
    setIsSyncing(true);

    try {
      // 1. Try our full-stack backend endpoint
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
            const isLiveNow = !!twitch.isLive;

            // Trigger toast alert when changing from offline to live
            if (prevIsLiveRef.current === false && isLiveNow === true) {
              triggerLiveAlert(twitch.title, twitch.game);
            }

            prevIsLiveRef.current = isLiveNow;

            setStreamInfo({
              isLive: isLiveNow,
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
      // If server route is booting or unavailable, proceed to client-side public API
    }

    // 2. Client-side fallback to decapi public API for Twitch
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
      // Ignore network errors
    }

    setLastSyncTime(new Date().toLocaleTimeString('es-ES'));
    setIsSyncing(false);
  };

  // Continuous background synchronization interval (updates constantly every 6 seconds)
  useEffect(() => {
    isMountedRef.current = true;
    syncFollowers(); // Initial immediate sync

    const intervalId = setInterval(() => {
      syncFollowers();
    }, 6000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  const totalFollowers = socials.reduce((acc, curr) => acc + curr.followers, 0);

  const handleWatchNow = () => {
    setMobileTab('directo');
    if (streamSectionRef.current) {
      streamSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Dynamic ambient cyber background glow */}
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

      {/* Sub-header / Real-time sync status strip */}
      <div className="relative z-10 border-b border-slate-800/60 bg-gradient-to-r from-purple-950/30 via-slate-900/40 to-slate-950/60 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-semibold font-mono text-[11px] sm:text-xs">
              Conectado a APIs públicas en tiempo real
            </span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-300 hidden sm:inline">
              Twitch <strong className="text-white">@kewisitotv</strong> · Redes <strong className="text-white">@kewisito</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 text-slate-400">
            {/* Notification permission button */}
            <button
              type="button"
              onClick={requestNotificationPermission}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer ${
                browserNotificationAllowed
                  ? 'bg-purple-950/50 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title={
                browserNotificationAllowed
                  ? 'Notificaciones de navegador activadas'
                  : 'Activar avisos en el navegador cuando inicie directo'
              }
            >
              {browserNotificationAllowed ? (
                <BellRing className="w-3 h-3 text-purple-400" />
              ) : (
                <Bell className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">
                {browserNotificationAllowed ? 'Alertas activas' : 'Activar alertas'}
              </span>
            </button>

            {/* Test live alert button */}
            <button
              type="button"
              onClick={() =>
                triggerLiveAlert(
                  '¡Kewisito ha iniciado directo en Twitch!',
                  'Just Chatting / Charlando con el chat'
                )
              }
              className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-950/40 border border-red-500/40 hover:bg-red-900/40 transition-colors cursor-pointer"
              title="Probar cómo luce y suena la alerta de directo"
            >
              <Radio className="w-3 h-3" />
              <span>Probar Alerta</span>
            </button>

            <span className="text-slate-600">|</span>

            {lastSyncTime && (
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                Sincronizado: {lastSyncTime}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowWireframeModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 hover:underline cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Boceto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible on small screens) */}
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
            ref={streamSectionRef}
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
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowWireframeModal(true)}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Ver boceto original
            </button>
          </div>
        </div>
      </footer>

      {/* Browser Toast Alert Notification */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
        onWatchNow={handleWatchNow}
      />

      {/* Wireframe Preview Modal */}
      {showWireframeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Boceto Original
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWireframeModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center">
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-white max-h-[60vh]">
                <img
                  src="/assets/aistudio/imagen_49e2f78e.png"
                  alt="Boceto original del diseño subido por el usuario"
                  className="max-h-[55vh] object-contain w-auto mx-auto"
                />
              </div>
              <p className="text-xs text-slate-300 text-center mt-3">
                Diseño fiel a tu boceto: Columna izquierda <strong>REDES</strong> y <strong>total seguidores</strong>, y columna derecha con tu <strong>directo</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
