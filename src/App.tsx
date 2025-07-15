import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTournament } from './hooks/useTournament';
import AuthGuard from './components/AuthGuard';
import ModernAuthForm from './components/ModernAuthForm';
import TournamentBracket from './components/TournamentBracket';
import MatchModal from './components/MatchModal';
import ClubManagement from './components/ClubManagement';
import CategoryManagement from './components/CategoryManagement';
import CompetitionManagement from './components/CompetitionManagement';
import Footer from './components/Footer';
import { Match, Player } from './types/tournament';
import { Trophy, Menu, X, Target, Award, LogOut, User, Building, Flag, Shield, Zap } from 'lucide-react';

type ViewType = 'competitions' | 'bracket' | 'clubs' | 'categories';

function App() {
  const { user, logout } = useAuth();
  const { 
    tournaments,
    activeTournament, 
    updateMatchResult, 
    startTournament,
    setActiveTournament 
  } = useTournament();

  const [currentView, setCurrentView] = useState<ViewType>('competitions');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMatchClick = (match: Match) => {
    if (match.player1 && match.player2) {
      setSelectedMatch(match);
    }
  };

  const handleUpdateMatch = (winner: Player, score?: { player1: number; player2: number }) => {
    if (selectedMatch && activeTournament) {
      updateMatchResult(activeTournament.id, selectedMatch.id, winner, score);
      setSelectedMatch(null);
    }
  };

  const sidebarItems = [
    { id: 'competitions', label: 'Compétitions', icon: Flag },
    { id: 'bracket', label: 'Arbre de Tournoi', icon: Target },
    { id: 'clubs', label: 'Clubs', icon: Building },
    { id: 'categories', label: 'Catégories', icon: Award },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'competitions':
        return <CompetitionManagement />;
      case 'bracket':
        return <TournamentBracket />;
      case 'clubs':
        return <ClubManagement />;
      case 'categories':
        return <CategoryManagement />;
      default:
        return null;
    }
  };

  // Background particles for the main app
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-white/5 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.id * 0.2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 text-white/10 animate-bounce">
        <Trophy className="w-8 h-8" />
      </div>
      <div className="absolute top-40 right-32 text-white/10 animate-pulse">
        <Target className="w-6 h-6" />
      </div>
      <div className="absolute bottom-32 left-40 text-white/10 animate-bounce" style={{ animationDelay: '1s' }}>
        <Shield className="w-7 h-7" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 lg:hidden"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Flag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">TKD Competition Management</h1>
                  <p className="text-xs text-white/70">Système de gestion professionnel</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-xl">
                    <User className="w-4 h-4 text-white/80" />
                    <span className="text-sm text-white/90">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <AuthGuard fallback={
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl mb-6 shadow-2xl">
                  <Flag className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Bienvenue sur TKD Competition Management</h2>
                <p className="text-white/70 text-lg mb-8">Connectez-vous pour accéder au système de gestion des compétitions.</p>
              </div>
              <ModernAuthForm />
            </div>
          </div>
        }>
          <div className="flex flex-1">
            {/* Sidebar */}
            <aside className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed inset-y-0 left-0 z-50 w-72 backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
              <div className="flex items-center justify-between p-6 lg:hidden">
                <span className="text-lg font-semibold text-white">Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <nav className="mt-4 lg:mt-8">
                <ul className="space-y-2 px-6">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setCurrentView(item.id as ViewType);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                            currentView === item.id
                              ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30'
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon className={`w-5 h-5 transition-transform duration-300 ${
                            currentView === item.id ? 'scale-110' : 'group-hover:scale-105'
                          }`} />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
              <div className="p-6 lg:p-8">
                {renderContent()}
              </div>
            </main>
          </div>
        </AuthGuard>

        {/* Footer */}
        <Footer />
      </div>

      {/* Modal pour les matchs */}
      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onUpdateResult={handleUpdateMatch}
        />
      )}

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;