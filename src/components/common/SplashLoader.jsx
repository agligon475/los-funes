import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function SplashLoader() {
  const { loading } = useApp();
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Si terminó de cargar, dejamos ver el splash al menos 850ms para un feel premium
    if (!loading) {
      const timer = setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => {
          setVisible(false);
        }, 500); // Duración de la animación fade-out
      }, 700);

      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setFadingOut(false);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-8 select-none transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top subtle badge */}
      <div className="pt-safe text-center">
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500/80">
          Suite Truco
        </span>
      </div>

      {/* Center: Splash Image with subtle pulse */}
      <div className="flex flex-col items-center justify-center max-w-xs w-full px-4">
        <div className="relative animate-pulse duration-1000">
          <img
            src="/splash.png"
            alt="Juntada Funes"
            className="w-64 max-h-[50vh] object-contain drop-shadow-[0_0_35px_rgba(245,158,11,0.25)]"
          />
        </div>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="pb-safe flex flex-col items-center space-y-3 w-full max-w-[200px]">
        {/* Animated Gold Progress Line */}
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-indeterminate" />
        </div>
        <p className="text-[11px] font-medium tracking-wide text-slate-400">
          Mezclando el mazo...
        </p>
      </div>
    </div>
  );
}
