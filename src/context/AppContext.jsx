import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSheet,
  toggleJugadorPresente,
  savePartido,
  addJugador,
  addEquipo,
  DEFAULT_JUGADORES,
  DEFAULT_EQUIPOS,
  DEFAULT_PARTIDOS
} from '../services/api';
import {
  playMatchCallSound,
  requestNotificationPermission,
  triggerTurnNotification
} from '../services/notifications';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Check if opened via #inscribirse
  const initialTab =
    typeof window !== 'undefined' &&
    (window.location.hash === '#inscribirse' || window.location.search.includes('view=inscribirse'))
      ? 'inscribirse'
      : 'presentes';

  const [activeTab, setActiveTab] = useState(initialTab); // 'inscribirse' | 'presentes' | 'anotador' | 'torneos' | 'rankings'
  const [jugadores, setJugadores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [authRestricted, setAuthRestricted] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Active user on this device
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('funes_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active Tournament
  const [currentTournament, setCurrentTournament] = useState(() => {
    try {
      const saved = localStorage.getItem('funes_active_tournament');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Call-up Modal Alert (when previous match finishes)
  const [matchCallAlert, setMatchCallAlert] = useState(null);

  // Anotador preloaded match from Torneos module
  const [anotadorPreload, setAnotadorPreload] = useState(null);

  // Save current user to local storage
  const handleSetCurrentUser = useCallback((user) => {
    setCurrentUser(user);
    try {
      if (user) localStorage.setItem('funes_current_user', JSON.stringify(user));
      else localStorage.removeItem('funes_current_user');
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Save tournament
  const handleSaveTournament = useCallback((tournament) => {
    setCurrentTournament(tournament);
    try {
      if (tournament) localStorage.setItem('funes_active_tournament', JSON.stringify(tournament));
      else localStorage.removeItem('funes_active_tournament');
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch all sheets
  const loadInitialData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setSyncing(true);
    else setLoading(true);

    try {
      const [jugadoresRes, equiposRes, partidosRes] = await Promise.all([
        getSheet('Jugadores'),
        getSheet('Equipos'),
        getSheet('Partidos')
      ]);

      if (jugadoresRes.data?.length) setJugadores(jugadoresRes.data);
      else setJugadores(DEFAULT_JUGADORES);

      if (equiposRes.data?.length) setEquipos(equiposRes.data);
      else setEquipos(DEFAULT_EQUIPOS);

      if (partidosRes.data?.length) setPartidos(partidosRes.data);
      else setPartidos(DEFAULT_PARTIDOS);

      if (jugadoresRes.authRestricted) {
        setAuthRestricted(true);
      } else {
        setAuthRestricted(false);
      }

      if (isRefresh) {
        showToast('Datos actualizados con éxito', 'success');
      }
    } catch (err) {
      console.error('[AppContext] Error al cargar datos:', err);
      showToast('Modo sin conexión: usando datos guardados localmente', 'warning');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Listen to hash changes for deep links (e.g. #inscribirse)
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#inscribirse') {
        setActiveTab('inscribirse');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Optimistic Toggle Presente
  const handleTogglePresente = useCallback(async (id, currentVal) => {
    const newVal = !currentVal;

    setJugadores(prev =>
      prev.map(j => (j.id === id ? { ...j, presente: newVal } : j))
    );

    const jugador = jugadores.find(j => j.id === id);
    const nombre = jugador ? jugador.nombre : 'Jugador';

    showToast(
      newVal ? `✅ ${nombre} marcado como Presente` : `❌ ${nombre} marcado como Ausente`,
      'info'
    );

    try {
      await toggleJugadorPresente(id, newVal);
    } catch (e) {
      console.error('Error sincronizando presencia con Google Sheets:', e);
      showToast('Guardado local (sin conexión con Google Sheets)', 'warning');
    }
  }, [jugadores, showToast]);

  // Agregar nuevo jugador / Inscripción
  const handleAddJugador = useCallback(async (data) => {
    setSyncing(true);
    try {
      const res = await addJugador(data);
      setJugadores(res.list);
      
      // Auto-set as current user if registering
      if (!currentUser && res.player) {
        handleSetCurrentUser(res.player);
      }

      showToast(`¡Inscripción exitosa! Bienvenido ${data.nombre}`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error al procesar inscripción', 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [currentUser, handleSetCurrentUser, showToast]);

  // Agregar nuevo equipo
  const handleAddEquipo = useCallback(async (data) => {
    setSyncing(true);
    try {
      const res = await addEquipo(data);
      setEquipos(res.list);
      showToast(`Equipo "${data.nombre}" creado con éxito`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error al agregar equipo', 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [showToast]);

  // Notify next match players and roles
  const triggerNextMatchNotification = useCallback((finishedMatch) => {
    if (!currentTournament || !currentTournament.matches) return;

    // Find next unplayed match with defined teams
    const nextMatch = currentTournament.matches.find(
      m => !m.played && m.id !== finishedMatch?.id && m.teamA && m.teamB
    );

    if (nextMatch) {
      // Determine role of current user if present
      let userRole = 'espectador';
      const userName = currentUser?.nombre?.toLowerCase() || '';

      if (
        nextMatch.teamA?.members?.toLowerCase().includes(userName) ||
        nextMatch.teamA?.name?.toLowerCase().includes(userName) ||
        nextMatch.teamB?.members?.toLowerCase().includes(userName) ||
        nextMatch.teamB?.name?.toLowerCase().includes(userName)
      ) {
        userRole = 'jugador';
      } else if (nextMatch.anotador?.toLowerCase().includes(userName)) {
        userRole = 'anotador';
      } else if (nextMatch.fiscalizador?.toLowerCase().includes(userName)) {
        userRole = 'fiscalizador';
      }

      // Trigger Web Audio + Vibration + Push Notification
      triggerTurnNotification(nextMatch, userRole);

      // In-app Alert Modal
      setMatchCallAlert({
        match: nextMatch,
        role: userRole,
        finishedMatch
      });
    }
  }, [currentTournament, currentUser]);

  // Guardar partido del anotador
  const handleSavePartido = useCallback(async (partidoData) => {
    setSyncing(true);
    try {
      const res = await savePartido(partidoData);
      setPartidos(res.newPartidos);
      showToast('🏆 ¡Partido registrado en la planilla con éxito!', 'success');

      // Notificar al siguiente cruce
      triggerNextMatchNotification(partidoData);
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error al guardar el partido', 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [showToast, triggerNextMatchNotification]);

  // Cargar partido desde el Fixture al Anotador
  const startMatchFromTournament = useCallback((matchData) => {
    setAnotadorPreload(matchData);
    setActiveTab('anotador');
    showToast(`Mesa lista: ${matchData.equipoNosotros} vs ${matchData.equipoEllos}`, 'info');
  }, [showToast]);

  const presentesCount = jugadores.filter(j => j.presente).length;

  const value = {
    activeTab,
    setActiveTab,
    jugadores,
    equipos,
    partidos,
    loading,
    syncing,
    authRestricted,
    toasts,
    showToast,
    removeToast,
    presentesCount,
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    currentTournament,
    setCurrentTournament: handleSaveTournament,
    matchCallAlert,
    setMatchCallAlert,
    triggerNextMatchNotification,
    handleTogglePresente,
    handleAddJugador,
    handleAddEquipo,
    handleSavePartido,
    anotadorPreload,
    setAnotadorPreload,
    startMatchFromTournament,
    requestNotificationPermission,
    refreshAll: () => loadInitialData(true)
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
