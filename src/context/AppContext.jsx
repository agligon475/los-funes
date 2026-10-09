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

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('presentes'); // 'presentes' | 'anotador' | 'torneos' | 'rankings'
  const [jugadores, setJugadores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [authRestricted, setAuthRestricted] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Anotador preloaded match from Torneos module
  const [anotadorPreload, setAnotadorPreload] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
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

  // Optimistic Toggle Presente
  const handleTogglePresente = useCallback(async (id, currentVal) => {
    const newVal = !currentVal;
    
    // UI Optimista instantánea
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
      showToast('No se pudo sincronizar en la nube, guardado local', 'warning');
    }
  }, [jugadores, showToast]);

  // Agregar nuevo jugador
  const handleAddJugador = useCallback(async (data) => {
    setSyncing(true);
    try {
      const res = await addJugador(data);
      setJugadores(res.list);
      showToast(`Jugador "${data.nombre}" agregado con éxito`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error al agregar jugador', 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [showToast]);

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

  // Guardar partido del anotador
  const handleSavePartido = useCallback(async (partidoData) => {
    setSyncing(true);
    try {
      const res = await savePartido(partidoData);
      setPartidos(res.newPartidos);
      showToast('🏆 ¡Partido registrado en la planilla con éxito!', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error al guardar el partido', 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  }, [showToast]);

  // Cargar partido desde el Fixture al Anotador
  const startMatchFromTournament = useCallback((matchData) => {
    setAnotadorPreload(matchData);
    setActiveTab('anotador');
    showToast(`Cargado en Anotador: ${matchData.equipoNosotros} vs ${matchData.equipoEllos}`, 'info');
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
    handleTogglePresente,
    handleAddJugador,
    handleAddEquipo,
    handleSavePartido,
    anotadorPreload,
    setAnotadorPreload,
    startMatchFromTournament,
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
