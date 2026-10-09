import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, LogIn, X, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onOpenProfile }) {
  const { jugadores, handleLogin, currentUser, setActiveTab, showToast } = useApp();
  const [emailOrName, setEmailOrName] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    let identifier = emailOrName.trim();
    if (selectedPlayerId) {
      const p = jugadores.find(j => j.id === selectedPlayerId);
      if (p) identifier = p.email || p.nombre;
    }

    if (!identifier) {
      setErrorMsg('Por favor ingresá tu correo o seleccioná tu nombre.');
      return;
    }

    const result = handleLogin(identifier);
    if (result.success) {
      onClose();
      if (onOpenProfile) onOpenProfile();
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleSelectQuick = (j) => {
    handleLogin(j.email || j.nombre);
    onClose();
    if (onOpenProfile) onOpenProfile();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-100 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-glow-gold">
            <LogIn className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h3 className="font-heading font-black text-xl text-white">
            Ingresá a tu Perfil
          </h3>
          <p className="text-xs text-slate-400">
            Ingresá con tu correo electrónico para subir tu foto, gestionar tu equipo y ver tus estadísticas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Tu Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                autoFocus
                placeholder="ejemplo@correo.com"
                value={emailOrName}
                onChange={(e) => {
                  setEmailOrName(e.target.value);
                  setSelectedPlayerId('');
                  setErrorMsg('');
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Quick selector of registered players with email */}
          {jugadores.length > 0 && (
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-400">
                O seleccioná tu nombre de la lista:
              </label>
              <select
                value={selectedPlayerId}
                onChange={(e) => {
                  setSelectedPlayerId(e.target.value);
                  const found = jugadores.find(j => j.id === e.target.value);
                  if (found) setEmailOrName(found.email || found.nombre);
                  setErrorMsg('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Buscar en la lista de jugadores --</option>
                {jugadores.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.nombre} {j.apodo || j.alias ? `("${j.apodo || j.alias}")` : ''} {j.email ? `• ${j.email}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-2.5 text-rose-300 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-glow-gold flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar a mi Perfil</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            ¿Todavía no te anotaste?{' '}
            <button
              onClick={() => {
                onClose();
                setActiveTab('inscribirse');
              }}
              className="text-amber-400 hover:text-amber-300 font-bold underline ml-1"
            >
              Inscribirme acá
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
