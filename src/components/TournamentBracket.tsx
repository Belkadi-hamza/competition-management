import React from 'react';
import { Match, Player, Tournament } from '../types/tournament';
import { Trophy, Printer, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface TournamentBracketProps {
  matches: Match[];
  tournament: Tournament;
  onMatchClick: (match: Match) => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches, tournament, onMatchClick }) => {
  const [currentGroupIndex, setCurrentGroupIndex] = React.useState(0);

  // Diviser les joueurs en groupes de 16 maximum
  const createPlayerGroups = (players: Player[]) => {
    const groups: Player[][] = [];
    const maxPlayersPerGroup = 16;
    
    for (let i = 0; i < players.length; i += maxPlayersPerGroup) {
      const group = players.slice(i, i + maxPlayersPerGroup);
      // Compléter le groupe pour avoir une puissance de 2
      const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(group.length)));
      while (group.length < nextPowerOfTwo && group.length < maxPlayersPerGroup) {
        group.push({
          id: `bye-${i}-${group.length}`,
          name: 'EXEMPT',
          category: tournament.category,
          weight: 0,
          age: 0,
          belt: '',
          club: 'EXEMPT'
        });
      }
      groups.push(group);
    }
    
    return groups;
  };

  // Générer les matchs pour un groupe spécifique
  const generateBracketForGroup = (players: Player[], groupIndex: number) => {
    const numPlayers = players.length;
    if (numPlayers < 2) return [];
    
    const numRounds = Math.ceil(Math.log2(numPlayers));
    const matches: any[] = [];
    
    for (let round = 1; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round);
      
      for (let position = 0; position < matchesInRound; position++) {
        const matchId = `g${groupIndex}-${round}-${position}`;
        const match = {
          id: matchId,
          round,
          position,
          player1: null,
          player2: null,
          winner: null,
          status: 'pending'
        };
        
        if (round === 1) {
          const player1Index = position * 2;
          const player2Index = position * 2 + 1;
          
          match.player1 = players[player1Index] || null;
          match.player2 = players[player2Index] || null;
          
          // Gestion des byes automatiques
          if (match.player1 && match.player1.name === 'EXEMPT') {
            match.winner = match.player2;
            match.status = 'completed';
          } else if (match.player2 && match.player2.name === 'EXEMPT') {
            match.winner = match.player1;
            match.status = 'completed';
          }
        }
        
        matches.push(match);
      }
    }
    
    return matches;
  };

  // Générer un arbre pour un groupe spécifique
  const generateGroupBracket = (groupPlayers: Player[], groupIndex: number) => {
    const groupMatches = generateBracketForGroup(groupPlayers, groupIndex);
    const rounds: { [key: number]: any[] } = {};
    
    groupMatches.forEach(match => {
      if (!rounds[match.round]) {
        rounds[match.round] = [];
      }
      rounds[match.round].push(match);
    });
    
    const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);
    const totalRounds = roundNumbers.length;
    
    const getRoundName = (roundNum: number) => {
      const roundsFromEnd = totalRounds - roundNum;
      switch (roundsFromEnd) {
        case 0: return 'FINALE';
        case 1: return 'DEMI-FINALES';
        case 2: return 'QUARTS DE FINALE';
        case 3: return 'HUITIÈMES DE FINALE';
        default: return `${Math.pow(2, roundsFromEnd + 1)}ème DE FINALE`;
      }
    };
    
    return { rounds, roundNumbers, totalRounds, getRoundName, groupMatches };
  };

  const getWeightCategory = (players: Player[]) => {
    const weights = players.filter(p => p.weight > 0 && p.name !== 'EXEMPT').map(p => p.weight);
    if (weights.length === 0) return '';
    
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    
    if (minWeight === maxWeight) {
      return `${minWeight}kg`;
    }
    return `${minWeight}-${maxWeight}kg`;
  };

  const generateSingleGroupHTML = (groupPlayers: Player[], groupIndex: number, totalGroups: number) => {
    const weightCategory = getWeightCategory(groupPlayers);
    const pageTitle = `${tournament.category} ${weightCategory}`;
    
    const { rounds, roundNumbers, totalRounds, getRoundName } = generateGroupBracket(groupPlayers, groupIndex);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pageTitle} - Groupe ${groupIndex + 1} - Tournoi Taekwondo</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4 portrait;
              margin: 1cm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 11px;
              line-height: 1.3;
              color: #000;
              background: #fff;
            }
            
            .page-container {
              width: 100%;
              min-height: 100vh;
              padding: 15px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding: 15px;
              border: 2px solid #000;
              background: #f5f5f5;
            }
            
            .header h1 {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            
            .header .subtitle {
              font-size: 14px;
              margin-bottom: 3px;
            }
            
            .header .date {
              font-size: 12px;
            }
            
            .bracket-container {
              display: flex;
              justify-content: space-between;
              gap: 15px;
              min-height: 600px;
            }
            
            .round-column {
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            
            .round-title {
              background: #4a90e2;
              color: white;
              padding: 8px 12px;
              text-align: center;
              font-weight: bold;
              font-size: 10px;
              text-transform: uppercase;
              margin-bottom: 15px;
              border-radius: 15px;
            }
            
            .matches-container {
              display: flex;
              flex-direction: column;
              justify-content: space-around;
              flex: 1;
              gap: 10px;
            }
            
            .match-card {
              background: white;
              border: 1px solid #ccc;
              border-radius: 5px;
              overflow: hidden;
              min-height: 60px;
            }
            
            .match-header {
              background: #666;
              color: white;
              padding: 4px 8px;
              text-align: center;
              font-weight: bold;
              font-size: 9px;
              text-transform: uppercase;
            }
            
            .players-section {
              padding: 8px;
            }
            
            .player-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 3px 0;
              border-bottom: 1px solid #eee;
              min-height: 18px;
            }
            
            .player-row:last-child {
              border-bottom: none;
            }
            
            .player-info {
              flex: 1;
              font-size: 9px;
              font-weight: 500;
              margin-right: 8px;
            }
            
            .score-box {
              border: 1px solid #ccc;
              width: 25px;
              height: 16px;
              text-align: center;
              font-size: 9px;
              background: #f9f9f9;
            }
            
            .vs-divider {
              text-align: center;
              font-weight: bold;
              color: #999;
              font-size: 8px;
              margin: 2px 0;
            }
            
            .champion-section {
              background: #ffd700;
              border: 2px solid #000;
              padding: 15px;
              text-align: center;
              min-width: 120px;
              border-radius: 5px;
            }
            
            .champion-trophy {
              font-size: 24px;
              margin-bottom: 5px;
            }
            
            .champion-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            
            .champion-fields {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            
            .field-group {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 3px;
            }
            
            .field-group label {
              font-size: 10px;
              font-weight: bold;
            }
            
            .field-line {
              border-bottom: 1px solid #000;
              width: 80px;
              height: 15px;
            }
            
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 9px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            
            @media print {
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="header">
              <h1>${pageTitle.toUpperCase()}</h1>
              <div class="subtitle">ARBRE DE TOURNOI - Groupe ${groupIndex + 1} sur ${totalGroups}</div>
            </div>
            
            <div class="bracket-container">
              ${roundNumbers.map((roundNum) => {
                const matchesInRound = rounds[roundNum];
                const roundName = getRoundName(roundNum);
                
                return `
                  <div class="round-column">
                    <div class="round-title">${roundName}</div>
                    <div class="matches-container">
                      ${matchesInRound.map((match) => `
                        <div class="match-card">
                          <div class="match-header">
                            MATCH ${match.position + 1}
                          </div>
                          <div class="players-section">
                            <div class="player-row">
                              <span class="player-info">${match.player1 && match.player1.name !== 'EXEMPT' ? match.player1.name : ''}</span>
                              <div class="score-box"></div>
                            </div>
                            <div class="vs-divider">VS</div>
                            <div class="player-row">
                              <span class="player-info">${match.player2 && match.player2.name !== 'EXEMPT' ? match.player2.name : ''}</span>
                              <div class="score-box"></div>
                            </div>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };
  
const handlePrint = () => {
  const playerGroups = createPlayerGroups(tournament.players);
  
  // Create a single print window with all groups
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Generate HTML for all groups
  const allGroupsHTML = playerGroups.map((group, groupIndex) => 
    generateSingleGroupHTML(group, groupIndex, playerGroups.length)
  ).join('<div style="page-break-after: always;"></div>'); // Add page break between groups

  // Combine into a single document
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tournoi Taekwondo - Tous les groupes</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          body {
            font-family: Arial, sans-serif;
          }
          .page-break {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        ${allGroupsHTML}
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  
  // Delay to allow content to load before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close(); // Close the window after printing
  }, 500);
};

  const PlayerSlot: React.FC<{ 
    player: Player | null; 
    isWinner?: boolean; 
    score?: number;
    onClick?: () => void;
  }> = ({ player, isWinner, score, onClick }) => (
    <div 
      className={`h-10 px-3 flex items-center justify-between border-b border-gray-200 cursor-pointer transition-colors ${
        isWinner 
          ? 'bg-green-100 font-semibold text-green-800' 
          : 'bg-white hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <span className="text-sm truncate flex-1 font-medium">
        {player && player.name !== 'EXEMPT' ? player.name : player?.name === 'EXEMPT' ? 'EXEMPT' : 'En attente'}
      </span>
      <div className="flex items-center space-x-2">
        {score !== undefined && (
          <span className={`text-sm font-bold px-2 py-1 rounded text-white ${
            isWinner ? 'bg-green-600' : 'bg-gray-600'
          }`}>
            {score}
          </span>
        )}
        {isWinner && <Trophy className="w-4 h-4 text-yellow-600" />}
      </div>
    </div>
  );

  const MatchBox: React.FC<{ 
    match: any; 
    onClick: () => void;
  }> = ({ match, onClick }) => (
    <div className="w-full max-w-xs mx-auto">
      <div 
        className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
          match.status === 'completed' ? 'border-green-400 bg-green-50' :
          match.status === 'active' ? 'border-blue-400 bg-blue-50' :
          'border-gray-300 bg-white'
        }`}
        onClick={onClick}
      >
        <div className="bg-gray-600 px-3 py-2 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white uppercase">
              MATCH {match.position + 1}
            </span>
            <Users className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <PlayerSlot 
          player={match.player1} 
          isWinner={match.winner?.id === match.player1?.id}
          score={match.score?.player1}
          onClick={onClick}
        />
        <PlayerSlot 
          player={match.player2} 
          isWinner={match.winner?.id === match.player2?.id}
          score={match.score?.player2}
          onClick={onClick}
        />
      </div>
    </div>
  );

  // Créer les groupes de joueurs
  const playerGroups = createPlayerGroups(tournament.players);
  const currentGroup = playerGroups[currentGroupIndex] || [];
  const { rounds, roundNumbers, totalRounds, getRoundName } = generateGroupBracket(currentGroup, currentGroupIndex);

  const getWeightCategoryForGroup = (groupPlayers: Player[]) => {
    const weights = groupPlayers.filter(p => p.weight > 0 && p.name !== 'EXEMPT').map(p => p.weight);
    if (weights.length === 0) return '';
    
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    
    if (minWeight === maxWeight) {
      return `${minWeight}kg`;
    }
    return `${minWeight}-${maxWeight}kg`;
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-lg overflow-x-auto">
      {/* Navigation entre groupes */}
      {playerGroups.length > 1 && (
        <div className="mb-6 flex items-center justify-center space-x-4">
          <button
            onClick={() => setCurrentGroupIndex(Math.max(0, currentGroupIndex - 1))}
            disabled={currentGroupIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Groupe Précédent</span>
          </button>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              Groupe {currentGroupIndex + 1} sur {playerGroups.length}
            </div>
            <div className="text-sm text-gray-600">
              {tournament.category} {getWeightCategoryForGroup(currentGroup)}
            </div>
          </div>
          
          <button
            onClick={() => setCurrentGroupIndex(Math.min(playerGroups.length - 1, currentGroupIndex + 1))}
            disabled={currentGroupIndex === playerGroups.length - 1}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <span>Groupe Suivant</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="mb-6 text-center">
        <div className="flex items-center justify-between">
          <div></div>
          <div className="bg-white border-2 border-gray-300 px-6 py-4 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">🥋 ARBRE DE TOURNOI</h2>
            <p className="text-gray-600">Groupe {currentGroupIndex + 1} - {currentGroup.filter(p => p.name !== 'EXEMPT').length} participants</p>
          </div>
          <button
  onClick={handlePrint}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow"
>
  <Printer className="w-5 h-5" />
  <span className="font-semibold">Imprimer</span>
</button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-inner" style={{ 
        minWidth: totalRounds * 280 + 200 + 'px', 
        minHeight: '600px' 
      }}>
        <div className="flex justify-between items-start gap-6">
          {/* Render rounds */}
          {roundNumbers.map((roundNum) => {
            const matchesInRound = rounds[roundNum];
            const roundName = getRoundName(roundNum);
            
            return (
              <div key={roundNum} className="flex-1 min-w-0">
                {/* Round title */}
                <div className="mb-6 text-center">
                  <h3 className="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-full shadow uppercase">
                    {roundName}
                  </h3>
                </div>
                
                {/* Matches in round */}
                <div className="space-y-4 flex flex-col justify-center" style={{
                  minHeight: '400px'
                }}>
                  {matchesInRound.map((match) => (
                    <MatchBox
                      key={match.id}
                      match={match}
                      onClick={() => {
                        if (match.player1 && match.player2 && match.player1.name !== 'EXEMPT' && match.player2.name !== 'EXEMPT') {
                          onMatchClick(match);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Winner section */}
          {totalRounds > 0 && (
            <div className="flex-shrink-0">
              <div className="text-center">
                <div className="bg-yellow-400 border-2 border-yellow-600 px-6 py-6 rounded-lg shadow-lg">
                  <div className="flex justify-center mb-3">
                    <Trophy className="w-10 h-10 text-yellow-800" />
                  </div>
                  <h3 className="font-bold text-lg uppercase tracking-wide mb-4 text-yellow-800">CHAMPION</h3>
                  {(() => {
                    const finalMatch = rounds[totalRounds]?.[0];
                    return finalMatch?.winner ? (
                      <div className="space-y-2">
                        <p className="font-bold text-lg text-yellow-800">{finalMatch.winner.name}</p>
                        <p className="text-sm text-yellow-700 font-medium">{finalMatch.winner.club}</p>
                        <div className="mt-3 px-3 py-1 bg-yellow-800 text-yellow-100 rounded-full text-xs font-semibold">
                          {finalMatch.winner.belt}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-yellow-700 font-medium">À déterminer</p>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded shadow">
          <div className="w-4 h-4 border-2 border-green-400 bg-green-50 rounded"></div>
          <span className="font-medium">Match terminé</span>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded shadow">
          <div className="w-4 h-4 border-2 border-blue-400 bg-blue-50 rounded"></div>
          <span className="font-medium">Match en cours</span>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded shadow">
          <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
          <span className="font-medium">Match à venir</span>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;