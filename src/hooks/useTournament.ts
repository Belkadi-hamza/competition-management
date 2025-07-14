import { useState, useCallback, useEffect } from 'react';
import { Tournament, Player, Match } from '../types/tournament';

export const useTournament = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);

  const generateBracket = useCallback((players: Player[]): Match[] => {
    const numPlayers = players.length;
    if (numPlayers < 2) return [];
    
    const numRounds = Math.ceil(Math.log2(numPlayers));
    const nextPowerOfTwo = Math.pow(2, numRounds);
    const matches: Match[] = [];

    // Mélanger les joueurs pour un placement équitable
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

    // Générer les matchs pour chaque round
    for (let round = 1; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round);

      for (let position = 0; position < matchesInRound; position++) {
        const matchId = `${round}-${position}`;
        const match: Match = {
          id: matchId,
          round,
          position,
          player1: null,
          player2: null,
          winner: null,
          status: 'pending',
          scheduledTime: new Date(Date.now() + (round - 1) * 60 * 60 * 1000 + position * 30 * 60 * 1000)
        };

        if (round === 1) {
          // Premier round - assigner les joueurs
          const player1Index = position * 2;
          const player2Index = position * 2 + 1;
          
          match.player1 = shuffledPlayers[player1Index] || null;
          match.player2 = shuffledPlayers[player2Index] || null;
          
          if (match.player1 && !match.player2 && player1Index < numPlayers) {
            // Bye automatique
            match.winner = match.player1;
            match.status = 'completed';
          }
        }

        // Configurer le match suivant
        if (round < numRounds) {
          const nextRound = round + 1;
          const nextPosition = Math.floor(position / 2);
          match.nextMatchId = `${nextRound}-${nextPosition}`;
        }

        matches.push(match);
      }
    }

    return matches;
  }, []);

  const createTournament = useCallback((name: string, category: string, players: Player[]) => {
    const tournament: Tournament = {
      id: Date.now().toString(),
      name,
      category,
      date: new Date(),
      players,
      matches: generateBracket(players),
      status: 'registration',
      maxPlayers: Math.pow(2, Math.ceil(Math.log2(players.length))),
    };

    setTournaments(prev => [...prev, tournament]);
    setActiveTournament(tournament);
    return tournament;
  }, [generateBracket]);

  const updateMatchResult = useCallback((tournamentId: string, matchId: string, winner: Player, score?: { player1: number; player2: number }) => {
    setTournaments(prev => prev.map(tournament => {
      if (tournament.id !== tournamentId) return tournament;

      const updatedMatches = tournament.matches.map(match => {
        if (match.id === matchId) {
          return {
            ...match,
            winner,
            score,
            status: 'completed' as const
          };
        }
        return match;
      });

      // Avancer le gagnant au match suivant
      const currentMatch = updatedMatches.find(m => m.id === matchId);
      if (currentMatch?.nextMatchId) {
        const nextMatch = updatedMatches.find(m => m.id === currentMatch.nextMatchId);
        if (nextMatch) {
          const updatedNextMatch = { ...nextMatch };
          if (!updatedNextMatch.player1) {
            updatedNextMatch.player1 = winner;
          } else if (!updatedNextMatch.player2) {
            updatedNextMatch.player2 = winner;
          }

          // Remplacer le match suivant
          const nextMatchIndex = updatedMatches.findIndex(m => m.id === currentMatch.nextMatchId);
          if (nextMatchIndex !== -1) {
            updatedMatches[nextMatchIndex] = updatedNextMatch;
          }
        }
      }

      return {
        ...tournament,
        matches: updatedMatches
      };
    }));

    // Mettre à jour le tournoi actif
    setActiveTournament(prev => {
      if (prev?.id === tournamentId) {
        return tournaments.find(t => t.id === tournamentId) || null;
      }
      return prev;
    });
  }, [tournaments]);

  const addPlayer = useCallback((tournamentId: string, player: Player) => {
    setTournaments(prev => prev.map(tournament => {
      if (tournament.id !== tournamentId) return tournament;

      const updatedPlayers = [...tournament.players, player];
      return {
        ...tournament,
        players: updatedPlayers,
        matches: generateBracket(updatedPlayers)
      };
    }));
  }, [generateBracket]);

  const startTournament = useCallback((tournamentId: string) => {
    setTournaments(prev => prev.map(tournament => {
      if (tournament.id !== tournamentId) return tournament;
      return {
        ...tournament,
        status: 'active'
      };
    }));
  }, []);

  useEffect(() => {
    // Initialize with empty tournaments - data will come from database
  }, [tournaments.length, createTournament]);

  return {
    tournaments,
    activeTournament,
    createTournament,
    updateMatchResult,
    addPlayer,
    startTournament,
    setActiveTournament
  };
};