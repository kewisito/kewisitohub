import React, { useEffect, useState } from 'react';
import { X, Tv, Bell, ExternalLink, Radio } from 'lucide-react';

export interface ToastData {
  id: string;
  channel: string;
  title?: string;
  game?: string;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
  onWatchNow: () => void;
  duration?: number; // ms
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
  onWatchNow,
  duration = 8000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const startTime = Date.now();
    const intervalTime = 50;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 w-full max-w-sm sm:max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
    >
      <div className="relative rounded-xl bg-[#0e111a] border-2 border-red-500/80 shadow-[0_10px_35px_rgba(239,68,68,0.35)] overflow-hidden font-mono text-slate-200">
        {/* Top Tally Beacon Banner */}
        <div className="px-3.5 py-1.5 bg-red-950/80 border-b border-red-500/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="font-bold text-red-300 tracking-widest uppercase text-[10px]">
              ALERTA DE TRANSMISIÓN // EN DIRECTO
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex items-start gap-3.5">
          {/* Avatar emblem */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-red-600 via-purple-600 to-lime-400 p-[1.5px] shrink-0 shadow-lg">
            <div className="w-full h-full rounded-[6.5px] bg-[#0c0e14] flex items-center justify-center">
              <Tv className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-display font-black text-lg text-white tracking-wide uppercase leading-tight">
                ¡KEWISITO ESTÁ EN VIVO!
              </h4>
            </div>

            <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
              {toast.title || 'Nueva transmisión iniciada en Twitch'}
            </p>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
              <span className="text-purple-400 font-bold">
                twitch.tv/{toast.channel}
              </span>
              {toast.game && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-lime-400 font-semibold truncate">
                    {toast.game}
                  </span>
                </>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onWatchNow();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded transition-all shadow-md shadow-red-950/60 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>VER DIRECTO AHORA</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs border border-slate-800 hover:border-slate-700 rounded transition-colors cursor-pointer"
              >
                DESCARTAR
              </button>
            </div>
          </div>
        </div>

        {/* Auto-dismiss progress bar */}
        <div className="h-1 w-full bg-slate-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-lime-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
