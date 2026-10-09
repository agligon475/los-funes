import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Shuffle,
  Play,
  Users,
  Swords,
  CheckCircle,
  Crown,
  Bell,
  UserCheck,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { triggerTurnNotification, playMatchCallSound } from '../../services/notifications';

const FUNES_TEAM_NAMES = [
  'Los Bravos de Funes',
  'Envido y Flor',
  'El Siete de Espadas',
  'Quiero Vale 4',
  'Sota y Caballo',
  'Los Reyes del Pica-Pica',
  'El As Bravo',
  'Mano a Mano Funes',
  'Falta Envido',
  'Los Tahures',
];

export default function TorneosView() {
  const {
    jugadores,
    presentesCount,
    setActiveTab,
    startMatchFromTournament,
    currentTournament,
    setCurrentTournament,
    triggerNextMatchNotification,
    showToast
  } = useApp();

  const [teamSize, setTeamSize] = useState(2); // 1 (1v1), 2 (2v2), 3 (3v3)
  const [tournamentName, setTournamentName] = useState('Torneo Juntada Funes');

  // Filter only present players
  const presentPlayers = jugadores.filter(j => j.presente);

  // Calculate minimum players needed
  const minPlayersNeeded = teamSize * 2;

  const saveTournamentState = (tournament) => {
    setCurrentTournament(tournament);
  };

  // Helper to pick officials
  const pickOfficials = (teamA, teamB, allPresent) => {
    // Anotador: preferably from teamA or neutral
    const anotadorName = teamA.players?.[0]?.nombre || teamA.members.split('&')[0]?.trim() || 'Jugador A';
    // Fiscalizador: preferably from teamB or neutral
    const fiscalizadorName = teamB.players?.[0]?.nombre || teamB.members.split('&')[0]?.trim() || 'Jugador B';

    return { anotador: anotadorName, fiscalizador: fiscalizadorName };
  };

  // Shuffle & Generate Tournament
  const handleShuffleTournament = () => {
    if (presentPlayers.length < minPlayersNeeded) {
      showToast(`Hacen falta al menos ${minPlayersNeeded} jugadores presentes para ${teamSize}v${teamSize}`, 'warning');
      return;
    }

    // 1. Shuffle players using Fisher-Yates
    const shuffled = [...presentPlayers].sort(() => Math.random() - 0.5);

    // 2. Group into teams
    const teams = [];
    let pool = [...shuffled];

    let teamIdx = 0;
    while (pool.length >= teamSize) {
      const members = pool.splice(0, teamSize);
      const teamName = teamSize === 1
        ? members[0].nombre + (members[0].alias ? ` (${members[0].alias})` : '')
        : FUNES_TEAM_NAMES[teamIdx % FUNES_TEAM_NAMES.length];

      teams.push({
        id: `team-${teamIdx + 1}`,
        name: teamName,
        members: members.map(m => m.nombre).join(' & '),
        players: members
      });
      teamIdx++;
    }

    if (teams.length < 2) {
      showToast('Se necesitan al menos 2 equipos para armar el torneo', 'warning');
      return;
    }

    // 3. Generate Rounds
    let matches = [];
    const torId = `TF-${Date.now().toString().slice(-4)}`;

    if (teams.length === 2) {
      const off = pickOfficials(teams[0], teams[1], presentPlayers);
      matches.push({
        id: `M-1`,
        fase: 'Gran Final',
        teamA: teams[0],
        teamB: teams[1],
        anotador: off.anotador,
        fiscalizador: off.fiscalizador,
        winner: null,
        played: false
      });
    } else if (teams.length <= 4) {
      const off1 = pickOfficials(teams[0], teams[1], presentPlayers);
      matches.push({
        id: `M-SEM-1`,
        fase: 'Semifinal 1',
        teamA: teams[0],
        teamB: teams[1],
        anotador: off1.anotador,
        fiscalizador: off1.fiscalizador,
        winner: null,
        played: false
      });

      const off2 = teams[3] ? pickOfficials(teams[2], teams[3], presentPlayers) : { anotador: teams[2].members, fiscalizador: '-' };
      matches.push({
        id: `M-SEM-2`,
        fase: 'Semifinal 2',
        teamA: teams[2],
        teamB: teams[3] || { name: 'Libre (Bye)', members: '-' },
        anotador: off2.anotador,
        fiscalizador: off2.fiscalizador,
        winner: teams[3] ? null : teams[2],
        played: !teams[3]
      });

      matches.push({
        id: `M-FIN`,
        fase: 'Gran Final',
        teamA: null,
        teamB: null,
        anotador: 'Por designar',
        fiscalizador: 'Por designar',
        winner: null,
        played: false,
        placeholder: 'Ganador Semifinal 1 vs Semifinal 2'
      });
    } else {
      const numMatches = Math.ceil(teams.length / 2);
      for (let i = 0; i < numMatches; i++) {
        const tA = teams[i * 2];
        const tB = teams[i * 2 + 1] || null;
        const off = tB ? pickOfficials(tA, tB, presentPlayers) : { anotador: tA.members, fiscalizador: '-' };
        matches.push({
          id: `M-Q-${i + 1}`,
          fase: `Cuartos ${i + 1}`,
          teamA: tA,
          teamB: tB || { name: 'Libre (Bye)', members: '-' },
          anotador: off.anotador,
          fiscalizador: off.fiscalizador,
          winner: tB ? null : tA,
          played: !tB
        });
      }
      matches.push({
        id: `M-SEM-1`,
        fase: 'Semifinal 1',
        teamA: null,
        teamB: null,
        anotador: 'Por designar',
        fiscalizador: 'Por designar',
        winner: null,
        placeholder: 'Ganador Cuartos 1 vs Cuartos 2'
      });
      matches.push({
        id: `M-SEM-2`,
        fase: 'Semifinal 2',
        teamA: null,
        teamB: null,
        anotador: 'Por designar',
        fiscalizador: 'Por designar',
        winner: null,
        placeholder: 'Ganador Cuartos 3 vs Cuartos 4'
      });
      matches.push({
        id: `M-FIN`,
        fase: 'Gran Final',
        teamA: null,
        teamB: null,
        anotador: 'Por designar',
        fiscalizador: 'Por designar',
        winner: null,
        placeholder: 'Ganador Semifinal 1 vs Semifinal 2'
      });
    }

    const newTournament = {
      id: torId,
      name: tournamentName,
      date: new Date().toLocaleDateString('es-AR'),
      teamSize,
      totalTeams: teams.length,
      teams,
      matches,
      champion: null
    };

    saveTournamentState(newTournament);
    showToast(`🏆 ¡Torneo sorteado con ${teams.length} equipos!`, 'success');
  };

  // Launch Match to Anotador
  const handlePlayMatch = (match) => {
    if (!match.teamA || !match.teamB) {
      showToast('Aún no están definidos ambos equipos de este cruce', 'warning');
      return;
    }

    startMatchFromTournament({
      equipoNosotros: match.teamA.name,
      equipoEllos: match.teamB.name,
      idTorneo: currentTournament?.name || 'Torneo Funes',
      fase: match.fase,
      anotador: match.anotador,
      fiscalizador: match.fiscalizador,
      maxScore: 30
    });
  };

  // Manual Notification Trigger (Call Table)
  const handleCallMatch = (match) => {
    playMatchCallSound();
    triggerTurnNotification(match, 'jugador');
    showToast(`📢 ¡Llamado a la mesa emitido para ${match.teamA?.name} vs ${match.teamB?.name}!`, 'info');
  };

  // Update officials on match
  const handleUpdateOfficial = (matchId, field, value) => {
    if (!currentTournament) return;
    const updatedMatches = currentTournament.matches.map(m => {
      if (m.id === matchId) {
        return { ...m, [field]: value };
      }
      return m;
    });
    saveTournamentState({ ...currentTournament, matches: updatedMatches });
  };

  // Declare match winner manually or advance
  const handleSetMatchWinner = (matchId, winningTeam) => {
    if (!currentTournament) return;

    const updatedMatches = currentTournament.matches.map(m => {
      if (m.id === matchId) {
        return { ...m, winner: winningTeam, played: true };
      }
      return m;
    });

    // Check if we need to advance to Final or Semis
    const currentMatch = updatedMatches.find(m => m.id === matchId);

    if (matchId === 'M-SEM-1') {
      const fin = updatedMatches.find(m => m.id === 'M-FIN');
      if (fin) {
        fin.teamA = winningTeam;
        fin.anotador = winningTeam.members.split('&')[0]?.trim();
      }
    }
    if (matchId === 'M-SEM-2') {
      const fin = updatedMatches.find(m => m.id === 'M-FIN');
      if (fin) {
        fin.teamB = winningTeam;
        fin.fiscalizador = winningTeam.members.split('&')[0]?.trim();
      }
    }

    // Check champion
    let champ = currentTournament.champion;
    if (currentMatch && currentMatch.fase === 'Gran Final') {
      champ = winningTeam;
      showToast(`👑 ¡${winningTeam.name} es el nuevo CAMPEÓN!`, 'success');
    }

    const updated = {
      ...currentTournament,
      matches: updatedMatches,
      champion: champ
    };

    saveTournamentState(updated);

    // Auto-notify next match
    triggerNextMatchNotification(currentMatch);
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Tournament Settings Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-heading font-black text-lg text-white">
              Sorteo de Torneo
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {presentesCount} Presentes
          </span>
        </div>

        {/* Team Size Selector (1v1, 2v2, 3v3) */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Modalidad de Juego
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { size: 1, label: '1 vs 1', desc: 'Mano a Mano' },
              { size: 2, label: '2 vs 2', desc: 'Parejas' },
              { size: 3, label: '3 vs 3', desc: 'Tríos / Pica' },
            ].map((item) => (
              <button
                key={item.size}
                onClick={() => setTeamSize(item.size)}
                className={`p-2.5 rounded-xl text-center border transition-all active:scale-95 ${
                  teamSize === item.size
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-glow-gold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm font-black">{item.label}</div>
                <div className="text-[10px] opacity-80">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Shuffle Button */}
        <div className="pt-1">
          <button
            onClick={handleShuffleTournament}
            disabled={presentPlayers.length < minPlayersNeeded}
            className="w-full min-h-[50px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black rounded-xl text-sm shadow-glow-gold flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <Shuffle className="w-5 h-5 stroke-[2.5]" />
            <span>Armar Torneo (Shuffle de Presentes)</span>
          </button>

          {presentPlayers.length < minPlayersNeeded && (
            <div className="mt-2 text-center">
              <p className="text-xs text-rose-400 font-semibold">
                Hacen falta al menos {minPlayersNeeded} jugadores presentes (actualmente {presentPlayers.length}).
              </p>
              <button
                onClick={() => setActiveTab('presentes')}
                className="mt-1 text-xs text-amber-400 hover:underline font-bold"
              >
                Ir a la lista de Presentes →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Champion Banner if defined */}
      {currentTournament?.champion && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-4 text-slate-950 text-center shadow-glow-gold space-y-1 animate-in zoom-in-95">
          <div className="flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-wider">
            <Crown className="w-5 h-5 fill-slate-950 stroke-slate-950" />
            <span>CAMPEÓN DEL TORNEO</span>
          </div>
          <h3 className="font-heading font-black text-2xl text-slate-950">
            {currentTournament.champion.name}
          </h3>
          <p className="text-xs font-bold text-slate-900">
            {currentTournament.champion.members}
          </p>
        </div>
      )}

      {/* Active Tournament Fixture / Bracket */}
      {currentTournament ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-heading font-bold text-sm text-slate-300 uppercase tracking-wider">
              Llaves del Torneo ({currentTournament.totalTeams} equipos)
            </h3>
            <button
              onClick={() => {
                if (confirm('¿Deseas reiniciar y limpiar el torneo actual?')) {
                  setCurrentTournament(null);
                }
              }}
              className="text-xs text-slate-500 hover:text-rose-400 font-medium"
            >
              Reiniciar Fixture
            </button>
          </div>

          <div className="space-y-3">
            {currentTournament.matches.map((match) => {
              const isReady = match.teamA && match.teamB;
              const hasWinner = Boolean(match.winner);

              return (
                <div
                  key={match.id}
                  className={`rounded-2xl border p-3.5 transition-all shadow-md ${
                    hasWinner
                      ? 'bg-slate-950/80 border-slate-800'
                      : isReady
                      ? 'bg-slate-900 border-amber-500/40'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      {match.fase}
                    </span>
                    <div className="flex items-center space-x-2">
                      {isReady && !hasWinner && (
                        <button
                          onClick={() => handleCallMatch(match)}
                          title="Llamar cruce a la mesa y hacer sonar chicharra"
                          className="flex items-center space-x-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded-lg border border-amber-500/40"
                        >
                          <Bell className="w-3 h-3" />
                          <span>Llamar Mesa</span>
                        </button>
                      )}
                      {hasWinner ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          <span>Completado</span>
                        </span>
                      ) : isReady ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          Listo
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">
                          Esperando
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teams matchup */}
                  <div className="space-y-2 mb-3">
                    {/* Team A */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                        match.winner?.name === match.teamA?.name
                          ? 'bg-emerald-500/15 border border-emerald-500/40'
                          : 'bg-slate-950/80'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {match.teamA ? match.teamA.name : match.placeholder || 'Equipo A'}
                        </p>
                        {match.teamA && (
                          <p className="text-[11px] text-slate-400 truncate">
                            {match.teamA.members}
                          </p>
                        )}
                      </div>
                      {isReady && !hasWinner && (
                        <button
                          onClick={() => handleSetMatchWinner(match.id, match.teamA)}
                          title="Declarar ganador"
                          className="text-[10px] font-bold bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white px-2 py-1 rounded-lg shrink-0 transition-colors"
                        >
                          Ganó
                        </button>
                      )}
                      {match.winner?.name === match.teamA?.name && (
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>

                    <div className="text-center text-[10px] font-black uppercase text-slate-600">
                      VS
                    </div>

                    {/* Team B */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                        match.winner?.name === match.teamB?.name
                          ? 'bg-emerald-500/15 border border-emerald-500/40'
                          : 'bg-slate-950/80'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {match.teamB ? match.teamB.name : match.placeholder || 'Equipo B'}
                        </p>
                        {match.teamB && (
                          <p className="text-[11px] text-slate-400 truncate">
                            {match.teamB.members}
                          </p>
                        )}
                      </div>
                      {isReady && !hasWinner && (
                        <button
                          onClick={() => handleSetMatchWinner(match.id, match.teamB)}
                          title="Declarar ganador"
                          className="text-[10px] font-bold bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white px-2 py-1 rounded-lg shrink-0 transition-colors"
                        >
                          Ganó
                        </button>
                      )}
                      {match.winner?.name === match.teamB?.name && (
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Officials Section (Anotador & Fiscalizador) */}
                  {isReady && (
                    <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-500 block leading-tight">Anotador:</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {match.anotador || 'Por designar'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-500 block leading-tight">Fiscalizador:</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {match.fiscalizador || 'Por designar'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Play Button */}
                  {isReady && (
                    <button
                      onClick={() => handlePlayMatch(match)}
                      className="w-full min-h-[44px] bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all border border-slate-700 hover:border-amber-400"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Jugar Cruce en Anotador</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <Swords className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-300 font-bold text-sm">No hay torneo activo</p>
          <p className="text-slate-500 text-xs mt-1">
            Elegí la modalidad y pulsá "Armar Torneo" para sortear los cruces automáticamente.
          </p>
        </div>
      )}
    </div>
  );
}
