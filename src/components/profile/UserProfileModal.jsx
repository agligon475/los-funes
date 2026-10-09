import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Trash2,
  X,
  User,
  Shield,
  Users,
  Trophy,
  Save,
  LogOut,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

export default function UserProfileModal({ isOpen, onClose }) {
  const {
    currentUser,
    equipos,
    handleAddEquipo,
    handleUpdateJugador,
    handleLogout,
    showToast
  } = useApp();

  const fileInputRef = useRef(null);

  // Form states based on currentUser
  const [apodo, setApodo] = useState(currentUser?.apodo || currentUser?.alias || '');
  const [telefono, setTelefono] = useState(currentUser?.telefono || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [equipo, setEquipo] = useState(currentUser?.equipo || '');
  const [foto, setFoto] = useState(currentUser?.foto || '');

  // Team creation
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [nuevoEquipoNombre, setNuevoEquipoNombre] = useState('');
  const [saving, setSaving] = useState(false);

  // Update states whenever currentUser changes or modal opens
  React.useEffect(() => {
    if (currentUser) {
      setApodo(currentUser.apodo || currentUser.alias || '');
      setTelefono(currentUser.telefono || '');
      setEmail(currentUser.email || '');
      setEquipo(currentUser.equipo || '');
      setFoto(currentUser.foto || '');
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  // Handle image upload from camera or file picker
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Optimizando imagen...', 'info');
      const compressedBase64 = await compressImage(file, 220, 0.82);
      setFoto(compressedBase64);
      showToast('📸 Foto cargada. Hacé clic en Guardar Cambios para aplicar.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al procesar la foto', 'error');
    }
  };

  const handleRemovePhoto = () => {
    setFoto('');
    showToast('Foto eliminada. Guardá los cambios para confirmar.', 'info');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    let finalEquipo = equipo;

    // Si creó un equipo nuevo
    if (isCreatingTeam && nuevoEquipoNombre.trim()) {
      finalEquipo = nuevoEquipoNombre.trim();
      await handleAddEquipo({
        nombre: finalEquipo,
        integrantes: currentUser.nombre
      });
      setIsCreatingTeam(false);
      setNuevoEquipoNombre('');
    }

    const updatePayload = {
      apodo: apodo.trim(),
      alias: apodo.trim(),
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      equipo: finalEquipo,
      foto: foto
    };

    const success = await handleUpdateJugador(currentUser.id, updatePayload);
    setSaving(false);

    if (success) {
      onClose();
    }
  };

  const calculateEfectividad = () => {
    const pj = Number(currentUser.partidos_jugados || 0);
    const pg = Number(currentUser.partidos_ganados || 0);
    if (!pj) return '0%';
    return `${Math.round((pg / pj) * 100)}%`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-100 space-y-4 relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <h3 className="font-heading font-black text-xl text-white">
            Mi Perfil de Jugador
          </h3>
          <p className="text-xs text-slate-400">
            Personalizá tus datos, foto y equipo para los torneos de Funes.
          </p>
        </div>

        {/* Avatar & Photo Upload Section */}
        <div className="flex flex-col items-center space-y-2 pt-1">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-amber-500/80 bg-slate-950 shadow-glow-gold flex items-center justify-center relative">
              {foto ? (
                <img
                  src={foto}
                  alt={currentUser.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-slate-950 font-black text-3xl">
                  {currentUser.nombre.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Camera Overlay Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-lg border-2 border-slate-900 active:scale-95 transition-all"
              title="Subir foto de perfil"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
            >
              📷 Subir / Tomar Foto
            </button>
            {foto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Quitar</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Stats Capsule */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-center">
          <div>
            <span className="block text-[10px] text-slate-400">Jugados</span>
            <span className="font-heading font-black text-sm text-white">
              {currentUser.partidos_jugados || 0}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-emerald-400">Ganados</span>
            <span className="font-heading font-black text-sm text-emerald-300">
              {currentUser.partidos_ganados || 0}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-amber-400">Efectividad</span>
            <span className="font-heading font-black text-sm text-amber-300">
              {calculateEfectividad()}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-amber-400">Copas</span>
            <span className="font-heading font-black text-sm text-amber-400 flex items-center justify-center space-x-0.5">
              <span>🏆</span>
              <span>{currentUser.torneos_ganados || 0}</span>
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">
              Nombre de Jugador
            </label>
            <input
              type="text"
              disabled
              value={currentUser.nombre}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-semibold cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Apodo / Alias
              </label>
              <input
                type="text"
                placeholder='Ej: "El Espada"'
                value={apodo}
                onChange={(e) => setApodo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="Ej: 341..."
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Correo Electrónico (para login)
            </label>
            <input
              type="email"
              placeholder="tu-email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Team Settings / Creación de Equipos */}
          <div className="pt-1 space-y-1.5 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-amber-300 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5" />
                <span>Equipo de Truco (Trío)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingTeam(!isCreatingTeam)}
                className="text-[10px] font-bold text-amber-400 hover:text-white flex items-center space-x-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>{isCreatingTeam ? 'Elegir Existente' : 'Crear Nuevo'}</span>
              </button>
            </div>

            {isCreatingTeam ? (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 space-y-1.5 animate-fade-in">
                <span className="text-[10px] text-slate-400 block">
                  Nombre de tu nuevo equipo de 3:
                </span>
                <input
                  type="text"
                  placeholder='Ej: "Los Reyes del Envido"'
                  value={nuevoEquipoNombre}
                  onChange={(e) => setNuevoEquipoNombre(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            ) : (
              <select
                value={equipo}
                onChange={(e) => setEquipo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Jugador Libre (Sin equipo fijo de 3) --</option>
                {equipos.map((eq) => (
                  <option key={eq.id || eq.nombre} value={eq.nombre}>
                    {eq.nombre} {eq.integrantes ? `(${eq.integrantes})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Submit Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-glow-gold flex items-center justify-center space-x-2 active:scale-95 transition-all mt-3"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </form>

        {/* Logout Button */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ID: <strong className="font-mono text-slate-400">{currentUser.id}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
