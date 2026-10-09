import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSheet,
  toggleJugadorPresente,
  savePartido,
  addJugador,
  updateJugador,
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
  // Check if opened via #inscribirse or #admin
  const getInitialTab = () => {
    if (typeof window === 'undefined') return 'presentes';
    if (window.location.hash === '#admin' || window.location.hash === '#superadmin') return 'admin';
    if (window.location.hash === '#inscribirse' || window.location.search.includes('view=inscribirse')) return 'inscribirse';
    return 'presentes';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab); // 'inscribirse' | 'presentes' | 'anotador' | 'torneos' | 'rankings' | 'admin'
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
  const loadInitialData = useCallback(async (isRefresh = false, silent = false) => {
    if (isRefresh && !silent) setSyncing(true);
    else if (!isRefresh) setLoading(true);

    try {
      const [jugadoresRes, equiposRes, partidosRes] = await Promise.all([
        getSheet('Jugadores'),
        getSheet('Equipos'),
        getSheet('Partidos')
      ]);

      // Partidos limpios (sin registros demo)
      const cleanPartidos = Array.isArray(partidosRes.data)
        ? partidosRes.data.filter(p => !['PAR-002', 'PAR-001', 'P-101', 'P-102', 'P-103'].includes(p.id_partido || p.id))
        : [];
      setPartidos(cleanPartidos);

      if (Array.isArray(jugadoresRes.data)) {
        // Calcular estadísticas limpias basadas en los partidos disputados
        const computedJugadores = jugadoresRes.data.map(j => {
          const jMatches = cleanPartidos.filter(p => {
            const nos = (p.equipo_nosotros || '').toLowerCase();
            const ell = (p.equipo_ellos || '').toLowerCase();
            const nm = (j.nombre || '').toLowerCase();
            return nos.includes(nm) || ell.includes(nm);
          });
          const jWins = jMatches.filter(p => {
            const nos = (p.equipo_nosotros || '').toLowerCase();
            const ell = (p.equipo_ellos || '').toLowerCase();
            const gan = (p.ganador || '').toLowerCase();
            const nm = (j.nombre || '').toLowerCase();
            return (nos.includes(nm) && gan === nos) || (ell.includes(nm) && gan === ell);
          });
          return {
            ...j,
            partidos_jugados: jMatches.length,
            partidos_ganados: jWins.length,
            torneos_ganados: 0
          };
        });

        setJugadores(computedJugadores);
        setCurrentUser(curr => {
          if (!curr) return null;
          const fresh = computedJugadores.find(j => 
            j.id === curr.id || 
            (curr.email && j.email && j.email.toLowerCase() === curr.email.toLowerCase())
          );
          if (fresh) {
            const merged = { ...curr, ...fresh };
            try { localStorage.setItem('funes_current_user', JSON.stringify(merged)); } catch (e) {}
            return merged;
          }
          return curr;
        });
      }

      if (Array.isArray(equiposRes.data)) {
        const computedEquipos = equiposRes.data.map(eq => {
          const eqMatches = cleanPartidos.filter(p => {
            const eqName = (eq.nombre || '').toLowerCase();
            return (p.equipo_nosotros || '').toLowerCase() === eqName || (p.equipo_ellos || '').toLowerCase() === eqName;
          });
          const eqWins = eqMatches.filter(p => (p.ganador || '').toLowerCase() === (eq.nombre || '').toLowerCase());
          return {
            ...eq,
            pj: eqMatches.length,
            pg: eqWins.length,
            torneos: 0
          };
        });
        setEquipos(computedEquipos);
      }

      if (jugadoresRes.authRestricted) {
        setAuthRestricted(true);
      } else {
        setAuthRestricted(false);
      }

      if (isRefresh && !silent) {
        showToast('Datos actualizados con éxito', 'success');
      }
    } catch (err) {
      console.error('[AppContext] Error al cargar datos:', err);
      if (!silent) {
        showToast('Modo sin conexión: usando datos guardados localmente', 'warning');
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInitialData();

    // Auto-sync cada 20 segundos para que todos los teléfonos vean lo mismo en la juntada
    const interval = setInterval(() => {
      loadInitialData(true, true);
    }, 20000);

    // Auto-sync cuando el usuario vuelve a la app (al desbloquear el celu o cambiar de pestaña)
    const onFocus = () => {
      loadInitialData(true, true);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadInitialData]);

  // Listen to hash changes for deep links (e.g. #inscribirse, #admin)
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#inscribirse') {
        setActiveTab('inscribirse');
      } else if (window.location.hash === '#admin' || window.location.hash === '#superadmin') {
        setActiveTab('admin');
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

  // Actualizar perfil de jugador (apodo, foto, equipo, etc.)
  const handleUpdateJugador = useCallback(async (id, updateData) => {
    setJugadores(prev =>
      prev.map(j => (j.id === id ? { ...j, ...updateData } : j))
    );
    if (currentUser && currentUser.id === id) {
      handleSetCurrentUser({ ...currentUser, ...updateData });
    }
    const res = await updateJugador(id, updateData);
    if (res.success) {
      showToast('Perfil actualizado correctamente', 'success');
    }
    return res.success;
  }, [currentUser, handleSetCurrentUser, showToast]);

  // Login de usuario existente por Email o Nombre
  const handleLogin = useCallback((identifier) => {
    if (!identifier || !identifier.trim()) return { success: false, message: 'Ingresá tu correo o nombre.' };
    const clean = identifier.trim().toLowerCase();
    const found = jugadores.find(j => 
      (j.email && j.email.toLowerCase() === clean) ||
      (j.nombre && j.nombre.toLowerCase() === clean) ||
      (j.id && j.id.toLowerCase() === clean)
    );
    if (found) {
      handleSetCurrentUser(found);
      showToast(`¡Hola, ${found.nombre}! Sesión iniciada`, 'success');
      return { success: true, user: found };
    }
    return {
      success: false,
      message: 'No encontramos ningún jugador registrado con ese correo o nombre.'
    };
  }, [jugadores, handleSetCurrentUser, showToast]);

  // Logout de usuario
  const handleLogout = useCallback(() => {
    handleSetCurrentUser(null);
    showToast('Sesión cerrada', 'info');
  }, [handleSetCurrentUser, showToast]);

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
      const updatedPartidos = [partidoData, ...partidos];
      setPartidos(updatedPartidos);

      // Re-calcular estadísticas al instante
      setJugadores(prev => prev.map(j => {
        const jMatches = updatedPartidos.filter(p => {
          const nos = (p.equipo_nosotros || '').toLowerCase();
          const ell = (p.equipo_ellos || '').toLowerCase();
          const nm = (j.nombre || '').toLowerCase();
          return nos.includes(nm) || ell.includes(nm);
        });
        const jWins = jMatches.filter(p => {
          const nos = (p.equipo_nosotros || '').toLowerCase();
          const ell = (p.equipo_ellos || '').toLowerCase();
          const gan = (p.ganador || '').toLowerCase();
          const nm = (j.nombre || '').toLowerCase();
          return (nos.includes(nm) && gan === nos) || (ell.includes(nm) && gan === ell);
        });
        return {
          ...j,
          partidos_jugados: jMatches.length,
          partidos_ganados: jWins.length,
          torneos_ganados: 0
        };
      }));

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
  }, [partidos, showToast, triggerNextMatchNotification]);

  // Limpiar y poner todas las estadísticas a cero
  const handleResetAllStats = useCallback(() => {
    setPartidos([]);
    try {
      localStorage.setItem('funes_partidos', JSON.stringify([]));
      localStorage.removeItem('funes_active_tournament');
    } catch (e) {}
    handleSaveTournament(null);
    setJugadores(prev => prev.map(j => ({
      ...j,
      partidos_jugados: 0,
      partidos_ganados: 0,
      torneos_ganados: 0
    })));
    setEquipos(prev => prev.map(eq => ({
      ...eq,
      pj: 0,
      pg: 0,
      torneos: 0
    })));
    setCurrentUser(curr => curr ? { ...curr, partidos_jugados: 0, partidos_ganados: 0, torneos_ganados: 0 } : null);
    showToast('🧹 Estadísticas limpias: todo en 0', 'info');
  }, [showToast, handleSaveTournament]);

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
    handleLogin,
    handleLogout,
    handleUpdateJugador,
    handleResetAllStats,
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
