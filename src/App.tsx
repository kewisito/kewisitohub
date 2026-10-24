import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Users,
  Radio,
  Image as ImageIcon,
  X,
  Activity,
  Bell,
  BellRing,
  Zap,
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

  // Trigger live transition alert (both in-app toast + browser notification + audio chime)
  const triggerLiveAlert = (title?: string, game?: string) => {
    // 1. Play broadcast chime
    playBroadcastChime();

    // 2. Set in-app toast notification
    setToast({
      id: `live-${Date.now()}`,
      channel: 'kewisitotv',
      title: title || '¡Kewisito acaba de iniciar transmisión en Twitch!',
      game: game || 'Just Chatting',
    });

    // 3. Native Browser Notification (if supported & allowed)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification('🔴 ¡KEWISITO ESTÁ EN DIRECTO!', {
            body: `${title || 'Transmisión en vivo en Twitch'} ${
              game ? `· ${game}` : ''
            }`,
            icon: '/assets/aistudio/imagen_49e2f78e.png',
            tag: 'kewisito-live-stream',
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

  // Request native browser notifications permission
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotificationAllowed(permission === 'granted');
        if (permission === 'granted') {
          // Play a small confirmation chime
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

            // STATUS TRANSITION DETECTION: alert when changing from 'offline' to 'live'
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

  const handleWatchNow = () => {
    setMobileTab('directo');
    if (streamSectionRef.current) {
      streamSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

          <div className="flex items-center gap-2.5 sm:gap-3 text-slate-500 text-[11px]">
            {/* Native browser notifications permission toggle */}
            <button
              type="button"
              onClick={requestNotificationPermission}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                browserNotificationAllowed
                  ? 'bg-lime-950/40 text-lime-400 border-lime-500/40'
                  : 'bg-[#121520] text-slate-400 border-slate-800 hover:text-white'
              }`}
              title={
                browserNotificationAllowed
                  ? 'Notificaciones de navegador activadas'
                  : 'Activar alertas del navegador al iniciar directo'
              }
            >
              {browserNotificationAllowed ? (
                <BellRing className="w-3 h-3 text-lime-400" />
              ) : (
                <Bell className="w-3 h-3 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {browserNotificationAllowed ? 'ALERTAS: ACTIVAS' : 'ACTIVAR ALERTAS'}
              </span>
            </button>

            {/* Test alert trigger for simulation */}
            <button
              type="button"
              onClick={() =>
                triggerLiveAlert(
                  '¡PROBANDO STREAM EN VIVO! (Simulación)',
                  'Just Chatting / Valorant'
                )
              }
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/40 hover:bg-red-900/40 transition-colors cursor-pointer"
              title="Simular alerta de stream offline -> live"
            >
              <Radio className="w-3 h-3" />
              <span>PROBAR ALERTA LIVE</span>
            </button>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {lastSyncTime && (
              <span className="hidden md:inline">
                SYNC: <span className="text-slate-300 font-semibold">{lastSyncTime}</span>
              </span>
            )}

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
            ref={streamSectionRef}
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

      {/* Browser Toast Alert Notification */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
        onWatchNow={handleWatchNow}
      />

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
