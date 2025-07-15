import React, { useState } from 'react';
import { useCompetitions, Competition } from '../hooks/useCompetitions';
import { useClubs, Joueur } from '../hooks/useClubs';
import { Plus, Edit2, Trash2, Trophy, MapPin, Users, UserPlus, Building, Target, X } from 'lucide-react';

const CompetitionManagement: React.FC = () => {
  const { 
    competitions, 
    categories,
    addCompetition, 
    updateCompetition, 
    deleteCompetition,
    getCategoriesByCompetition,
    loading, 
    error 
  } = useCompetitions();

  const { clubs, joueurs } = useClubs();

  const [showCompetitionForm, setShowCompetitionForm] = useState(false);
  const [showPlayerManagement, setShowPlayerManagement] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [selectedCompetitionForPlayers, setSelectedCompetitionForPlayers] = useState<Competition | null>(null);
  
  const [competitionFormData, setCompetitionFormData] = useState({
    nom: '',
    ville: ''
  });

  const resetCompetitionForm = () => {
    setCompetitionFormData({ nom: '', ville: '' });
    setShowCompetitionForm(false);
    setEditingCompetition(null);
  };

  const handleCompetitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompetition) {
      await updateCompetition(editingCompetition.id, competitionFormData);
    } else {
      await addCompetition(competitionFormData);
    }
    resetCompetitionForm();
  };

  const handleEditCompetition = (competition: Competition) => {
    setEditingCompetition(competition);
    setCompetitionFormData({
      nom: competition.nom,
      ville: competition.ville
    });
    setShowCompetitionForm(true);
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette compétition et toutes ses catégories ?')) {
      await deleteCompetition(competitionId);
    }
  };

  const handleManagePlayers = (competition: Competition) => {
    setSelectedCompetitionForPlayers(competition);
    setShowPlayerManagement(true);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active': return 'En cours';
      case 'completed': return 'Terminée';
      default: return 'Inscription';
    }
  };

  // Fonction pour vérifier si un joueur correspond à une catégorie
  const playerMatchesCategory = (joueur: Joueur, categorie: any) => {
    const age = new Date().getFullYear() - new Date(joueur.date_naissance.toDate()).getFullYear();
    const matchesAge = age >= categorie.age_min && age <= categorie.age_max;
    const matchesWeight = joueur.poids >= categorie.poids_min && joueur.poids <= categorie.poids_max;
    const matchesSex = categorie.sexe === 'Mixte' || joueur.sexe === categorie.sexe;
    
    return matchesAge && matchesWeight && matchesSex;
  };

  // Obtenir les joueurs éligibles pour une compétition
  const getEligiblePlayers = (competition: Competition) => {
    const competitionCategories = getCategoriesByCompetition(competition.id);
    return joueurs.filter(joueur => 
      competitionCategories.some(categorie => playerMatchesCategory(joueur, categorie))
    );
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Gestion des Compétitions</h2>
        <button
          onClick={() => setShowCompetitionForm(true)}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Compétition</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Total Compétitions</p>
              <p className="text-2xl font-bold text-white">{competitions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Total Catégories</p>
              <p className="text-2xl font-bold text-white">{categories.length}</p>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Compétitions Actives</p>
              <p className="text-2xl font-bold text-white">
                {competitions.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
              <MapPin className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Villes</p>
              <p className="text-2xl font-bold text-white">
                {new Set(competitions.map(c => c.ville)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des compétitions */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">
            Liste des compétitions ({competitions.length})
          </h3>
        </div>
        
        <div className="divide-y divide-white/10">
          {competitions.map((competition) => {
            const competitionCategories = getCategoriesByCompetition(competition.id);
            const eligiblePlayers = getEligiblePlayers(competition);
            
            return (
              <div key={competition.id} className="p-6 hover:bg-white/5 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{competition.nom}</h4>
                        <p className="text-sm text-white/70 flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{competition.ville}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(competition.status)}`}>
                        {getStatusText(competition.status)}
                      </span>
                      
                      <div className="flex items-center space-x-1 text-sm text-white/70">
                        <Target className="w-4 h-4" />
                        <span>{competitionCategories.length} catégorie{competitionCategories.length > 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-white/70">
                        <Users className="w-4 h-4" />
                        <span>{eligiblePlayers.length} joueur{eligiblePlayers.length > 1 ? 's' : ''} éligible{eligiblePlayers.length > 1 ? 's' : ''}</span>
                      </div>
                      
                      {competition.date_creation && (
                        <div className="text-sm text-white/60">
                          Créée le {new Date(competition.date_creation.toDate()).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>

                    {/* Aperçu des catégories */}
                    {competitionCategories.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-white/80 mb-2">Catégories:</h5>
                        <div className="flex flex-wrap gap-2">
                          {competitionCategories.slice(0, 3).map((categorie) => (
                            <span
                              key={categorie.id}
                              className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-white/10 text-white/80 border border-white/20"
                            >
                              {categorie.nom} ({categorie.poids_min}-{categorie.poids_max}kg)
                            </span>
                          ))}
                          {competitionCategories.length > 3 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-white/5 text-white/60 border border-white/10">
                              +{competitionCategories.length - 3} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => handleManagePlayers(competition)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 text-sm shadow-lg"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Gérer participants</span>
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCompetition(competition)}
                        className="flex items-center space-x-1 px-3 py-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCompetition(competition.id)}
                        className="flex items-center space-x-1 px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {competitions.length === 0 && (
            <div className="p-12 text-center">
              <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-2xl w-fit mx-auto mb-4">
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Aucune compétition</h3>
              <p className="text-white/70 mb-6">Commencez par créer votre première compétition.</p>
              <button
                onClick={() => setShowCompetitionForm(true)}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg"
              >
                Créer une compétition
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Compétition */}
      {showCompetitionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                {editingCompetition ? 'Modifier la compétition' : 'Nouvelle compétition'}
                </h3>
                <button
                  onClick={resetCompetitionForm}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCompetitionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nom de la compétition
                </label>
                <input
                  type="text"
                  required
                  value={competitionFormData.nom}
                  onChange={(e) => setCompetitionFormData({ ...competitionFormData, nom: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  placeholder="Ex: Championnat National Junior 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  required
                  value={competitionFormData.ville}
                  onChange={(e) => setCompetitionFormData({ ...competitionFormData, ville: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  placeholder="Ex: Casablanca"
                />
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl">
                <p className="text-sm text-blue-200">
                  <strong>Note:</strong> Après avoir créé la compétition, vous pourrez ajouter des catégories 
                  dans la section "Catégories\" du menu principal.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? 'Enregistrement...' : (editingCompetition ? 'Modifier' : 'Créer')}
                </button>
                <button
                  type="button"
                  onClick={resetCompetitionForm}
                  className="flex-1 bg-white/10 text-white/80 py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gestion des Participants */}
      {showPlayerManagement && selectedCompetitionForPlayers && (
        <PlayerManagementModal
          competition={selectedCompetitionForPlayers}
          categories={getCategoriesByCompetition(selectedCompetitionForPlayers.id)}
          clubs={clubs}
          joueurs={joueurs}
          onClose={() => {
            setShowPlayerManagement(false);
            setSelectedCompetitionForPlayers(null);
          }}
          playerMatchesCategory={playerMatchesCategory}
        />
      )}
    </div>
  );
};

// Composant Modal pour la gestion des participants
interface PlayerManagementModalProps {
  competition: Competition;
  categories: any[];
  clubs: any[];
  joueurs: Joueur[];
  onClose: () => void;
  playerMatchesCategory: (joueur: Joueur, categorie: any) => boolean;
}

const PlayerManagementModal: React.FC<PlayerManagementModalProps> = ({
  competition,
  categories,
  clubs,
  joueurs,
  onClose,
  playerMatchesCategory
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'club'>('individual');
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Obtenir les joueurs éligibles pour la compétition
  const eligiblePlayers = joueurs.filter(joueur => 
    categories.some(categorie => playerMatchesCategory(joueur, categorie))
  );

  // Obtenir les joueurs éligibles pour une catégorie spécifique
  const getPlayersForCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return [];
    return joueurs.filter(joueur => playerMatchesCategory(joueur, category));
  };

  // Obtenir les joueurs d'un club éligibles
  const getClubEligiblePlayers = (clubId: string) => {
    return eligiblePlayers.filter(joueur => joueur.club_id === clubId);
  };

  const handlePlayerToggle = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  const handleClubSelection = (clubId: string) => {
    const clubPlayers = getClubEligiblePlayers(clubId);
    const newSelected = new Set(selectedPlayers);
    
    // Si tous les joueurs du club sont déjà sélectionnés, les désélectionner
    const allSelected = clubPlayers.every(player => newSelected.has(player.id));
    
    if (allSelected) {
      clubPlayers.forEach(player => newSelected.delete(player.id));
    } else {
      clubPlayers.forEach(player => newSelected.add(player.id));
    }
    
    setSelectedPlayers(newSelected);
  };

  const handleAddPlayers = () => {
    // Ici vous pourriez ajouter la logique pour enregistrer les joueurs sélectionnés
    // dans la compétition via Firebase
    console.log('Joueurs sélectionnés:', Array.from(selectedPlayers));
    alert(`${selectedPlayers.size} joueur(s) ajouté(s) à la compétition "${competition.nom}"`);
    onClose();
  };

  const filteredPlayers = selectedCategory 
    ? getPlayersForCategory(selectedCategory)
    : eligiblePlayers;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Gérer les participants - {competition.nom}
              </h3>
              <p className="text-sm text-gray-600">{competition.ville}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
          
          {/* Onglets */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'individual'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Joueurs individuels
            </button>
            <button
              onClick={() => setActiveTab('club')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'club'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Building className="w-4 h-4 inline mr-2" />
              Par club
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Filtres */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nom} ({category.poids_min}-{category.poids_max}kg, {category.age_min}-{category.age_max} ans, {category.sexe})
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'individual' ? (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {filteredPlayers.length} joueur(s) éligible(s) • {selectedPlayers.size} sélectionné(s)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPlayers.map((joueur) => {
                  const age = new Date().getFullYear() - new Date(joueur.date_naissance.toDate()).getFullYear();
                  const isSelected = selectedPlayers.has(joueur.id);
                  
                  return (
                    <div
                      key={joueur.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePlayerToggle(joueur.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handlePlayerToggle(joueur.id)}
                          className="rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{joueur.nom_complet}</p>
                          <p className="text-xs text-gray-600">
                            {joueur.club_nom} • {joueur.sexe} • {joueur.poids}kg • {age} ans
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-4">
                {clubs.map((club) => {
                  const clubEligiblePlayers = getClubEligiblePlayers(club.id);
                  const selectedClubPlayers = clubEligiblePlayers.filter(p => selectedPlayers.has(p.id));
                  const allClubPlayersSelected = clubEligiblePlayers.length > 0 && 
                    clubEligiblePlayers.every(p => selectedPlayers.has(p.id));
                  
                  if (clubEligiblePlayers.length === 0) return null;
                  
                  return (
                    <div key={club.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={allClubPlayersSelected}
                            onChange={() => handleClubSelection(club.id)}
                            className="rounded border-gray-300"
                          />
                          <div>
                            <h4 className="font-medium text-gray-800">{club.nom}</h4>
                            <p className="text-sm text-gray-600">
                              {club.ville} • {clubEligiblePlayers.length} joueur(s) éligible(s)
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-blue-600">
                          {selectedClubPlayers.length}/{clubEligiblePlayers.length} sélectionnés
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                        {clubEligiblePlayers.map((joueur) => {
                          const age = new Date().getFullYear() - new Date(joueur.date_naissance.toDate()).getFullYear();
                          const isSelected = selectedPlayers.has(joueur.id);
                          
                          return (
                            <div
                              key={joueur.id}
                              className={`p-2 border rounded cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handlePlayerToggle(joueur.id)}
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handlePlayerToggle(joueur.id)}
                                  className="rounded border-gray-300"
                                />
                                <div>
                                  <p className="font-medium text-sm">{joueur.nom_complet}</p>
                                  <p className="text-xs text-gray-600">
                                    {joueur.sexe} • {joueur.poids}kg • {age} ans
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedPlayers.size} joueur(s) sélectionné(s)
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddPlayers}
                disabled={selectedPlayers.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Ajouter les participants
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionManagement;