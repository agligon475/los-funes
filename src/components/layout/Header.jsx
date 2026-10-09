import React, { useState } from 'react';
import { RefreshCw, ShieldAlert, Share2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { syncing, authRestricted, refreshAll, activeTab, setActiveTab } = useApp();
  const [showConfigModal, setShowConfigModal] = useState(false);

  const shareWhatsApp = () => {
    const origin = window.location.origin;
    const message = encodeURIComponent(
      `🃏 ¡Juntada de Truco de Los Funes!\nInscribite para armar parejas y seguir el torneo en vivo acá:\n${origin}/#inscribirse`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 pt-safe">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-glow-gold">
              <span className="text-slate-950 font-black text-lg tracking-tighter">♠</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-heading font-black text-lg tracking-tight text-white leading-none">
                  LOS FUNES
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                  TRUCO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Suite de Juntadas & Torneos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={shareWhatsApp}
              title="Compartir link por WhatsApp"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* SuperAdmin button */}
            <button
              onClick={() => setActiveTab(activeTab === 'admin' ? 'presentes' : 'admin')}
              title="Panel SuperAdmin"
              className={`w-9 h-9 flex items-center justify-center rounded-xl border active:scale-95 transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-glow-gold'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {authRestricted && (
              <button
                onClick={() => setShowConfigModal(true)}
                title="Aviso de configuración Google Sheets"
                className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-lg text-xs font-semibold animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Info Script</span>
              </button>
            )}

            <button
              onClick={refreshAll}
              disabled={syncing}
              aria-label="Sincronizar datos"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all border border-slate-700/60"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Modal explicativo de Apps Script si devuelve pantalla de login */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Configuración Google Apps Script</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              La API de Google Apps Script actualmente solicita inicio de sesión para peticiones directas. La aplicación está operando en <strong>Modo Local Inteligente con Caché</strong> (los datos se guardan y se sincronizan en tu dispositivo).
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <p className="font-semibold text-amber-300">Para sincronización 100% en la nube:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-400">
                <li>Abrí el proyecto en script.google.com</li>
                <li>Hacé clic en <strong>Implementar &gt; Administrar implementaciones</strong></li>
                <li>Configurá <strong>Quién tiene acceso: Cualquiera (Anyone)</strong></li>
              </ol>
            </div>
            <button
              onClick={() => setShowConfigModal(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
            >
              Entendido, continuar jugando
            </button>
          </div>
        </div>
      )}
    </>
  );
}
