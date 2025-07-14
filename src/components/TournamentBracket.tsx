import React, { useState, useEffect, useMemo } from 'react';
import { useCompetitions } from '../hooks/useCompetitions';
import { useClubs, Joueur } from '../hooks/useClubs';
import { Trophy, Printer, Users, ChevronLeft, ChevronRight, Target, Flag, Play } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  club: string;
  weight: number;
  age: number;
  gender: string;
}

interface Match {
  id: string;
  round: number;
  position: number;
  player1: Player | null;
  player2: Player | null;
  winner: Player | null;
  status: 'pending' | 'in-progress' | 'completed';
  player1Score?: number;
  player2Score?: number;
}

// Create player groups (max 16 per group) - moved outside component for stability
const createPlayerGroups = (players: Player[]) => {
  const groups: Player[][] = [];
  const maxPlayersPerGroup = 16;
  
  for (let i = 0; i < players.length; i += maxPlayersPerGroup) {
    const group = players.slice(i, i + maxPlayersPerGroup);
    // Complete group to next power of 2
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(group.length)));
    while (group.length < nextPowerOfTwo && group.length < maxPlayersPerGroup) {
      group.push({
        id: `bye-${i}-${group.length}`,
        name: 'EXEMPT',
        club: 'EXEMPT',
        weight: 0,
        age: 0,
        gender: 'Mixte'
      });
    }
    groups.push(group);
  }
  
  return groups;
};

