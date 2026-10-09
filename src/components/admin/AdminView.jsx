import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Users,
  Shield,
  Trophy,
  Save,
  Link,
  RotateCcw,
  LogOut,
  ExternalLink,
  Flame,
  Check,
  X
} from 'lucide-react';
import {
  testApiConnection,
  getApiUrl,
  setCustomApiUrl,
  deleteJugador,
  deletePartido,
  toggleJugadorPresente
} from '../../services/api';

const ADMIN_PIN = 'funes2026';

export default function AdminView() {
  const {
    jugadores,
    equipos,
    partidos,
    refreshAll,
    setCurrentTournament,
    showToast
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('funes_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Connection diagnostic
  const [testingConnection, setTestingConnection] = useState(false);
  const [connResult, setConnResult] = useState(null);

  // API URL Override
  const [customUrl, setCustomUrl] = useState(getApiUrl());
  const [savingUrl, setSavingUrl] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN || pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
      try {
        sessionStorage.setItem('funes_admin_auth', 'true');
      } catch (err) {
        // ignore
      }
      showToast('👑 Sesión de SuperAdmin iniciada', 'success');
    } else {
      setPinError(true);
      showToast('PIN incorrecto', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('funes_admin_auth');
    } catch (err) {
      // ignore
    }
    showToast('Sesión cerrada', 'info');
  };

  const runConnectionTest = async () => {
    setTestingConnection(true);
    const res = await testApiConnection();
    setConnResult(res);
    setTestingConnection(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      runConnectionTest();
    }
  }, [isAuthenticated]);

  const handleSaveApiUrl = () => {
    setSavingUrl(true);
    setCustomApiUrl(customUrl);
    showToast('URL de backend actualizada', 'success');
    runConnectionTest();
    setSavingUrl(false);
  };

  const handleMarcarTodos = async (presente) => {
    const promises = jugadores.map(j => toggleJugadorPresente(j.id, presente));
    await Promise.all(promises);
    showToast(presente ? 'Todos marcados como Presentes' : 'Todos marcados como Ausentes', 'info');
    refreshAll();
  };

  const handleDeletePlayer = async (id, nombre) => {
    if (confirm(`¿Eliminar definitivamente a "${nombre}" de la planilla?`)) {
      await deleteJugador(id);
      showToast(`Jugador "${nombre}" eliminado`, 'info');
      refreshAll();
    }
  };

  const handleDeleteMatch = async (id) => {
    if (confirm('¿Eliminar este registro de partido?')) {
      await deletePartido(id);
      showToast('Partido eliminado del historial', 'info');
      refreshAll();
    }
  };

  const handleResetTournament = () => {
    if (confirm('¿Seguro que deseas resetear y borrar el fixture del torneo actual?')) {
      setCurrentTournament(null);
      try {
        localStorage.removeItem('funes_active_tournament');
      } catch (e) {
        // ignore
      }
      showToast('Torneo reseteado', 'warning');
    }
  };

  // 1. PIN Login Screen
  if (!isAuthenticated) {
    return (
      <div className="pb-24 pt-8 px-4 max-w-md mx-auto space-y-5 select-none">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto shadow-glow-gold">
            <KeyRound className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="font-heading font-black text-2xl text-white">
            Acceso SuperAdmin
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Panel restringido para el organizador de Los Funes. Gestioná sincronización, fixtures y planillas.
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Ingresá el PIN de Administrador
            </label>
            <input
              type="password"
              autoFocus
              placeholder="PIN de acceso..."
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white focus:outline-none ${
                pinError ? 'border-rose-500 animate-shake' : 'border-slate-700 focus:border-amber-500'
              }`}
            />
            <p className="text-[11px] text-slate-500 mt-1.5 text-center">
              PIN por defecto: <strong className="text-amber-400 font-mono">funes2026</strong> (o <strong className="text-amber-400 font-mono">1234</strong>)
            </p>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-sm shadow-glow-gold flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <span>Desbloquear SuperAdmin</span>
          </button>
        </form>
      </div>
    );
  }

  // 2. Authenticated Dashboard
  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="font-heading font-black text-sm text-white uppercase tracking-wider">
            SuperAdmin Panel
          </h2>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salir</span>
        </button>
      </div>

      {/* SECTION 1: Google Apps Script Backend Live Health Check */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Link className="w-4 h-4 text-amber-400" />
            <h3 className="font-heading font-bold text-sm text-white">
              Diagnóstico Google Sheets (Nube)
            </h3>
          </div>
          <button
            onClick={runConnectionTest}
            disabled={testingConnection}
            className="flex items-center space-x-1 text-xs text-amber-400 hover:text-white font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            <span>Test</span>
          </button>
        </div>

        {/* Live Result Status */}
        {connResult && (
          <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
            connResult.status === 'online'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-center space-x-2">
              {connResult.status === 'online' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div className="font-black">
                {connResult.status === 'online'
                  ? '🟢 CONECTADO EN TIEMPO REAL'
                  : '🔴 REQUIERE AJUSTE EN GOOGLE APPS SCRIPT'}
              </div>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {connResult.message}
            </p>

            {connResult.status !== 'online' && (
              <div className="bg-black/60 p-3 rounded-xl border border-rose-500/30 text-[11px] space-y-1.5 text-slate-200">
                <p className="font-bold text-amber-300">
                  ¿Por qué tu celular y tu PC no ven lo mismo?
                </p>
                <p className="text-slate-300">
                  Google Apps Script está bloqueando el acceso anónimo y pidiendo inicio de sesión de Google. Para que <strong>todos los chicos y vos vean exactamente los mismos datos en vivo</strong>:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                  <li>Abrí tu proyecto en <strong className="text-white">script.google.com</strong></li>
                  <li>Tocá el botón azul <strong className="text-white">Implementar &gt; Administrar implementaciones</strong></li>
                  <li>Hacé clic en el lápiz ✏️ de la versión activa</li>
                  <li>En <strong className="text-amber-300">"Quién tiene acceso" (Who has access)</strong> cambialo a: <strong className="text-emerald-400 font-bold">Cualquiera (Anyone)</strong></li>
                  <li>Hacé clic en <strong className="text-white">Implementar</strong> y ¡listo!</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Change API URL Input */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-slate-400 block">
            URL de la API de Google Apps Script:
          </label>
          <div className="flex space-x-1.5">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSaveApiUrl}
              disabled={savingUrl}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Control de Juntada y Presencias */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="font-heading font-bold text-sm text-white">
              Control Rápido de Presencias ({jugadores.length})
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleMarcarTodos(true)}
            className="py-2.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Todos Presentes</span>
          </button>
          <button
            onClick={() => handleMarcarTodos(false)}
            className="py-2.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
          >
            <X className="w-4 h-4" />
            <span>Reset a Ausentes</span>
          </button>
        </div>

        {/* Players List with Delete */}
        <div className="max-h-52 overflow-y-auto space-y-1.5 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs">
          {jugadores.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No hay jugadores registrados.</p>
          ) : (
            jugadores.map(j => (
              <div
                key={j.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-white truncate">{j.nombre}</p>
                  <p className="text-[10px] text-slate-400">
                    {j.equipo ? `Equipo: ${j.equipo}` : 'Libre'} • {j.presente ? '✅ Presente' : '❌ Ausente'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePlayer(j.id, j.nombre)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-950 hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: Control de Torneo */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading font-bold text-sm text-white">
            Control de Torneo y Partidos
          </h3>
        </div>

        <button
          onClick={handleResetTournament}
          className="w-full py-2.5 bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reiniciar y Limpiar Fixture Activo</span>
        </button>

        {/* Matches list to delete if needed */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 block">
            Partidos Registrados ({partidos.length}):
          </span>
          <div className="max-h-40 overflow-y-auto space-y-1.5 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs">
            {partidos.length === 0 ? (
              <p className="text-slate-500 text-center py-2">No hay partidos en la planilla.</p>
            ) : (
              partidos.map((p, idx) => (
                <div
                  key={p.id_partido || idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-white truncate">
                      {p.equipo_nosotros} ({p.puntos_nosotros}) vs {p.equipo_ellos} ({p.puntos_ellos})
                    </p>
                    <p className="text-[10px] text-amber-400">Ganó: {p.ganador}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteMatch(p.id_partido)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-950 hover:bg-rose-950/40 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
