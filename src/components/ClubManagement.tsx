import React, { useState } from 'react';
import { useClubs, Club, Joueur } from '../hooks/useClubs';
import { Plus, Edit2, Trash2, Users, Building, MapPin, Calendar, X } from 'lucide-react';

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
        <h2 className="text-3xl font-bold text-white">Gestion des Clubs</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowClubForm(true)}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Club</span>
          </button>
          <button
            onClick={() => setShowJoueurForm(true)}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Joueur</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl">
              <Building className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Total Clubs</p>
              <p className="text-2xl font-bold text-white">{clubs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Total Joueurs</p>
              <p className="text-2xl font-bold text-white">{joueurs.length}</p>
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
            <div key={club.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:bg-white/15 transition-all duration-300">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{club.nom}</h3>
                    <p className="text-sm text-white/70 flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{club.ville}, {club.pays}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClub(club)}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Joueurs ({clubJoueurs.length})</h4>
                </div>
                
                {clubJoueurs.length > 0 ? (
                  <div className="space-y-2">
                    {clubJoueurs.map((joueur) => (
                      <div key={joueur.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
                        <div>
                          <p className="font-medium text-sm text-white">{joueur.nom_complet}</p>
                          <p className="text-xs text-white/70">
                            {joueur.sexe} • {joueur.poids}kg • 
                            {new Date().getFullYear() - new Date(joueur.date_naissance.toDate()).getFullYear()} ans
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditJoueur(joueur)}
                            className="p-1 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteJoueur(joueur)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">Aucun joueur inscrit</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Club */}
      {showClubForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                {editingClub ? 'Modifier le club' : 'Nouveau club'}
                </h3>
                <button
                  onClick={resetClubForm}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleClubSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nom du club
                </label>
                <input
                  type="text"
                  required
                  value={clubFormData.nom}
                  onChange={(e) => setClubFormData({ ...clubFormData, nom: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  required
                  value={clubFormData.ville}
                  onChange={(e) => setClubFormData({ ...clubFormData, ville: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  required
                  value={clubFormData.pays}
                  onChange={(e) => setClubFormData({ ...clubFormData, pays: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? 'Enregistrement...' : (editingClub ? 'Modifier' : 'Créer')}
                </button>
                <button
                  type="button"
                  onClick={resetClubForm}
                  className="flex-1 bg-white/10 text-white/80 py-3 px-4 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Joueur */}
      {/* Modal Joueur */}
{showJoueurForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {editingJoueur ? 'Modifier le joueur' : 'Nouveau joueur'}
          </h3>
          <button
            onClick={resetJoueurForm}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>
      
      <form onSubmit={handleJoueurSubmit} className="p-6 space-y-4">
        {!editingJoueur && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Club
            </label>
            <select
              required
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            >
              <option value="" className="bg-gray-800">Sélectionner un club</option>
              {clubs.map(club => (
                <option key={club.id} value={club.id} className="bg-gray-800">{club.nom}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Nom complet
          </label>
          <input
            type="text"
            required
            value={joueurFormData.nom_complet}
            onChange={(e) => setJoueurFormData({ ...joueurFormData, nom_complet: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Sexe
            </label>
            <select
              value={joueurFormData.sexe}
              onChange={(e) => setJoueurFormData({ ...joueurFormData, sexe: e.target.value as 'Garçon' | 'Fille' })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            >
              <option value="Garçon" className="bg-gray-800">Garçon</option>
              <option value="Fille" className="bg-gray-800">Fille</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Date de naissance
          </label>
          <input
            type="date"
            required
            value={joueurFormData.date_naissance}
            onChange={(e) => setJoueurFormData({ ...joueurFormData, date_naissance: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? 'Enregistrement...' : (editingJoueur ? 'Modifier' : 'Ajouter')}
          </button>
          <button
            type="button"
            onClick={resetJoueurForm}
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

export default ClubManagement;