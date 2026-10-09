import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Toast from './components/common/Toast';
import SplashLoader from './components/common/SplashLoader';
import MatchCallModal from './components/common/MatchCallModal';
import InscripcionView from './components/inscripcion/InscripcionView';
import PresentesView from './components/presentes/PresentesView';
import AnotadorView from './components/anotador/AnotadorView';
import TorneosView from './components/torneos/TorneosView';
import RankingsView from './components/rankings/RankingsView';
import AdminView from './components/admin/AdminView';

function MainContent() {
  const { activeTab } = useApp();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Splash screen loader */}
      <SplashLoader />

      {/* Match call alert modal when previous match finishes */}
      <MatchCallModal />

      <Header />
      <Toast />

      <div className="flex-1">
        {activeTab === 'inscribirse' && <InscripcionView />}
        {activeTab === 'presentes' && <PresentesView />}
        {activeTab === 'anotador' && <AnotadorView />}
        {activeTab === 'torneos' && <TorneosView />}
        {activeTab === 'rankings' && <RankingsView />}
        {activeTab === 'admin' && <AdminView />}
      </div>

      <BottomNav />
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
