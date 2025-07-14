import React, { useState } from 'react';
import { useClubs, Club, Joueur } from '../hooks/useClubs';
import { Plus, Edit2, Trash2, Users, Building, MapPin, Calendar } from 'lucide-react';

const ClubManagement: React.FC = () => {
  const { clubs, joueurs, addClub, updateClub, deleteClub, addJoueur, updateJoueur, deleteJoueur, getJoueursByClub, loading, error } = useClubs();
  const [showClubForm, setShowClubForm] = useState(false);
  const [showJoueurForm, setShowJoueurForm] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [editingJoueur, setEditingJoueur] = useState<Joueur | null>(null);
  const [selectedClub, setSelectedClub] = useState<string>('');
  
  const [clubFormData, setClubFormData] = useState({
    nom: '',
    ville: '',
    pays: 'Maroc'
  });

  const [joueurFormData, setJoueurFormData] = useState({
    nom_complet: '',
    sexe: 'Garçon' as 'Garçon' | 'Fille',
    date_naissance: '',
    poids: ''
  });

  const resetClubForm = () => {
    setClubFormData({ nom: '', ville: '', pays: 'Maroc' });
    setShowClubForm(false);
    setEditingClub(null);
  };

  const resetJoueurForm = () => {
    setJoueurFormData({ nom_complet: '', sexe: 'Garçon', date_naissance: '', poids: '' });
    setShowJoueurForm(false);
    setEditingJoueur(null);
    setSelectedClub('');
  };

  const handleClubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClub) {
      await updateClub(editingClub.id, clubFormData);
    } else {
      await addClub(clubFormData);
    }
    resetClubForm();
  };

  const handleJoueurSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const joueurData = {
      ...joueurFormData,
      poids: Number(joueurFormData.poids),
      date_naissance: new Date(joueurFormData.date_naissance)
    };

    if (editingJoueur) {
      await updateJoueur(editingJoueur.club_id, editingJoueur.id, joueurData);
    } else {
      await addJoueur(selectedClub, joueurData);
    }
    resetJoueurForm();
  };

  const handleEditClub = (club: Club) => {
    setEditingClub(club);
    setClubFormData({
      nom: club.nom,
      ville: club.ville,
      pays: club.pays
    });
    setShowClubForm(true);
  };

  const handleEditJoueur = (joueur: Joueur) => {
    setEditingJoueur(joueur);
    setSelectedClub(joueur.club_id);
    setJoueurFormData({
      nom_complet: joueur.nom_complet,
      sexe: joueur.sexe,
      date_naissance: joueur.date_naissance.toDate().toISOString().split('T')[0],
      poids: joueur.poids.toString()
    });
    setShowJoueurForm(true);
  };

  const handleDeleteClub = async (clubId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce club et tous ses joueurs ?')) {
      await deleteClub(clubId);
    }
  };

  const handleDeleteJoueur = async (joueur: Joueur) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      await deleteJoueur(joueur.club_id, joueur.id);
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
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Clubs</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowClubForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Club</span>
          </button>
          <button
            onClick={() => setShowJoueurForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Joueur</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clubs</p>
              <p className="text-2xl font-bold text-gray-800">{clubs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Joueurs</p>
              <p className="text-2xl font-bold text-gray-800">{joueurs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Villes</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(clubs.map(c => c.ville)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des clubs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clubs.map((club) => {
          const clubJoueurs = getJoueursByClub(club.id);
          return (
            <div key={club.id} className="bg-white rounded-lg shadow border">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{club.nom}</h3>
                    <p className="text-sm text-gray-600 flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{club.ville}, {club.pays}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClub(club)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">Joueurs ({clubJoueurs.length})</h4>
                </div>
                
                {clubJoueurs.length > 0 ? (
                  <div className="space-y-2">
                    {clubJoueurs.map((joueur) => (
                      <div key={joueur.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{joueur.nom_complet}</p>
                          <p className="text-xs text-gray-600">
                            {joueur.sexe} • {joueur.poids}kg • 
                            {new Date().getFullYear() - new Date(joueur.date_naissance.toDate()).getFullYear()} ans
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditJoueur(joueur)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteJoueur(joueur)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucun joueur inscrit</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Club */}
      {showClubForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingClub ? 'Modifier le club' : 'Nouveau club'}
              </h3>
            </div>
            
            <form onSubmit={handleClubSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du club
                </label>
                <input
                  type="text"
                  required
                  value={clubFormData.nom}
                  onChange={(e) => setClubFormData({ ...clubFormData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  required
                  value={clubFormData.ville}
                  onChange={(e) => setClubFormData({ ...clubFormData, ville: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <input
                  type="text"
                  required
                  value={clubFormData.pays}
                  onChange={(e) => setClubFormData({ ...clubFormData, pays: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Enregistrement...' : (editingClub ? 'Modifier' : 'Créer')}
                </button>
                <button
                  type="button"
                  onClick={resetClubForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Joueur */}
      {showJoueurForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingJoueur ? 'Modifier le joueur' : 'Nouveau joueur'}
              </h3>
            </div>
            
            <form onSubmit={handleJoueurSubmit} className="p-6 space-y-4">
              {!editingJoueur && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club
                  </label>
                  <select
                    required
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un club</option>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.nom}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={joueurFormData.nom_complet}
                  onChange={(e) => setJoueurFormData({ ...joueurFormData, nom_complet: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sexe
                  </label>
                  <select
                    value={joueurFormData.sexe}
                    onChange={(e) => setJoueurFormData({ ...joueurFormData, sexe: e.target.value as 'Garçon' | 'Fille' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Garçon">Garçon</option>
                    <option value="Fille">Fille</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="150"
                    step="0.1"
                    value={joueurFormData.poids}
                    onChange={(e) => setJoueurFormData({ ...joueurFormData, poids: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  required
                  value={joueurFormData.date_naissance}
                  onChange={(e) => setJoueurFormData({ ...joueurFormData, date_naissance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Enregistrement...' : (editingJoueur ? 'Modifier' : 'Ajouter')}
                </button>
                <button
                  type="button"
                  onClick={resetJoueurForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
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

export default ClubManagement;