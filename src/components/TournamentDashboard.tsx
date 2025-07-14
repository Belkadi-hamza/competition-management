import React from 'react';
import { Tournament } from '../types/tournament';
import { Trophy, Users, Calendar, Play, CheckCircle, Clock } from 'lucide-react';

interface TournamentDashboardProps {
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  onSelectTournament: (tournament: Tournament) => void;
  onStartTournament: (tournamentId: string) => void;
}

const TournamentDashboard: React.FC<TournamentDashboardProps> = ({
  tournaments,
  activeTournament,
  onSelectTournament,
  onStartTournament
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'active':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Play className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'active':
        return 'En cours';
      default:
        return 'Inscription';
    }
  };

  const getTournamentStats = (tournament: Tournament) => {
    const completedMatches = tournament.matches.filter(m => m.status === 'completed').length;
    const totalMatches = tournament.matches.length;
    const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

    return {
      completedMatches,
      totalMatches,
      progress: Math.round(progress),
      winner: tournament.matches.find(m => m.round === Math.max(...tournament.matches.map(match => match.round)))?.winner
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Tableau de Bord</h2>
        <div className="text-sm text-gray-500">
          {tournaments.length} tournoi{tournaments.length > 1 ? 's' : ''} au total
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tournois Terminés</p>
              <p className="text-2xl font-bold text-gray-800">
                {tournaments.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tournois Actifs</p>
              <p className="text-2xl font-bold text-gray-800">
                {tournaments.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-800">
                {tournaments.reduce((sum, t) => sum + t.players.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Ce Mois</p>
              <p className="text-2xl font-bold text-gray-800">
                {tournaments.filter(t => 
                  new Date(t.date).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tournois */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Tournois</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {tournaments.map((tournament) => {
            const stats = getTournamentStats(tournament);
            return (
              <div
                key={tournament.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  activeTournament?.id === tournament.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => onSelectTournament(tournament)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{tournament.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                        {getStatusIcon(tournament.status)}
                        <span className="ml-1">{getStatusText(tournament.status)}</span>
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{tournament.players.length} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(tournament.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4" />
                        <span>{tournament.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{stats.completedMatches}/{stats.totalMatches} matchs</span>
                      </div>
                    </div>

                    {tournament.status === 'active' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progression</span>
                          <span className="font-medium">{stats.progress}%</span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {stats.winner && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-800">
                          Champion: {stats.winner.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    {tournament.status === 'registration' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartTournament(tournament.id);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Démarrer
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTournament(tournament);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TournamentDashboard;