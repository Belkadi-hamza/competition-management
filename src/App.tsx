import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTournament } from './hooks/useTournament';
import AuthGuard from './components/AuthGuard';
import AuthModal from './components/AuthModal';
import TournamentDashboard from './components/TournamentDashboard';
import TournamentBracket from './components/TournamentBracket';
import PlayerManagement from './components/PlayerManagement';
import MatchModal from './components/MatchModal';
import { Match, Player } from './types/tournament';
import { 
  Trophy, 
  Users, 
  Settings, 
  Home, 
  Menu, 
  X,
  Target,
  Award,
  LogOut,
  User
} from 'lucide-react';

type ViewType = 'dashboard' | 'bracket' | 'players' | 'settings';

function App() {
  const { user, logout } = useAuth();
  const { 
    tournaments, 
    activeTournament, 
    createTournament, 
    updateMatchResult, 
    addPlayer,
    startTournament,
    setActiveTournament 
  } = useTournament();

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  const handleAddPlayer = (player: Player) => {
    if (activeTournament) {
      addPlayer(activeTournament.id, player);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
    { id: 'bracket', label: 'Arbre de Tournoi', icon: Target },
    { id: 'players', label: 'Joueurs', icon: Users },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <TournamentDashboard
            tournaments={tournaments}
            activeTournament={activeTournament}
            onSelectTournament={setActiveTournament}
            onStartTournament={startTournament}
          />
        );
      case 'bracket':
        return activeTournament ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{activeTournament.name}</h1>
                <p className="text-gray-600">{activeTournament.category} • {activeTournament.players.length} participants</p>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">
                  {activeTournament.status === 'completed' ? 'Terminé' : 
                   activeTournament.status === 'active' ? 'En cours' : 'Inscription'}
                </span>
              </div>
            </div>
            <TournamentBracket
              matches={activeTournament.matches}
              tournament={activeTournament}
              onMatchClick={handleMatchClick}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun tournoi sélectionné</h3>
            <p className="text-gray-600">Sélectionnez un tournoi dans le tableau de bord pour voir l'arbre.</p>
          </div>
        );
      case 'players':
        return activeTournament ? (
          <PlayerManagement
            players={activeTournament.players}
            onAddPlayer={handleAddPlayer}
            onEditPlayer={(player) => {
              // Logique de modification du joueur
            }}
            onDeletePlayer={(playerId) => {
              // Logique de suppression du joueur
            }}
          />
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun tournoi sélectionné</h3>
            <p className="text-gray-600">Sélectionnez un tournoi pour gérer les joueurs.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Configuration du Tournoi</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du tournoi
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du tournoi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Senior Mixte</option>
                    <option>Junior Mixte</option>
                    <option>Cadet Mixte</option>
                    <option>Vétéran Mixte</option>
                  </select>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Créer nouveau tournoi
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">TaeKwonDo Pro</h1>
                <p className="text-xs text-gray-500">Système de Tournoi</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {activeTournament && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">{activeTournament.name}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{activeTournament.players.length} participants</span>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthGuard fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue sur TaeKwonDo Pro</h2>
            <p className="text-gray-600 mb-6">Connectez-vous pour accéder au système de tournoi.</p>
            <div className="space-y-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors block mx-auto"
              >
                Se connecter
              </button>
              <p className="text-sm text-gray-500">
                Nouveau ? Cliquez sur "Se connecter" puis "Pas de compte ? S'inscrire"
              </p>
            </div>
          </div>
        </div>
      }>
        <div className="flex">
          {/* Sidebar */}
          <aside className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
            <div className="flex items-center justify-between p-4 lg:hidden">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <nav className="mt-4 lg:mt-0">
              <ul className="space-y-1 px-4">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setCurrentView(item.id as ViewType);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          currentView === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
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
            <div className="p-4 lg:p-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </AuthGuard>

      {/* Modal pour les matchs */}
      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onUpdateResult={handleUpdateMatch}
        />
      )}

      {/* Modal d'authentification */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;