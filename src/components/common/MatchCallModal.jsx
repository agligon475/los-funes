import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Bell, Swords, Check, Volume2, UserCheck, ShieldCheck } from 'lucide-react';
import { playMatchCallSound } from '../../services/notifications';

export default function MatchCallModal() {
  const {
    matchCallAlert,
    setMatchCallAlert,
    startMatchFromTournament,
    currentUser
  } = useApp();

  if (!matchCallAlert || !matchCallAlert.match) return null;

  const { match, role } = matchCallAlert;

  const handleGoToScoreboard = () => {
    startMatchFromTournament({
      equipoNosotros: match.teamA.name,
      equipoEllos: match.teamB.name,
      idTorneo: match.idTorneo || 'Torneo Funes',
      fase: match.fase,
      anotador: match.anotador || 'Por definir',
      fiscalizador: match.fiscalizador || 'Por definir',
      maxScore: 30
    });
    setMatchCallAlert(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 max-w-sm w-full shadow-[0_0_50px_rgba(245,158,11,0.4)] text-white space-y-4 relative overflow-hidden">
        {/* Glow Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400">
            <span className="p-2 rounded-xl bg-amber-500/20 animate-bounce">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                ¡CANCHA LIBRE!
              </span>
              <h3 className="font-heading font-black text-base leading-none text-white">
                Próximo Cruce a la Mesa
              </h3>
            </div>
          </div>
          <button
            onClick={() => playMatchCallSound()}
            title="Sonar silbato de nuevo"
            className="p-2 bg-slate-800 rounded-xl text-slate-300 hover:text-amber-400"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* User Role Highlight */}
        {role === 'jugador' && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-2.5 text-center text-xs font-bold text-emerald-300 animate-pulse">
            🃏 ¡ATENCIÓN {currentUser?.nombre}! ¡Te toca jugar a vos!
          </div>
        )}
        {role === 'anotador' && (
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-2xl p-2.5 text-center text-xs font-bold text-amber-300">
            ✍️ ¡ATENCIÓN {currentUser?.nombre}! Te toca ANOTAR este partido.
          </div>
        )}
        {role === 'fiscalizador' && (
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-2xl p-2.5 text-center text-xs font-bold text-purple-300">
            ⚖️ ¡ATENCIÓN {currentUser?.nombre}! Te toca FISCALIZAR este partido.
          </div>
        )}

        {/* Match Details */}
        <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 space-y-2 text-center">
          <span className="text-[11px] font-black uppercase text-amber-400/90 tracking-wider">
            {match.fase}
          </span>
          <div className="flex items-center justify-between text-sm font-black">
            <span className="text-amber-300 flex-1 truncate pr-1">
              {match.teamA?.name}
            </span>
            <span className="text-slate-600 px-2 text-xs">VS</span>
            <span className="text-rose-400 flex-1 truncate pl-1">
              {match.teamB?.name}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 flex justify-between border-t border-slate-900">
            <span className="truncate pr-1">{match.teamA?.members}</span>
            <span className="truncate pl-1">{match.teamB?.members}</span>
          </div>
        </div>

        {/* Officials Assigned */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block">Anota:</span>
              <span className="font-bold text-white truncate block">
                {match.anotador || 'Por designar'}
              </span>
            </div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 block">Fiscaliza:</span>
              <span className="font-bold text-white truncate block">
                {match.fiscalizador || 'Por designar'}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleGoToScoreboard}
            className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-glow-gold flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <Swords className="w-4 h-4" />
            <span>Abrir Tanteador y Jugar</span>
          </button>
          <button
            onClick={() => setMatchCallAlert(null)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
          >
            Cerrar aviso
          </button>
        </div>
      </div>
    </div>
  );
}
