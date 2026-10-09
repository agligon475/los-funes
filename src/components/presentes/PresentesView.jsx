import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, UserPlus, Users2, Search, CheckCircle2, Circle, Flame, Sparkles, X, Plus } from 'lucide-react';

export default function PresentesView() {
  const {
    jugadores,
    handleTogglePresente,
    handleAddJugador,
    handleAddEquipo,
    presentesCount,
    loading
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('todos'); // 'todos' | 'presentes' | 'ausentes'
  
  // Modals state
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  // Form states
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAlias, setNewPlayerAlias] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState('');

  // Filtered players
  const filteredJugadores = useMemo(() => {
    return jugadores.filter(j => {
      const matchSearch =
        j.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.alias && j.alias.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchSearch) return false;
      if (filter === 'presentes') return j.presente;
      if (filter === 'ausentes') return !j.presente;
      return true;
    });
  }, [jugadores, searchTerm, filter]);

  const onAddPlayerSubmit = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const ok = await handleAddJugador({
      nombre: newPlayerName.trim(),
      alias: newPlayerAlias.trim(),
      presente: true
    });
    if (ok) {
      setNewPlayerName('');
      setNewPlayerAlias('');
      setShowAddPlayerModal(false);
    }
  };

  const onAddTeamSubmit = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const ok = await handleAddEquipo({
      nombre: newTeamName.trim(),
      integrantes: newTeamMembers.trim()
    });
    if (ok) {
      setNewTeamName('');
      setNewTeamMembers('');
      setShowAddTeamModal(false);
    }
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Banner / Hero Counter */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-truco-feltLight to-truco-feltDark border border-emerald-600/30 p-5 shadow-xl">
        <div className="absolute -right-4 -bottom-4 text-emerald-800/20 font-black text-8xl select-none pointer-events-none">
          ♠
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Juntada en Funes</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Lista de Presentes
            </h2>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Marcá quién vino para sortear parejas y armar el fixture
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md rounded-2xl border border-emerald-500/30 px-4 py-2.5 shadow-inner">
            <span className="text-3xl font-black text-amber-400 leading-none">
              {presentesCount}
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-300 tracking-wider mt-1">
              {presentesCount === 1 ? 'Presente' : 'Presentes'}
            </span>
          </div>
        </div>

        {/* Quick hint for tournaments */}
        <div className="mt-4 pt-3 border-t border-emerald-600/20 flex items-center justify-between text-xs">
          <span className="text-emerald-100/90 font-medium">
            {presentesCount >= 4
              ? `🔥 Hay quórum (${presentesCount} listos para jugar)`
              : `⚠️ Hacen falta al menos 4 jugadores (van ${presentesCount})`}
          </span>
          <span className="text-amber-400 font-bold text-[11px] bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            Total: {jugadores.length}
          </span>
        </div>
      </div>

      {/* Quick Action Buttons (Add Player & Team) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowAddPlayerModal(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black py-2.5 px-3 rounded-xl shadow-glow-gold active:scale-95 transition-all text-xs"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Agregar Jugador</span>
        </button>
        <button
          onClick={() => setShowAddTeamModal(true)}
          className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold py-2.5 px-3 rounded-xl active:scale-95 transition-all text-xs"
        >
          <Users2 className="w-4 h-4 text-amber-400" />
          <span>+ Agregar Equipo</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o apodo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex space-x-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'todos', label: `Todos (${jugadores.length})` },
            { id: 'presentes', label: `Presentes (${presentesCount})` },
            { id: 'ausentes', label: `Ausentes (${jugadores.length - presentesCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                filter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Players List with optimistic checkboxes */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredJugadores.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Users2 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-bold text-sm">No se encontraron jugadores</p>
            <p className="text-slate-500 text-xs mt-1">Probá con otro término o agregá uno nuevo</p>
          </div>
        ) : (
          filteredJugadores.map((jugador) => {
            const isPresent = jugador.presente;

            return (
              <div
                key={jugador.id}
                onClick={() => handleTogglePresente(jugador.id, isPresent)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.98] select-none min-h-[58px] ${
                  isPresent
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm hover:border-emerald-500/60'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80 opacity-75'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Large tactile checkbox */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                      isPresent
                        ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald scale-105'
                        : 'bg-slate-800 text-transparent border border-slate-700'
                    }`}
                  >
                    <Check className={`w-5 h-5 stroke-[3] ${isPresent ? 'opacity-100' : 'opacity-0'}`} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-bold truncate ${isPresent ? 'text-white' : 'text-slate-400'}`}>
                        {jugador.nombre}
                      </h4>
                      {jugador.alias && (
                        <span className="text-[11px] text-amber-400/90 font-medium px-1.5 py-0.2 bg-amber-500/10 rounded border border-amber-500/20 shrink-0">
                          {jugador.alias}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {jugador.partidos_jugados > 0
                        ? `${jugador.partidos_ganados}G / ${jugador.partidos_jugados}PJ • ${Math.round((jugador.partidos_ganados / jugador.partidos_jugados) * 100)}% efect.`
                        : 'Sin partidos registrados'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right pl-2">
                  <span
                    className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                      isPresent
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {isPresent ? 'Presente' : 'Ausente'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Compact Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40 max-w-md">
        <button
          onClick={() => setShowAddPlayerModal(true)}
          title="Agregar nuevo jugador"
          className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black shadow-glow-gold flex items-center justify-center active:scale-90 transition-all border-2 border-amber-300"
        >
          <UserPlus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Modal: Agregar Jugador */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-base text-white">Nuevo Jugador</h3>
              </div>
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onAddPlayerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombre Completo / Apodo principal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Marcelo"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Alias de Truco (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: El Siete Bravo"
                  value={newPlayerAlias}
                  onChange={(e) => setNewPlayerAlias(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-glow-gold"
                >
                  Guardar y Presente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agregar Equipo */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-base text-white">Nuevo Equipo</h3>
              </div>
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onAddTeamSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombre del Equipo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Los Invictos de Funes"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Integrantes (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Agus / Santi"
                  value={newTeamMembers}
                  onChange={(e) => setNewTeamMembers(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-glow-gold"
                >
                  Registrar Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
