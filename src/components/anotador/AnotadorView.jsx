import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import PorotosVisualizer from './PorotosBox';
import {
  Trophy,
  RotateCcw,
  Save,
  Check,
  Flame,
  Plus,
  Minus,
  Sparkles,
  Edit2,
  Swords,
  Undo2
} from 'lucide-react';

export default function AnotadorView() {
  const { handleSavePartido, anotadorPreload, setAnotadorPreload, syncing } = useApp();

  // Match settings
  const [maxScore, setMaxScore] = useState(30); // 15 o 30
  const [equipoNosotros, setEquipoNosotros] = useState('Nosotros');
  const [equipoEllos, setEquipoEllos] = useState('Ellos');
  const [torneoId, setTorneoId] = useState('Amistoso');
  const [faseMatch, setFaseMatch] = useState('Fase Regular');

  // Scores
  const [puntosNosotros, setPuntosNosotros] = useState(0);
  const [puntosEllos, setPuntosEllos] = useState(0);
  
  // History for Undo
  const [history, setHistory] = useState([]);
  
  // Match End State
  const [winner, setWinner] = useState(null); // 'nosotros' | 'ellos' | null
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Preload from Torneo if triggered
  useEffect(() => {
    if (anotadorPreload) {
      if (anotadorPreload.equipoNosotros) setEquipoNosotros(anotadorPreload.equipoNosotros);
      if (anotadorPreload.equipoEllos) setEquipoEllos(anotadorPreload.equipoEllos);
      if (anotadorPreload.idTorneo) setTorneoId(anotadorPreload.idTorneo);
      if (anotadorPreload.fase) setFaseMatch(anotadorPreload.fase);
      if (anotadorPreload.maxScore) setMaxScore(anotadorPreload.maxScore);

      // Reset scores for new match
      setPuntosNosotros(0);
      setPuntosEllos(0);
      setWinner(null);
      setHistory([]);
    }
  }, [anotadorPreload]);

  // Check victory condition
  useEffect(() => {
    if (!winner) {
      if (puntosNosotros >= maxScore) {
        setWinner('nosotros');
        triggerVictoryConfetti();
      } else if (puntosEllos >= maxScore) {
        setWinner('ellos');
        triggerVictoryConfetti();
      }
    }
  }, [puntosNosotros, puntosEllos, maxScore, winner]);

  const triggerVictoryConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ffffff']
      });
    } catch (e) {
      // safe fallback
    }
  };

  const addPoints = (team, delta) => {
    if (winner) return;

    setHistory(prev => [...prev, { puntosNosotros, puntosEllos }]);

    if (team === 'nosotros') {
      setPuntosNosotros(prev => Math.min(Math.max(0, prev + delta), maxScore));
    } else {
      setPuntosEllos(prev => Math.min(Math.max(0, prev + delta), maxScore));
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setPuntosNosotros(last.puntosNosotros);
    setPuntosEllos(last.puntosEllos);
    setHistory(prev => prev.slice(0, -1));
    setWinner(null);
  };

  const handleReset = () => {
    setPuntosNosotros(0);
    setPuntosEllos(0);
    setWinner(null);
    setHistory([]);
    setShowResetConfirm(false);
  };

  const handleSaveAndReset = async () => {
    const ganadorNombre = winner === 'nosotros' ? equipoNosotros : equipoEllos;

    const partidoData = {
      id_partido: `P-${Date.now().toString().slice(-5)}`,
      id_torneo: torneoId,
      fecha: new Date().toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      equipo_nosotros: equipoNosotros,
      equipo_ellos: equipoEllos,
      puntos_nosotros: puntosNosotros,
      puntos_ellos: puntosEllos,
      ganador: ganadorNombre,
      fase: faseMatch
    };

    const ok = await handleSavePartido(partidoData);
    if (ok) {
      handleReset();
      setAnotadorPreload(null);
    }
  };

  return (
    <div className="pb-24 pt-3 px-3 max-w-md mx-auto space-y-3.5 select-none">
      {/* Top Match Bar: Max score selector & Reset button */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-md">
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              if (puntosNosotros === 0 && puntosEllos === 0) setMaxScore(15);
              else if (confirm('¿Cambiar a 15 tantos y reiniciar tanteador?')) {
                setMaxScore(15);
                handleReset();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              maxScore === 15
                ? 'bg-amber-500 text-slate-950 shadow-glow-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            A 15 Tantos
          </button>
          <button
            onClick={() => {
              if (puntosNosotros === 0 && puntosEllos === 0) setMaxScore(30);
              else if (confirm('¿Cambiar a 30 tantos y reiniciar tanteador?')) {
                setMaxScore(30);
                handleReset();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              maxScore === 30
                ? 'bg-amber-500 text-slate-950 shadow-glow-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            A 30 Tantos
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            title="Deshacer último punto"
            className="p-2 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl border border-slate-700/60 active:scale-95 transition-all"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reiniciar tanteador"
            className="p-2 bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-xl border border-slate-700/60 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Torneo / Fase Tag if preloaded */}
      {torneoId !== 'Amistoso' && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-amber-300">
          <span className="font-bold flex items-center space-x-1">
            <Swords className="w-3.5 h-3.5" />
            <span>{torneoId}</span>
          </span>
          <span className="font-semibold uppercase text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">
            {faseMatch}
          </span>
        </div>
      )}

      {/* Main Truco Scoreboard Table (Green Felt) */}
      <div className="rounded-3xl bg-truco-felt border-2 border-emerald-700/50 p-3.5 shadow-2xl relative overflow-hidden">
        {/* Subtle wood / border styling */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

        {/* Team Names Header */}
        <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-emerald-600/30">
          {/* Team 1: Nosotros */}
          <div className="text-center">
            {isEditingNames ? (
              <input
                type="text"
                value={equipoNosotros}
                onChange={(e) => setEquipoNosotros(e.target.value)}
                className="w-full bg-slate-900 text-center font-black text-amber-400 border border-amber-500/50 rounded-lg py-1 text-sm focus:outline-none"
              />
            ) : (
              <div
                onClick={() => setIsEditingNames(true)}
                className="flex items-center justify-center space-x-1 cursor-pointer group"
              >
                <h3 className="font-heading font-black text-base text-amber-300 tracking-tight truncate max-w-[140px]">
                  {equipoNosotros}
                </h3>
                <Edit2 className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100 shrink-0" />
              </div>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
              Mano / Local
            </span>
          </div>

          {/* Team 2: Ellos */}
          <div className="text-center">
            {isEditingNames ? (
              <input
                type="text"
                value={equipoEllos}
                onChange={(e) => setEquipoEllos(e.target.value)}
                className="w-full bg-slate-900 text-center font-black text-rose-300 border border-rose-500/50 rounded-lg py-1 text-sm focus:outline-none"
              />
            ) : (
              <div
                onClick={() => setIsEditingNames(true)}
                className="flex items-center justify-center space-x-1 cursor-pointer group"
              >
                <h3 className="font-heading font-black text-base text-rose-300 tracking-tight truncate max-w-[140px]">
                  {equipoEllos}
                </h3>
                <Edit2 className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100 shrink-0" />
              </div>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
              Rival / Visita
            </span>
          </div>
        </div>

        {isEditingNames && (
          <div className="text-center mb-2">
            <button
              onClick={() => setIsEditingNames(false)}
              className="text-[11px] font-bold bg-emerald-600 text-white px-3 py-0.5 rounded-full"
            >
              Guardar Nombres
            </button>
          </div>
        )}

        {/* Big Score Displays */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Score Nosotros */}
          <div className="flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md rounded-2xl border border-amber-500/40 p-3 shadow-inner">
            <span className="text-6xl font-black font-mono tracking-tighter text-amber-400 leading-none drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
              {puntosNosotros}
            </span>
            <span className="text-[11px] font-bold text-amber-200/70 mt-1 uppercase tracking-wider">
              {maxScore === 30
                ? puntosNosotros <= 15
                  ? 'Malas'
                  : 'Buenas'
                : 'Tantos'}
            </span>
          </div>

          {/* Score Ellos */}
          <div className="flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md rounded-2xl border border-rose-500/40 p-3 shadow-inner">
            <span className="text-6xl font-black font-mono tracking-tighter text-rose-400 leading-none drop-shadow-[0_2px_10px_rgba(244,63,94,0.5)]">
              {puntosEllos}
            </span>
            <span className="text-[11px] font-bold text-rose-200/70 mt-1 uppercase tracking-wider">
              {maxScore === 30
                ? puntosEllos <= 15
                  ? 'Malas'
                  : 'Buenas'
                : 'Tantos'}
            </span>
          </div>
        </div>

        {/* Authentic Porotos / Fósforos Visualizers */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <PorotosVisualizer score={puntosNosotros} maxScore={maxScore} />
          <PorotosVisualizer score={puntosEllos} maxScore={maxScore} />
        </div>

        {/* Tactile Quick Add Buttons (Min 48px high for thumb-friendly mobile play) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Buttons Nosotros */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => addPoints('nosotros', 1)}
                disabled={Boolean(winner)}
                className="min-h-[48px] bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center border border-amber-400/80"
              >
                +1
              </button>
              <button
                onClick={() => addPoints('nosotros', 2)}
                disabled={Boolean(winner)}
                className="min-h-[48px] bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex flex-col items-center justify-center border border-amber-400/80 leading-tight"
              >
                <span className="text-sm">+2</span>
                <span className="text-[9px] font-bold opacity-80">Envido</span>
              </button>
              <button
                onClick={() => addPoints('nosotros', 3)}
                disabled={Boolean(winner)}
                className="min-h-[48px] bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex flex-col items-center justify-center border border-amber-400/80 leading-tight"
              >
                <span className="text-sm">+3</span>
                <span className="text-[9px] font-bold opacity-80">Truco</span>
              </button>
            </div>
            <button
              onClick={() => addPoints('nosotros', -1)}
              disabled={Boolean(winner) || puntosNosotros === 0}
              className="w-full min-h-[40px] bg-slate-900/90 hover:bg-slate-800 active:scale-95 disabled:opacity-40 text-rose-400 font-bold text-xs rounded-xl border border-slate-700/80 transition-all flex items-center justify-center space-x-1"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Restar 1</span>
            </button>
          </div>

          {/* Buttons Ellos */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => addPoints('ellos', 1)}
                disabled={Boolean(winner)}
                className="min-h-[48px] bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center border border-rose-400/80"
              >
                +1
              </button>
              <button
                onClick={() => addPoints('ellos', 2)}
                disabled={Boolean(winner)}
                className="min-h-[48px] bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex flex-col items-center justify-center border border-rose-400/80 leading-tight"
              >
                <span className="text-sm">+2</span>
                <span className="text-[9px] font-bold opacity-80">Envido</span>
              </button>
              <button
                onClick={() => addPoints('ellos', 3)}
                disabled={Boolean(winner)}
                className="min-h-[48px] bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex flex-col items-center justify-center border border-rose-400/80 leading-tight"
              >
                <span className="text-sm">+3</span>
                <span className="text-[9px] font-bold opacity-80">Truco</span>
              </button>
            </div>
            <button
              onClick={() => addPoints('ellos', -1)}
              disabled={Boolean(winner) || puntosEllos === 0}
              className="w-full min-h-[40px] bg-slate-900/90 hover:bg-slate-800 active:scale-95 disabled:opacity-40 text-rose-400 font-bold text-xs rounded-xl border border-slate-700/80 transition-all flex items-center justify-center space-x-1"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Restar 1</span>
            </button>
          </div>
        </div>
      </div>

      {/* Victory Banner when reaching 15 or 30 points */}
      {winner && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-5 shadow-2xl text-slate-950 space-y-3.5 border-2 border-amber-300 animate-in zoom-in-95 duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-amber-400 shadow-xl shrink-0">
              <Trophy className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
                <Sparkles className="w-4 h-4" />
                <span>¡Partido Finalizado!</span>
              </div>
              <h3 className="font-heading font-black text-2xl tracking-tight leading-tight text-white drop-shadow">
                Ganó {winner === 'nosotros' ? equipoNosotros : equipoEllos}
              </h3>
              <p className="text-xs font-bold text-slate-900/90">
                Marcador final: {puntosNosotros} a {puntosEllos} (a {maxScore} tantos)
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col space-y-2">
            <button
              onClick={handleSaveAndReset}
              disabled={syncing}
              className="w-full min-h-[50px] bg-slate-950 hover:bg-slate-900 text-amber-400 font-black rounded-xl text-sm shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-all border border-amber-400/40"
            >
              <Save className="w-4 h-4" />
              <span>{syncing ? 'Guardando en Planilla...' : 'Guardar Resultado en Google Sheets'}</span>
            </button>
            <button
              onClick={handleReset}
              className="w-full py-2 bg-amber-700/30 hover:bg-amber-700/50 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Reiniciar sin guardar
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-400">
              <RotateCcw className="w-5 h-5" />
              <h3 className="font-heading font-bold text-base text-white">¿Reiniciar tanteador?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Se pondrán en 0 los puntos de ambos equipos. El resultado actual no quedará registrado.
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
