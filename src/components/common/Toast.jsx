import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 pointer-events-none flex flex-col items-center px-4 space-y-2">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-700 bg-slate-900/95 text-slate-100';
        let Icon = Info;
        let iconColor = 'text-amber-400';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/50 bg-slate-900/95 text-emerald-300';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-slate-900/95 text-amber-200';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/50 bg-slate-900/95 text-rose-200';
          Icon = AlertTriangle;
          iconColor = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between space-x-3 max-w-sm w-full px-4 py-2.5 rounded-xl border shadow-xl backdrop-blur-md text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${borderClass}`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
