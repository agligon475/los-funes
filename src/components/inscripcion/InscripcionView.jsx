import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  Share2,
  Bell,
  Trophy,
  CheckCircle2,
  Swords,
  Users,
  Sparkles,
  UserCheck,
  Send,
  Calendar,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { requestNotificationPermission } from '../../services/notifications';

export default function InscripcionView() {
  const {
    jugadores,
    handleAddJugador,
    currentUser,
    setCurrentUser,
    currentTournament,
    setActiveTab,
    startMatchFromTournament,
    showToast
  } = useApp();

  // Form states
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tienePareja, setTienePareja] = useState(false);
  const [parejaSugerida, setParejaSugerida] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Filter player matches in current tournament
  const myNextMatch = currentTournament?.matches?.find((m) => {
    if (!currentUser || m.played || !m.teamA || !m.teamB) return false;
    const name = currentUser.nombre.toLowerCase();
    const isPlayer =
      m.teamA.name.toLowerCase().includes(name) ||
      m.teamA.members.toLowerCase().includes(name) ||
      m.teamB.name.toLowerCase().includes(name) ||
      m.teamB.members.toLowerCase().includes(name);
    const isOfficial =
      m.anotador?.toLowerCase().includes(name) ||
      m.fiscalizador?.toLowerCase().includes(name);
    return isPlayer || isOfficial;
  });

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoadingForm(true);

    const newPlayerData = {
      nombre: nombre.trim(),
      alias: alias.trim(),
      telefono: telefono.trim(),
      pareja: tienePareja ? parejaSugerida.trim() : '',
      presente: true
    };

    const success = await handleAddJugador(newPlayerData);
    setLoadingForm(false);

    if (success) {
      // Pedir permiso de notificaciones de una vez
      askNotifications();
      showToast('¡Inscripción confirmada! Ya estás anotado como presente para hoy.', 'success');
      setNombre('');
      setAlias('');
      setTelefono('');
      setParejaSugerida('');
    }
  };

  const askNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);
    if (perm === 'granted') {
      showToast('🔔 ¡Notificaciones activadas! Te avisaremos cuando te toque jugar.', 'success');
    } else if (perm === 'denied') {
      showToast('Permiso de notificaciones bloqueado en el navegador.', 'warning');
    }
  };

  const shareWhatsAppLink = () => {
    const origin = window.location.origin;
    const shareUrl = `${origin}/#inscribirse`;
    const message = encodeURIComponent(
      `🃏 ¡Juntada de Truco de Los Funes!\nInscribite para armar las parejas y seguir el torneo en vivo acá:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Top Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-5 text-slate-950 shadow-2xl relative overflow-hidden border-2 border-amber-400/60">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Portal de Jugadores</span>
          </div>
          <h2 className="font-heading font-black text-2xl text-white tracking-tight leading-tight">
            Inscripción & Torneo en Vivo
          </h2>
          <p className="text-xs text-amber-100 font-medium">
            Anotate en la planilla oficial de Los Funes y recibí aviso cuando tu cruce esté en mesa.
          </p>
        </div>

        {/* WhatsApp Share Button */}
        <div className="mt-4 pt-3 border-t border-amber-500/30">
          <button
            onClick={shareWhatsAppLink}
            className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>Compartir enlace de inscripción por WhatsApp</span>
          </button>
        </div>
      </div>

      {/* User Identification Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-bold text-sm text-white">
              ¿Quién está usando este celular?
            </h3>
          </div>
          {currentUser && (
            <button
              onClick={() => setCurrentUser(null)}
              className="text-[11px] text-slate-400 hover:text-rose-400"
            >
              Cambiar
            </button>
          )}
        </div>

        {currentUser ? (
          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-white text-sm">{currentUser.nombre}</span>
                {currentUser.alias && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-bold">
                    {currentUser.alias}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Identificado para alertas automáticas de juego</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 block">
              Si ya estás en la lista, seleccionalo para recibir alertas:
            </label>
            <select
              onChange={(e) => {
                const found = jugadores.find((j) => j.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="" disabled>
                -- Seleccionar mi nombre de la lista --
              </option>
              {jugadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nombre} {j.alias ? `(${j.alias})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notifications Button */}
        {notificationStatus !== 'granted' && (
          <button
            onClick={askNotifications}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Activar Notificaciones de llamada a la mesa</span>
          </button>
        )}
      </div>

      {/* Live Match State for Current User */}
      {currentUser && myNextMatch && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500/50 p-4 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Tu próximo cruce en el torneo</span>
            </span>
            <span className="text-xs font-bold text-amber-400">{myNextMatch.fase}</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-between text-sm font-black">
              <span className="text-white truncate flex-1">{myNextMatch.teamA?.name}</span>
              <span className="text-slate-600 px-2 text-xs">VS</span>
              <span className="text-white truncate flex-1">{myNextMatch.teamB?.name}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span className="truncate pr-1">{myNextMatch.teamA?.members}</span>
              <span className="truncate pl-1">{myNextMatch.teamB?.members}</span>
            </div>
          </div>

          {/* Assigned Officials */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Anotador:</span>
              <span className="font-bold text-amber-400 truncate block">
                {myNextMatch.anotador || 'Por designar'}
              </span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Fiscalizador:</span>
              <span className="font-bold text-purple-400 truncate block">
                {myNextMatch.fiscalizador || 'Por designar'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              startMatchFromTournament({
                equipoNosotros: myNextMatch.teamA.name,
                equipoEllos: myNextMatch.teamB.name,
                idTorneo: currentTournament?.name || 'Torneo Funes',
                fase: myNextMatch.fase,
                anotador: myNextMatch.anotador,
                fiscalizador: myNextMatch.fiscalizador,
                maxScore: 30
              });
            }}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
          >
            <Swords className="w-4 h-4" />
            <span>Ir al Anotador de Truco</span>
          </button>
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <UserPlus className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-heading font-black text-base text-white">
              Formulario de Inscripción
            </h3>
            <p className="text-[11px] text-slate-400">
              Completá tus datos para darte de alta en la planilla de Google Sheets
            </p>
          </div>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Nicolás Gómez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Apodo / Alias de Truco (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: El Rey de Copas"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Teléfono Celular (opcional para avisos)
            </label>
            <input
              type="tel"
              placeholder="Ej: 341 555-1234"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Partner Option */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tienePareja}
                onChange={(e) => setTienePareja(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-700"
              />
              <span className="text-xs font-bold text-slate-300">
                ¿Vengo con pareja fija de Truco?
              </span>
            </label>

            {tienePareja && (
              <input
                type="text"
                placeholder="Nombre de tu compañero/a"
                value={parejaSugerida}
                onChange={(e) => setParejaSugerida(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 animate-in fade-in"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loadingForm || !nombre.trim()}
            className="w-full min-h-[50px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-sm shadow-glow-gold flex items-center justify-center space-x-2 active:scale-95 transition-all pt-1"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>{loadingForm ? 'Guardando en Planilla...' : '¡Anotarme a la Juntada de Hoy!'}</span>
          </button>
        </form>
      </div>

      {/* Quick Navigation to Tournament & Rankings */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          onClick={() => setActiveTab('torneos')}
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left space-y-1 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <Trophy className="w-4 h-4 text-amber-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs font-bold text-white">Torneo del Día</p>
          <p className="text-[10px] text-slate-400">Ver cruces y fixture en vivo</p>
        </button>

        <button
          onClick={() => setActiveTab('rankings')}
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left space-y-1 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <Users className="w-4 h-4 text-emerald-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs font-bold text-white">Rankings & Historial</p>
          <p className="text-[10px] text-slate-400">Estadísticas y torneos pasados</p>
        </button>
      </div>
    </div>
  );
}