// Generate matches for a group - moved outside component for stability
const generateBracketForGroup = (players: Player[], groupIndex: number): Match[] => {
  const numPlayers = players.length;
  if (numPlayers < 2) return [];
  
  const numRounds = Math.ceil(Math.log2(numPlayers));
  const matches: Match[] = [];
  
  for (let round = 1; round <= numRounds; round++) {
    const matchesInRound = Math.pow(2, numRounds - round);
    
    for (let position = 0; position < matchesInRound; position++) {
      const matchId = `g${groupIndex}-${round}-${position}`;
      const match: Match = {
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
        
        // Handle automatic byes
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

// Process matches into rounds structure - helper function
const processMatchesIntoRounds = (matches: Match[]) => {
  const rounds: { [key: number]: Match[] } = {};
  
  matches.forEach(match => {
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
  
  return { rounds, roundNumbers, totalRounds, getRoundName };
};

const TournamentBracket: React.FC = () => {
  const { competitions, categories } = useCompetitions();
  const { joueurs } = useClubs();
  
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [tournamentPlayers, setTournamentPlayers] = useState<Player[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);

  // Get current group data - moved before useEffect to avoid initialization issues
  const playerGroups = createPlayerGroups(tournamentPlayers);
  const currentGroup = playerGroups[currentGroupIndex] || [];

  // Filter categories based on selected competition
  const availableCategories = selectedCompetition 
    ? categories.filter(cat => cat.competition_id === selectedCompetition)
    : [];

  // Check if a player matches the selected category
  const playerMatchesCategory = (joueur: Joueur, categorie: any) => {
    const age = new Date().getFullYear() - new Date(joueur.date_naissance.toDate()).getFullYear();
    const matchesAge = age >= categorie.age_min && age <= categorie.age_max;
    const matchesWeight = joueur.poids >= categorie.poids_min && joueur.poids <= categorie.poids_max;
    const matchesSex = categorie.sexe === 'Mixte' || joueur.sexe === categorie.sexe;
    
    return matchesAge && matchesWeight && matchesSex;
  };

  // Update tournament players when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category) {
        const eligiblePlayers = joueurs
          .filter(joueur => playerMatchesCategory(joueur, category))
          .map(joueur => ({
            id: joueur.id,
            name: joueur.nom_complet,
            club: joueur.club_nom || 'Club inconnu',
            weight: joueur.poids,
            age: new Date().getFullYear() - new Date(joueur.date_naissance.toDate()).getFullYear(),
            gender: joueur.sexe
          }));
        
        setTournamentPlayers(eligiblePlayers);
        setCurrentGroupIndex(0);
      }
    } else {
      setTournamentPlayers([]);
    }
  }, [selectedCategory, joueurs, categories]);

  // Update matches when current group changes
  useEffect(() => {
    if (currentGroup.length > 0) {
      const newMatches = generateBracketForGroup(currentGroup, currentGroupIndex);
      setMatches(newMatches);
    } else {
      setMatches([]);
    }
  }, [currentGroup, currentGroupIndex]);

  // Generate bracket for current group
  const generateGroupBracket = useMemo(() => {
    return processMatchesIntoRounds(matches);
  }, [matches]);

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

  // Handle setting a winner for a match
  const handleSetWinner = (match: Match, winner: Player | null) => {
    if (!winner) return;
    
    const updatedMatches = matches.map(m => {
      if (m.id === match.id) {
        return { ...m, winner, status: 'completed' };
      }
      
      // Update next round match with the winner
      if (m.round === match.round + 1) {
        const positionInNextRound = Math.floor(match.position / 2);
        if (m.position === positionInNextRound) {
          if (match.position % 2 === 0) {
            return { ...m, player1: winner, status: 'in-progress' };
          } else {
            return { ...m, player2: winner, status: 'in-progress' };
          }
        }
      }
      
      return m;
    });
    
    setMatches(updatedMatches);
  };

  // Generate HTML for printing
  const generateSingleGroupHTML = (groupPlayers: Player[], groupIndex: number, totalGroups: number) => {
    const selectedCat = categories.find(cat => cat.id === selectedCategory);
    const selectedComp = competitions.find(comp => comp.id === selectedCompetition);
    const weightCategory = getWeightCategory(groupPlayers);
    const pageTitle = `${selectedCat?.nom || 'Catégorie'} ${weightCategory}`;
    
    // Generate bracket data for this specific group
    const groupMatches = generateBracketForGroup(groupPlayers, groupIndex);
    const { rounds, roundNumbers, totalRounds, getRoundName } = processMatchesIntoRounds(groupMatches);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pageTitle} - Groupe ${groupIndex + 1} - ${selectedComp?.nom || 'Tournoi'}</title>
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
              <div class="subtitle">${selectedComp?.nom || 'TOURNOI'} - ${selectedComp?.ville || ''}</div>
              <div class="subtitle">ARBRE DE TOURNOI - Groupe ${groupIndex + 1} sur ${totalGroups}</div>
            </div>
            
            <div class="bracket-container">
              <div>
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
              <div class="champion-section">
                <div class="champion-trophy">🏆</div>
                <div class="champion-title">CHAMPION</div>
                <div style="border-bottom: 2px solid #000; width: 100px; height: 25px; margin: 10px auto;"></div>
                <div style="font-size: 8px; margin-top: 5px;">Nom du champion</div>
                <div style="border-bottom: 1px solid #000; width: 80px; height: 15px; margin: 5px auto;"></div>
                <div style="font-size: 8px; margin-top: 5px;">Club</div>
              </div>
              </div>
            </div>
            
            <div class="footer">
              Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} - TaeKwonDo Pro
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    if (tournamentPlayers.length === 0) {
      alert('Veuillez sélectionner une compétition et une catégorie avec des joueurs éligibles.');
      return;
    }

    const playerGroups = createPlayerGroups(tournamentPlayers);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const allGroupsHTML = playerGroups.map((group, groupIndex) => 
      generateSingleGroupHTML(group, groupIndex, playerGroups.length)
    ).join('<div style="page-break-after: always;"></div>');

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
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Composant PlayerSlot
  const PlayerSlot: React.FC<{ 
    player: Player | null; 
    isWinner?: boolean; 
    score?: number;
  }> = ({ player, isWinner, score }) => {
    const isExempt = player?.name === 'EXEMPT';
    
    return (
      <div className={`px-3 py-2 flex items-center justify-between transition-colors ${
        isWinner ? 
          'bg-green-100 font-semibold text-green-800' : 
        isExempt ?
          'bg-purple-50 text-purple-700' :
          'bg-white hover:bg-gray-50'
      }`}>
        <div className="flex items-center min-w-0">
          {isWinner && (
            <Trophy className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
          )}
          <span className={`text-sm truncate ${isExempt ? 'italic' : 'font-medium'}`}>
            {player?.name || 'À définir'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 ml-2">
          {score !== undefined && (
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              isWinner ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              {score}
            </span>
          )}
          {isExempt && (
            <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
              EXEMPT
            </span>
          )}
        </div>
      </div>
    );
  };

  const { rounds, roundNumbers, totalRounds, getRoundName } = generateGroupBracket;

  const selectedCat = categories.find(cat => cat.id === selectedCategory);
  const selectedComp = competitions.find(comp => comp.id === selectedCompetition);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Arbre de Tournoi</h2>
      </div>

      {/* Selection Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Sélection de la compétition et catégorie</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flag className="w-4 h-4 inline mr-1" />
              Compétition
            </label>
            <select
              value={selectedCompetition}
              onChange={(e) => {
                setSelectedCompetition(e.target.value);
                setSelectedCategory('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une compétition</option>
              {competitions.map(competition => (
                <option key={competition.id} value={competition.id}>
                  {competition.nom} - {competition.ville}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedCompetition}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Sélectionner une catégorie</option>
              {availableCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nom} ({category.poids_min}-{category.poids_max}kg, {category.age_min}-{category.age_max} ans, {category.sexe})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCompetition && selectedCategory && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {selectedComp?.nom} - {selectedCat?.nom}
                </p>
                <p className="text-sm text-blue-600">
                  {tournamentPlayers.length} joueur(s) éligible(s) trouvé(s)
                </p>
              </div>
              {tournamentPlayers.length > 0 && (
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tournament Bracket Display */}
      {tournamentPlayers.length > 0 ? (
        <div className="p-6 bg-gray-50 rounded-lg shadow-lg overflow-x-auto">
          {/* Navigation between groups */}
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
                  {selectedCat?.nom} {getWeightCategory(currentGroup)}
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

          {/* Tournament Header */}
          <div className="mb-6 text-center bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 rounded-lg shadow text-white">
            <h2 className="text-2xl font-bold mb-2">🥋 TOURNOI D'ÉLIMINATION</h2>
            <p className="text-blue-100">
              {selectedComp?.nom} - {selectedCat?.nom}
            </p>
            <p className="text-sm text-blue-200">
              Groupe {currentGroupIndex + 1} - {currentGroup.filter(p => p.name !== 'EXEMPT').length} participants
            </p>
          </div>

          {/* Bracket Container */}
          <div className="relative" style={{ 
            minWidth: totalRounds * 280 + 'px',
            minHeight: '600px'
          }}>
            {/* Connection lines between matches */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              {roundNumbers.slice(0, -1).map(roundNum => {
                const nextRound = roundNum + 1;
                return rounds[roundNum]?.map((match, idx) => {
                  const nextMatchPosition = Math.floor(idx / 2);
                  const nextMatch = rounds[nextRound]?.[nextMatchPosition];
                  if (!nextMatch) return null;

                  return (
                    <g key={`connector-${match.id}`}>
                      {/* Line to next match */}
                      <path 
                        d={`
                          M ${280 * roundNum + 240} ${120 + idx * 120}
                          L ${280 * nextRound + 40} ${120 + nextMatchPosition * 240 + 60}
                        `}
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="4,2"
                        fill="none"
                      />
                      {/* Start point */}
                      <circle cx={280 * roundNum + 240} cy={120 + idx * 120} r="4" fill="#64748b" />
                      {/* End point */}
                      <circle cx={280 * nextRound + 40} cy={120 + nextMatchPosition * 240 + 60} r="4" fill="#64748b" />
                    </g>
                  );
                });
              })}
            </svg>

            {/* Bracket Content */}
            <div className="relative z-10 flex">
              {/* Round columns */}
              {roundNumbers.map((roundNum) => {
                const matchesInRound = rounds[roundNum];
                const roundName = getRoundName(roundNum);
                
                return (
                  <div 
                    key={roundNum} 
                    className="flex flex-col items-center"
                    style={{ width: '280px' }}
                  >
                    {/* Round title */}
                    <div className="mb-4 w-full text-center">
                      <div className={`inline-block px-4 py-2 rounded-full shadow-md ${
                        roundName.includes('FINALE') ? 
                          'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' :
                          'bg-white border-2 border-blue-600 text-blue-800'
                      }`}>
                        <h3 className="text-sm font-bold uppercase tracking-tight">
                          {roundName}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Matches list */}
                    <div className="space-y-8 w-full">
                      {matchesInRound.map((match, matchIdx) => (
                        <div 
                          key={match.id} 
                          className={`relative transition-all duration-200 ${
                            match.status === 'completed' ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                          }`}
                          style={{
                            marginTop: matchIdx > 0 ? '40px' : '0',
                            marginBottom: matchIdx < matchesInRound.length - 1 ? '40px' : '0'
                          }}
                        >
                          {/* Match card */}
                          <div className={`border-2 rounded-lg overflow-hidden shadow-sm transition-all ${
                            match.status === 'completed' ? 
                              'border-green-500 bg-green-50' :
                            match.status === 'in-progress' ?
                              'border-blue-500 bg-blue-50' :
                              'border-gray-300 bg-white'
                          }`}>
                            {/* Match header */}
                            <div className={`px-3 py-2 flex items-center justify-between ${
                              match.status === 'completed' ? 
                                'bg-green-600' :
                              match.status === 'in-progress' ?
                                'bg-blue-600' :
                                'bg-gray-600'
                            }`}>
                              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                                Match {match.position + 1}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3 text-white" />
                                <span className="text-xs text-white">
                                  {[match.player1, match.player2].filter(p => p && p.name !== 'EXEMPT').length}/2
                                </span>
                              </div>
                            </div>
                            
                            {/* Players */}
                            <div className="divide-y divide-gray-200">
                              <PlayerSlot 
                                player={match.player1} 
                                isWinner={match.winner?.id === match.player1?.id}
                                score={match.player1Score}
                              />
                              <div className="h-8 flex items-center justify-center bg-gray-100">
                                <span className="text-xs font-bold text-gray-600">VS</span>
                              </div>
                              <PlayerSlot 
                                player={match.player2} 
                                isWinner={match.winner?.id === match.player2?.id}
                                score={match.player2Score}
                              />
                            </div>
                            
                            {/* Actions */}
                            {match.status !== 'completed' && (
                              <div className="px-2 py-1 bg-gray-50 border-t border-gray-200 flex justify-end">
                                <button 
                                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  onClick={() => handleSetWinner(match, match.player1)}
                                  disabled={!match.player1 || match.player1.name === 'EXEMPT'}
                                >
                                  Vainqueur
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Champion Section */}
              {totalRounds > 0 && (
                <div className="ml-8 flex flex-col items-center">
                  <div className="mb-4 w-full text-center">
                    <div className="inline-block px-4 py-2 rounded-full shadow-md bg-gradient-to-r from-yellow-400 to-yellow-500">
                      <h3 className="text-sm font-bold uppercase tracking-tight text-yellow-900">
                        CHAMPION
                      </h3>
                    </div>
                  </div>
                  
                  <div className="relative mt-8">
                    <div className="absolute -top-4 -left-4 -right-4 -bottom-4 bg-yellow-200 rounded-xl opacity-30"></div>
                    <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-yellow-600 px-8 py-6 rounded-lg shadow-lg text-center">
                      <div className="flex justify-center mb-3">
                        <Trophy className="w-12 h-12 text-yellow-800" />
                      </div>
                      <h3 className="font-bold text-xl uppercase tracking-wide mb-4 text-yellow-900">
                        Vainqueur
                      </h3>
                      {(() => {
                        const finalMatch = rounds[totalRounds]?.[0];
                        return finalMatch?.winner ? (
                          <div className="animate-bounce">
                            <p className="font-bold text-lg text-yellow-900">{finalMatch.winner.name}</p>
                            <p className="text-sm text-yellow-800 font-medium">
                              {finalMatch.winner.club}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-yellow-800 font-medium italic">
                            À déterminer
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 flex justify-center space-x-4">
            {[
              { label: "Match terminé", color: "bg-green-500", border: "border-green-600" },
              { label: "Match en cours", color: "bg-blue-500", border: "border-blue-600" },
              { label: "Match à venir", color: "bg-gray-400", border: "border-gray-500" },
              { label: "Exempt", color: "bg-purple-400", border: "border-purple-500" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${item.color} ${item.border} border-2`}></div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : selectedCompetition && selectedCategory ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun joueur éligible</h3>
          <p className="text-gray-600">
            Aucun joueur ne correspond aux critères de cette catégorie.
          </p>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Sélectionnez une compétition et catégorie</h3>
          <p className="text-gray-600">
            Choisissez une compétition et une catégorie pour générer l'arbre de tournoi.
          </p>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;