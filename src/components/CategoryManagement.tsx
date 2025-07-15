import React, { useState } from 'react';
import { useCompetitions, Competition, Categorie } from '../hooks/useCompetitions';
import { useClubs, Joueur } from '../hooks/useClubs';
import { Plus, Edit2, Trash2, Target, Users, Trophy, Weight, Calendar, User, X } from 'lucide-react';

const CategoryManagement: React.FC = () => {
  const { 
    competitions, 
    categories, 
    addCategorie,
    updateCategorie,
    deleteCategorie,
    getCategoriesByCompetition,
    loading, 
    error 
  } = useCompetitions();

  const { joueurs } = useClubs();

  const [showCategorieForm, setShowCategorieForm] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [filterCompetition, setFilterCompetition] = useState<string>('');
  
  const [categorieFormData, setCategorieFormData] = useState({
    nom: '',
    poids_min: '',
    poids_max: '',
    age_min: '',
    age_max: '',
    sexe: 'Mixte' as 'Garçon' | 'Fille' | 'Mixte'
  });

  const resetCategorieForm = () => {
    setCategorieFormData({ nom: '', poids_min: '', poids_max: '', age_min: '', age_max: '', sexe: 'Mixte' });
    setShowCategorieForm(false);
    setEditingCategorie(null);
    setSelectedCompetition('');
  };

  const handleCategorieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categorieData = {
      ...categorieFormData,
      poids_min: Number(categorieFormData.poids_min),
      poids_max: Number(categorieFormData.poids_max),
      age_min: Number(categorieFormData.age_min),
      age_max: Number(categorieFormData.age_max)
    };

    if (editingCategorie) {
      await updateCategorie(editingCategorie.competition_id, editingCategorie.id, categorieData);
    } else {
      await addCategorie(selectedCompetition, categorieData);
    }
    resetCategorieForm();
  };

  const handleEditCategorie = (categorie: Categorie) => {
    setEditingCategorie(categorie);
    setSelectedCompetition(categorie.competition_id);
    setCategorieFormData({
      nom: categorie.nom,
      poids_min: categorie.poids_min.toString(),
      poids_max: categorie.poids_max.toString(),
      age_min: categorie.age_min.toString(),
      age_max: categorie.age_max.toString(),
      sexe: categorie.sexe
    });
    setShowCategorieForm(true);
  };

  const handleDeleteCategorie = async (categorie: Categorie) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      await deleteCategorie(categorie.competition_id, categorie.id);
    }
  };

  // Fonction pour vérifier si un joueur correspond à une catégorie
  const playerMatchesCategory = (joueur: Joueur, categorie: Categorie) => {
    const age = new Date().getFullYear() - new Date(joueur.date_naissance.toDate()).getFullYear();
    const matchesAge = age >= categorie.age_min && age <= categorie.age_max;
    const matchesWeight = joueur.poids >= categorie.poids_min && joueur.poids <= categorie.poids_max;
    const matchesSex = categorie.sexe === 'Mixte' || joueur.sexe === categorie.sexe;
    
    return matchesAge && matchesWeight && matchesSex;
  };

  // Obtenir les joueurs éligibles pour une catégorie
  const getEligiblePlayersForCategory = (categorie: Categorie) => {
    return joueurs.filter(joueur => playerMatchesCategory(joueur, categorie));
  };

  // Filtrer les catégories par compétition
  const filteredCategories = filterCompetition 
    ? categories.filter(cat => cat.competition_id === filterCompetition)
    : categories;

  const getSexeColor = (sexe: string) => {
    switch (sexe) {
      case 'Garçon': return 'bg-blue-100 text-blue-800';
      case 'Fille': return 'bg-pink-100 text-pink-800';
      default: return 'bg-purple-100 text-purple-800';
    }
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
        <h2 className="text-3xl font-bold text-white">Gestion des Catégories</h2>
        <button
          onClick={() => setShowCategorieForm(true)}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Catégories Garçons</p>
              <p className="text-2xl font-bold text-white">
                {categories.filter(c => c.sexe === 'Garçon').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-xl">
              <User className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Catégories Filles</p>
              <p className="text-2xl font-bold text-white">
                {categories.filter(c => c.sexe === 'Fille').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Catégories Mixtes</p>
              <p className="text-2xl font-bold text-white">
                {categories.filter(c => c.sexe === 'Mixte').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre par compétition */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-white">
            Filtrer par compétition:
          </label>
          <select
            value={filterCompetition}
            onChange={(e) => setFilterCompetition(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all backdrop-blur-xl"
          >
            <option className="bg-slate-900 text-white/80" value="">Toutes les compétitions</option>
            {competitions.map(competition => (
              <option
                key={competition.id}
                value={competition.id}
                className="bg-slate-900 text-white/80"
              >
                {competition.nom} - {competition.ville}
              </option>
            ))}
          </select>
          {filterCompetition && (
            <span className="text-sm text-white/70">
              {filteredCategories.length} catégorie(s) trouvée(s)
            </span>
          )}
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">
            Liste des catégories ({filteredCategories.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Compétition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Poids
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Âge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Sexe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Joueurs éligibles
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCategories.map((categorie) => {
                const eligiblePlayers = getEligiblePlayersForCategory(categorie);
                return (
                  <tr key={categorie.id} className="hover:bg-white/5 transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <div className="text-sm font-medium text-white">{categorie.nom}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/80">{categorie.competition_nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Weight className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/80">
                          {categorie.poids_min} - {categorie.poids_max} kg
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/80">
                          {categorie.age_min} - {categorie.age_max} ans
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSexeColor(categorie.sexe)}`}>
                        {categorie.sexe}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">
                          {eligiblePlayers.length} joueur{eligiblePlayers.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCategorie(categorie)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300 mr-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategorie(categorie)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catégorie */}
      {showCategorieForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                {editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <button
                  onClick={resetCategorieForm}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCategorieSubmit} className="p-6 space-y-4">
              {!editingCategorie && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Compétition
                  </label>
                  <select
  required
  value={selectedCompetition}
  onChange={(e) => setSelectedCompetition(e.target.value)}
  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
>
  <option value="" className="bg-gray-800/90 text-white/80">Sélectionner une compétition</option>
  {competitions.map(competition => (
    <option 
      key={competition.id} 
      value={competition.id}
      className="bg-gray-800/90 text-white/80"
    >
      {competition.nom} - {competition.ville}
    </option>
  ))}
</select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nom de la catégorie
                </label>
                <select
  required
  value={categorieFormData.nom}
  onChange={(e) => setCategorieFormData({ ...categorieFormData, nom: e.target.value })}
  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
>
  <option value="" className="bg-gray-800/90 text-white/80">Sélectionner une catégorie</option>
  <option value="Minimes" className="bg-gray-800/90 text-white/80">Minimes (8-11 ans)</option>
  <option value="Cadets" className="bg-gray-800/90 text-white/80">Cadets (12-14 ans)</option>
  <option value="Juniors" className="bg-gray-800/90 text-white/80">Juniors (15-17 ans)</option>
  <option value="Seniors" className="bg-gray-800/90 text-white/80">Seniors (18+ ans)</option>
</select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Poids min (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="150"
                    step="0.1"
                    value={categorieFormData.poids_min}
                    onChange={(e) => setCategorieFormData({ ...categorieFormData, poids_min: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Poids max (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="150"
                    step="0.1"
                    value={categorieFormData.poids_max}
                    onChange={(e) => setCategorieFormData({ ...categorieFormData, poids_max: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Âge min
                  </label>
                  <input
                    type="number"
                    required
                    min="6"
                    max="60"
                    value={categorieFormData.age_min}
                    onChange={(e) => setCategorieFormData({ ...categorieFormData, age_min: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Âge max
                  </label>
                  <input
                    type="number"
                    required
                    min="6"
                    max="60"
                    value={categorieFormData.age_max}
                    onChange={(e) => setCategorieFormData({ ...categorieFormData, age_max: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Sexe
                </label>
<select
  value={categorieFormData.sexe}
  onChange={(e) => setCategorieFormData({ ...categorieFormData, sexe: e.target.value as 'Garçon' | 'Fille' | 'Mixte' })}
  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
>
  <option value="Mixte" className="bg-gray-800/90 text-white/80">Mixte</option>
  <option value="Garçon" className="bg-gray-800/90 text-white/80">Garçon</option>
  <option value="Fille" className="bg-gray-800/90 text-white/80">Fille</option>
</select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? 'Enregistrement...' : (editingCategorie ? 'Modifier' : 'Créer')}
                </button>
                <button
                  type="button"
                  onClick={resetCategorieForm}
                  className="flex-1 bg-white/10 text-white/80 py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;