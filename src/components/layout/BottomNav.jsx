import React from 'react';
import { Users, Flame, Trophy, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, presentesCount } = useApp();

  const tabs = [
    {
      id: 'presentes',
      label: 'Presentes',
      icon: Users,
      badge: presentesCount > 0 ? presentesCount : null
    },
    {
      id: 'anotador',
      label: 'Anotador',
      icon: Flame,
      badge: null
    },
    {
      id: 'torneos',
      label: 'Torneos',
      icon: Trophy,
      badge: null
    },
    {
      id: 'rankings',
      label: 'Rankings',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/98 backdrop-blur-xl border-t border-slate-800 shadow-bottom-nav pb-safe pointer-events-auto">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-full h-full min-h-[48px] transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-md animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
