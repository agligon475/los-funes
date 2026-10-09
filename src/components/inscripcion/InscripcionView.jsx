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
  ArrowRight,
  LogIn,
  Camera,
  Mail,
  User
} from 'lucide-react';
import { requestNotificationPermission } from '../../services/notifications';
import UserProfileModal from '../profile/UserProfileModal';
import LoginModal from '../profile/LoginModal';

export default function InscripcionView() {
  const {
    jugadores,
    handleAddJugador,
    currentUser,
    setCurrentUser,
    currentTournament,
    setActiveTab,
    startMatchFromTournament,
    equipos,
    handleAddEquipo,
    showToast
  } = useApp();

  // Form states
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tieneEquipo, setTieneEquipo] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState('');
  const [nuevoEquipoNombre, setNuevoEquipoNombre] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
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
    if (!nombre.trim() || !email.trim()) {
      showToast('Por favor completá tu nombre y correo electrónico', 'warning');
      return;
    }

    setLoadingForm(true);

    let finalTeamName = '';
    if (tieneEquipo) {
      if (selectedEquipo === '__NEW__' && nuevoEquipoNombre.trim()) {
        finalTeamName = nuevoEquipoNombre.trim();
        await handleAddEquipo({
          nombre: finalTeamName,
          integrantes: nombre.trim()
        });
      } else if (selectedEquipo && selectedEquipo !== '__NEW__') {
        finalTeamName = selectedEquipo;
      }
    }

    const newPlayerData = {
      nombre: nombre.trim(),
      alias: alias.trim(),
      apodo: alias.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
      equipo: finalTeamName,
      presente: true
    };

    const success = await handleAddJugador(newPlayerData);
    setLoadingForm(false);

    if (success) {
      askNotifications();
      showToast(
        finalTeamName
          ? `¡Inscripción confirmada en "${finalTeamName}"!`
          : '¡Inscripción confirmada como Jugador Libre!',
        'success'
      );
      setNombre('');
      setAlias('');
      setEmail('');
      setTelefono('');
      setTieneEquipo(false);
      setSelectedEquipo('');
      setNuevoEquipoNombre('');
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
          <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/60 bg-slate-900 shrink-0 flex items-center justify-center">
                {currentUser.foto ? (
                  <img src={currentUser.foto} alt={currentUser.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-lg">
                    {currentUser.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-white text-sm truncate">{currentUser.nombre}</span>
                  {(currentUser.apodo || currentUser.alias) && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold truncate">
                      "{currentUser.apodo || currentUser.alias}"
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser.equipo ? `Equipo: ${currentUser.equipo}` : 'Jugador Libre'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 active:scale-95 transition-all flex items-center space-x-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Mi Perfil</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>¿Ya estás inscripto? Ingresá con tu correo</span>
            </button>
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-2 text-[10px] text-slate-500 absolute">o elegí tu nombre</span>
            </div>
            <select
              onChange={(e) => {
                const found = jugadores.find((j) => j.id === e.target.value);
                if (found) setCurrentUser(found);
              }}
              defaultValue=""
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
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

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Correo Electrónico * <span className="text-amber-400 font-normal">(Obligatorio para tu perfil y foto)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Te permitirá acceder a tu perfil, cambiar tu foto y gestionar tu equipo.
            </p>
          </div>

          {/* Team Option (Tríos de 3) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={tieneEquipo}
                onChange={(e) => setTieneEquipo(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-700"
              />
              <span className="text-xs font-bold text-slate-200">
                ¿Tenés equipo fijo de 3?
              </span>
            </label>

            {tieneEquipo ? (
              <div className="space-y-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 animate-in fade-in">
                <label className="block text-[11px] font-bold text-amber-400">
                  Seleccioná tu equipo o creá uno nuevo:
                </label>
                <select
                  value={selectedEquipo}
                  onChange={(e) => setSelectedEquipo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Seleccionar equipo existente --</option>
                  {equipos.map((eq) => (
                    <option key={eq.id} value={eq.nombre}>
                      {eq.nombre} ({eq.integrantes ? `${eq.integrantes.split('/').length}/3 miembros` : '0/3'})
                    </option>
                  ))}
                  <option value="__NEW__">+ Crear nuevo equipo de 3...</option>
                </select>

                {selectedEquipo === '__NEW__' && (
                  <input
                    type="text"
                    required
                    placeholder="Nombre del nuevo equipo de 3..."
                    value={nuevoEquipoNombre}
                    onChange={(e) => setNuevoEquipoNombre(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none animate-in fade-in"
                  />
                )}
              </div>
            ) : (
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Vas como <strong>Jugador Libre</strong>. Si a algún equipo de 3 le falta gente, el sistema te asignará automáticamente.
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loadingForm || !nombre.trim() || !email.trim()}
            className="w-full min-h-[50px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-sm shadow-glow-gold flex items-center justify-center space-x-2 active:scale-95 transition-all pt-1"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>{loadingForm ? 'Guardando en Planilla...' : '¡Anotarme a la Juntada de Hoy!'}</span>
          </button>
        </form>

        {/* Link to login if already registered */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            ¿Ya te habías registrado antes?{' '}
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="text-amber-400 hover:text-amber-300 font-bold underline ml-1"
            >
              Iniciar sesión con tu correo
            </button>
          </p>
        </div>
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

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenProfile={() => setShowProfileModal(true)}
      />
    </div>
  );
}
