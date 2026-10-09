import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Shield,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Trash2,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function EquiposView() {
  const {
    jugadores,
    equipos,
    handleAddEquipo,
    handleTogglePresente,
    showToast
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Present players
  const presentPlayers = jugadores.filter(j => j.presente);

  // Parse teams with their members and status
  const parsedTeams = equipos.map(eq => {
    const rawMembers = eq.integrantes
      ? eq.integrantes.split('/').map(m => m.trim()).filter(Boolean)
      : [];

    const memberDetails = rawMembers.map(name => {
      const found = jugadores.find(j => j.nombre.toLowerCase() === name.toLowerCase());
      return {
        name,
        present: found ? found.presente : false,
        playerObj: found
      };
    });

    const presentCount = memberDetails.filter(m => m.present).length;

    return {
      ...eq,
      members: memberDetails,
      presentCount,
      missingCount: Math.max(0, 3 - presentCount),
      isComplete: presentCount >= 3
    };
  });

  // Free / Unassigned present players
  const assignedPresentNames = parsedTeams.flatMap(t =>
    t.members.filter(m => m.present).map(m => m.name.toLowerCase())
  );

  const freePlayers = presentPlayers.filter(
    j => !assignedPresentNames.includes(j.nombre.toLowerCase())
  );

  // Auto-fill incomplete teams using free players
  const handleAutoCompleteTeams = () => {
    if (freePlayers.length === 0) {
      showToast('No hay jugadores libres disponibles para asignar', 'warning');
      return;
    }

    let availableFree = [...freePlayers];
    let updatedTeams = [...parsedTeams];
    let totalAssigned = 0;

    for (let eq of updatedTeams) {
      while (eq.members.length < 3 && availableFree.length > 0) {
        const playerToAssign = availableFree.shift();
        eq.members.push({
          name: playerToAssign.nombre,
          present: true,
          playerObj: playerToAssign
        });
        totalAssigned++;
      }
    }

    // Save updated teams into state/cache
    const savedList = updatedTeams.map(t => ({
      ...t,
      integrantes: t.members.map(m => m.name).join(' / ')
    }));

    try {
      localStorage.setItem('funes_equipos', JSON.stringify(savedList));
      window.location.reload(); // Quick refresh to sync all views
    } catch (e) {
      console.warn(e);
    }

    showToast(`⚡ ¡Se asignaron ${totalAssigned} jugadores libres a los tríos!`, 'success');
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const ok = await handleAddEquipo({
      nombre: newTeamName.trim(),
      integrantes: selectedMembers.join(' / ')
    });

    if (ok) {
      setNewTeamName('');
      setSelectedMembers([]);
      setShowCreateModal(false);
      showToast(`Equipo "${newTeamName}" creado con éxito`, 'success');
    }
  };

  const toggleMemberSelection = (name) => {
    if (selectedMembers.includes(name)) {
      setSelectedMembers(prev => prev.filter(n => n !== name));
    } else {
      if (selectedMembers.length >= 3) {
        showToast('Los equipos son de máximo 3 integrantes', 'warning');
        return;
      }
      setSelectedMembers(prev => [...prev, name]);
    }
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 border border-slate-700 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="font-heading font-black text-lg text-white">
              Gestión de Equipos (Tríos 3v3)
            </h2>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1 shadow-glow-gold active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Trío</span>
          </button>
        </div>

        <p className="text-xs text-slate-300">
          En Los Funes los equipos se conforman de a <strong>3 jugadores</strong>. Si a un equipo le falta alguno que no vino, podés autocompletarlo con los jugadores libres de la juntada.
        </p>

        {/* Action Button: Auto-fill */}
        <button
          onClick={handleAutoCompleteTeams}
          disabled={freePlayers.length === 0}
          className="w-full min-h-[46px] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Autocompletar Tríos con Jugadores Libres ({freePlayers.length} disp.)</span>
        </button>
      </div>

      {/* Free / Unassigned Players Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Users className="w-4 h-4" />
            <span>Banquillo de Libres ({freePlayers.length})</span>
          </span>
          <span className="text-[11px] text-slate-400">Sin equipo fijo</span>
        </div>

        {freePlayers.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            No hay jugadores libres en este momento. Todos los presentes tienen equipo asignado.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {freePlayers.map(j => (
              <span
                key={j.id}
                className="bg-slate-950 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1.5"
              >
                <span>{j.nombre}</span>
                {j.alias && <span className="text-[10px] text-amber-400">({j.alias})</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Teams Grid */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-sm text-slate-300 uppercase tracking-wider px-1">
          Tríos Registrados ({parsedTeams.length})
        </h3>

        {parsedTeams.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-bold text-sm">No hay equipos registrados aún</p>
            <p className="text-slate-500 text-xs mt-1">
              Tocá "+ Trío" o animate a inscribir jugadores con su equipo.
            </p>
          </div>
        ) : (
          parsedTeams.map((eq) => (
            <div
              key={eq.id}
              className={`rounded-2xl border p-3.5 space-y-2.5 transition-all shadow-md ${
                eq.isComplete
                  ? 'bg-slate-900 border-emerald-500/40'
                  : 'bg-slate-950 border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <h4 className="font-heading font-black text-sm text-white">
                    {eq.nombre}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    eq.isComplete
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {eq.presentCount}/3 Presentes {eq.missingCount > 0 ? `(Falta ${eq.missingCount})` : 'Completo'}
                </span>
              </div>

              {/* Members Slots (up to 3) */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[0, 1, 2].map((slotIdx) => {
                  const member = eq.members[slotIdx];

                  if (member) {
                    return (
                      <div
                        key={slotIdx}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          member.present
                            ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500 font-medium opacity-60'
                        }`}
                      >
                        <p className="truncate text-xs">{member.name}</p>
                        <span className="text-[9px] block uppercase mt-0.5">
                          {member.present ? '✅ Vino' : '❌ Faltó'}
                        </span>
                      </div>
                    );
                  }

                  // Empty Slot
                  return (
                    <div
                      key={slotIdx}
                      className="p-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center flex flex-col items-center justify-center text-slate-500"
                    >
                      <span className="text-[10px] font-bold">Vacante</span>
                      <span className="text-[9px] text-amber-500/80">Libre para suplente</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Crear Trío */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-base">Crear Equipo de 3</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombre del Trío / Equipo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Los Tahures de Funes"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Seleccionar hasta 3 integrantes ({selectedMembers.length}/3):
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                  {jugadores.length === 0 ? (
                    <p className="text-slate-500 text-[11px] p-2">No hay jugadores registrados.</p>
                  ) : (
                    jugadores.map((j) => {
                      const isSelected = selectedMembers.includes(j.nombre);
                      return (
                        <div
                          key={j.id}
                          onClick={() => toggleMemberSelection(j.nombre)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <span className="font-bold">{j.nombre}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTeamName.trim()}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-glow-gold"
                >
                  Guardar Trío
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
