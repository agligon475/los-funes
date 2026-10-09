import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ArrowRight } from 'lucide-react';

export default function SplashLoader() {
  const { loading } = useApp();
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  const handleClose = () => {
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
    }, 300);
  };

  useEffect(() => {
    // Si terminó de cargar, dejamos ver el splash brevemente
    if (!loading) {
      const timer = setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => {
          setVisible(false);
        }, 500); // Duración de la animación fade-out
      }, 1400);

      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setFadingOut(false);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6 select-none transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Botón flotante superior para cerrar / omitir splash */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-full border border-slate-700/80 text-xs font-bold backdrop-blur-md active:scale-95 transition-all shadow-xl cursor-pointer"
        title="Cerrar Splash"
      >
        <span>Cerrar</span>
        <X className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      {/* Top subtle badge */}
      <div className="pt-safe text-center">
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500/80">
          Suite Truco • Los Funes
        </span>
      </div>

      {/* Center: Splash Image with subtle pulse */}
      <div className="flex flex-col items-center justify-center max-w-xs w-full px-4 my-auto space-y-4">
        <div className="relative animate-pulse duration-1000">
          <img
            src="/splash.png"
            alt="Juntada Funes"
            className="w-72 max-h-[50vh] object-contain drop-shadow-[0_0_35px_rgba(245,158,11,0.25)]"
          />
        </div>

        {/* Botón directo para ingresar sin esperar */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full max-w-[200px] py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-glow-gold flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
        >
          <span>Entrar a Jugar</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="pb-safe flex flex-col items-center space-y-2.5 w-full max-w-[200px]">
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
