import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Users,
  History,
  Medal,
  Flame,
  Calendar,
  Percent,
  CheckCircle2,
  Swords
} from 'lucide-react';

export default function RankingsView() {
  const { jugadores, equipos, partidos } = useApp();
  const [subTab, setSubTab] = useState('jugadores'); // 'jugadores' | 'equipos' | 'historial'

  // Sort players by won matches / effectiveness / tournaments
  const sortedJugadores = [...jugadores].sort((a, b) => {
    // Priority: Torneos ganados > Partidos ganados > Efectividad
    if ((b.torneos_ganados || 0) !== (a.torneos_ganados || 0)) {
      return (b.torneos_ganados || 0) - (a.torneos_ganados || 0);
    }
    if ((b.partidos_ganados || 0) !== (a.partidos_ganados || 0)) {
      return (b.partidos_ganados || 0) - (a.partidos_ganados || 0);
    }
    const effA = a.partidos_jugados ? a.partidos_ganados / a.partidos_jugados : 0;
    const effB = b.partidos_jugados ? b.partidos_ganados / b.partidos_jugados : 0;
    return effB - effA;
  });

  // Sort teams
  const sortedEquipos = [...equipos].sort((a, b) => {
    if ((b.torneos || 0) !== (a.torneos || 0)) {
      return (b.torneos || 0) - (a.torneos || 0);
    }
    return (b.pg || 0) - (a.pg || 0);
  });

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="font-heading font-black text-xl text-white">
            Tablas & Historial
          </h2>
        </div>
      </div>

      {/* Sub tabs: Jugadores | Equipos | Historial */}
      <div className="flex space-x-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        {[
          { id: 'jugadores', label: 'Jugadores', icon: Users },
          { id: 'equipos', label: 'Equipos', icon: Swords },
          { id: 'historial', label: `Partidos (${partidos.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-glow-gold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: JUGADORES */}
      {subTab === 'jugadores' && (
        <div className="space-y-3">
          {sortedJugadores.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-bold text-sm">No hay jugadores registrados aún</p>
              <p className="text-slate-500 text-xs mt-1">
                Anotate desde la pestaña Inscribirme o agregá jugadores para armar el podio.
              </p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium Highlights */}
              {sortedJugadores.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 pt-2 pb-1 items-end">
                  {/* 2nd Place */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center flex flex-col items-center">
                    <span className="text-xl mb-1">🥈</span>
                    <span className="text-xs font-bold text-white truncate max-w-full">
                      {sortedJugadores[1].nombre}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold mt-0.5">
                      {sortedJugadores[1].partidos_ganados} PG
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {sortedJugadores[1].torneos_ganados} 🏆
                    </span>
                  </div>

                  {/* 1st Place */}
                  <div className="bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-amber-400/60 rounded-2xl p-3 text-center flex flex-col items-center shadow-glow-gold -translate-y-2">
                    <span className="text-2xl mb-1">🥇</span>
                    <span className="text-xs font-black text-amber-300 truncate max-w-full">
                      {sortedJugadores[0].nombre}
                    </span>
                    <span className="text-[11px] text-amber-400 font-black mt-0.5">
                      {sortedJugadores[0].partidos_ganados} PG
                    </span>
                    <span className="text-[10px] text-amber-200 font-bold">
                      {sortedJugadores[0].torneos_ganados} 🏆 Torneos
                    </span>
                  </div>

                  {/* 3rd Place */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center flex flex-col items-center">
                    <span className="text-xl mb-1">🥉</span>
                    <span className="text-xs font-bold text-white truncate max-w-full">
                      {sortedJugadores[2].nombre}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold mt-0.5">
                      {sortedJugadores[2].partidos_ganados} PG
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {sortedJugadores[2].torneos_ganados} 🏆
                    </span>
                  </div>
                </div>
              )}

              {/* Full Players Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="grid grid-cols-12 gap-1 px-3 py-2.5 bg-slate-950/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <span className="col-span-1 text-center">#</span>
                  <span className="col-span-5">Jugador</span>
                  <span className="col-span-2 text-center">PJ</span>
                  <span className="col-span-2 text-center">PG</span>
                  <span className="col-span-2 text-right">Efect.</span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {sortedJugadores.map((j, index) => {
                    const eff = j.partidos_jugados > 0
                      ? Math.round((j.partidos_ganados / j.partidos_jugados) * 100)
                      : 0;

                    return (
                      <div
                        key={j.id}
                        className="grid grid-cols-12 gap-1 items-center px-3 py-2.5 text-xs hover:bg-slate-800/40 transition-colors"
                      >
                        <span className="col-span-1 text-center font-bold text-slate-400">
                          {index + 1}
                        </span>
                        <div className="col-span-5 min-w-0 pr-1">
                          <p className="font-bold text-white truncate">{j.nombre}</p>
                          {j.alias && (
                            <p className="text-[10px] text-amber-400/80 truncate">{j.alias}</p>
                          )}
                        </div>
                        <span className="col-span-2 text-center font-mono text-slate-300">
                          {j.partidos_jugados || 0}
                        </span>
                        <span className="col-span-2 text-center font-mono font-bold text-emerald-400">
                          {j.partidos_ganados || 0}
                        </span>
                        <div className="col-span-2 text-right">
                          <span className="font-bold text-amber-400 text-[11px]">
                            {eff}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* SUBTAB 2: EQUIPOS */}
      {subTab === 'equipos' && (
        <div className="space-y-3">
          {sortedEquipos.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Swords className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-bold text-sm">No hay equipos registrados aún</p>
              <p className="text-slate-500 text-xs mt-1">
                Creá un equipo desde la lista de presentes o al jugar un torneo.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="grid grid-cols-12 gap-1 px-3 py-2.5 bg-slate-950/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-6">Equipo / Dupla</span>
                <span className="col-span-2 text-center">PJ</span>
                <span className="col-span-3 text-right">Torneos</span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {sortedEquipos.map((eq, index) => (
                  <div
                    key={eq.id}
                    className="grid grid-cols-12 gap-1 items-center px-3 py-2.5 text-xs hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="col-span-1 text-center font-bold text-slate-400">
                      {index + 1}
                    </span>
                    <div className="col-span-6 min-w-0 pr-1">
                      <p className="font-bold text-white truncate">{eq.nombre}</p>
                      {eq.integrantes && (
                        <p className="text-[10px] text-slate-400 truncate">{eq.integrantes}</p>
                      )}
                    </div>
                    <span className="col-span-2 text-center font-mono text-slate-300">
                      {eq.pj || 0}
                    </span>
                    <div className="col-span-3 text-right font-black text-amber-400 flex items-center justify-end space-x-1">
                      <span>{eq.torneos || 0}</span>
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: HISTORIAL DE PARTIDOS */}
      {subTab === 'historial' && (
        <div className="space-y-2.5">
          {partidos.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-900/40 rounded-2xl border border-slate-800">
              <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-bold text-sm">No hay partidos registrados aún</p>
              <p className="text-slate-500 text-xs mt-1">
                Jugá una partida en el Anotador y guardá el resultado para verlo acá.
              </p>
            </div>
          ) : (
            partidos.map((p, idx) => (
              <div
                key={p.id_partido || idx}
                className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3.5 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-1.5">
                  <span className="font-semibold text-amber-400">{p.id_torneo || 'Amistoso'}</span>
                  <span>{p.fecha}</span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Nosotros */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${p.ganador === p.equipo_nosotros ? 'text-amber-300' : 'text-slate-300'}`}>
                      {p.equipo_nosotros}
                    </p>
                  </div>

                  {/* Marcador */}
                  <div className="px-3 flex items-center space-x-2 shrink-0">
                    <span className="text-base font-black font-mono text-amber-400">
                      {p.puntos_nosotros}
                    </span>
                    <span className="text-xs text-slate-600 font-black">-</span>
                    <span className="text-base font-black font-mono text-rose-400">
                      {p.puntos_ellos}
                    </span>
                  </div>

                  {/* Ellos */}
                  <div className="flex-1 min-w-0 text-right">
                    <p className={`text-xs font-bold truncate ${p.ganador === p.equipo_ellos ? 'text-rose-300' : 'text-slate-300'}`}>
                      {p.equipo_ellos}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-slate-500">{p.fase || 'Fase Regular'}</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Ganó: {p.ganador}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
