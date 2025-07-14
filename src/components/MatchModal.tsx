import React, { useState } from 'react';
import { Match, Player } from '../types/tournament';
import { X, Trophy, Clock, Users } from 'lucide-react';

interface MatchModalProps {
  match: Match;
  onClose: () => void;
  onUpdateResult: (winner: Player, score?: { player1: number; player2: number }) => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ match, onClose, onUpdateResult }) => {
  const [selectedWinner, setSelectedWinner] = useState<Player | null>(match.winner);
  const [player1Score, setPlayer1Score] = useState<number>(match.score?.player1 || 0);
  const [player2Score, setPlayer2Score] = useState<number>(match.score?.player2 || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWinner) {
      onUpdateResult(selectedWinner, { player1: player1Score, player2: player2Score });
      onClose();
    }
  };

  const getStatusBadge = () => {
    switch (match.status) {
      case 'completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Trophy className="w-3 h-3 mr-1" />
          Terminé
        </span>;
      case 'active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          En cours
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Users className="w-3 h-3 mr-1" />
          En attente
        </span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Match Détails
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="mt-2">
            {getStatusBadge()}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Joueurs */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Combattants</h3>
              
              {match.player1 && (
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  selectedWinner?.id === match.player1.id
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{match.player1.name}</p>
                      <p className="text-sm text-gray-600">{match.player1.club}</p>
                      <p className="text-xs text-gray-500">
                        {match.player1.weight}kg • {match.player1.belt}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {player1Score}
                      </div>
                      {selectedWinner?.id === match.player1.id && (
                        <Trophy className="w-5 h-5 text-yellow-600 mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center text-gray-400 font-medium">
                VS
              </div>

              {match.player2 && (
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  selectedWinner?.id === match.player2.id
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{match.player2.name}</p>
                      <p className="text-sm text-gray-600">{match.player2.club}</p>
                      <p className="text-xs text-gray-500">
                        {match.player2.weight}kg • {match.player2.belt}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {player2Score}
                      </div>
                      {selectedWinner?.id === match.player2.id && (
                        <Trophy className="w-5 h-5 text-yellow-600 mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Formulaire de résultat */}
            {match.player1 && match.player2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Résultat du match</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Score {match.player1.name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={player1Score}
                      onChange={(e) => setPlayer1Score(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Score {match.player2.name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={player2Score}
                      onChange={(e) => setPlayer2Score(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vainqueur
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="winner"
                        value={match.player1.id}
                        checked={selectedWinner?.id === match.player1.id}
                        onChange={() => setSelectedWinner(match.player1)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{match.player1.name}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="winner"
                        value={match.player2.id}
                        checked={selectedWinner?.id === match.player2.id}
                        onChange={() => setSelectedWinner(match.player2)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{match.player2.name}</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={!selectedWinner}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirmer le résultat
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;