import React, { useState } from 'react';
import { Database, Upload, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { seedDatabase, clearDatabase } from '../utils/seedDatabase';

const DatabaseSeeder: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setMessage({ type: 'info', text: 'Importation des données en cours...' });
    
    try {
      const success = await seedDatabase();
      if (success) {
        setMessage({ 
          type: 'success', 
          text: 'Base de données peuplée avec succès! Les données incluent des utilisateurs, clubs, joueurs, compétitions et catégories.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Échec de l\'importation. Vérifiez la configuration Firebase.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Erreur lors de l'importation: ${error}` 
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer toutes les données? Cette action est irréversible.')) {
      return;
    }

    setIsClearing(true);
    setMessage({ type: 'info', text: 'Suppression des données en cours...' });
    
    try {
      const success = await clearDatabase();
      if (success) {
        setMessage({ 
          type: 'success', 
          text: 'Base de données vidée avec succès!' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Échec de la suppression.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Erreur lors de la suppression: ${error}` 
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-800">Gestion de la Base de Données</h3>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' :
          message.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {message.type === 'info' && <Loader className="w-5 h-5 animate-spin" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Importer les données d'exemple</h4>
          <p className="text-sm text-gray-600 mb-4">
            Importe un jeu de données complet incluant:
          </p>
          <ul className="text-sm text-gray-600 mb-4 space-y-1">
            <li>• 1 utilisateur (Ahmed El Mansouri)</li>
            <li>• 2 clubs (Dragon Blanc Taekwondo, Tigres Noirs TKD)</li>
            <li>• 5 joueurs répartis dans les clubs</li>
            <li>• 2 compétitions avec catégories</li>
            <li>• Données structurées pour le système de tournoi</li>
          </ul>
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSeeding ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isSeeding ? 'Importation...' : 'Importer les données'}</span>
          </button>
        </div>

        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h4 className="font-medium text-red-800 mb-2">Vider la base de données</h4>
          <p className="text-sm text-red-600 mb-4">
            ⚠️ Attention: Cette action supprimera toutes les données de la base. Utilisez uniquement pour les tests.
          </p>
          <button
            onClick={handleClearDatabase}
            disabled={isClearing}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isClearing ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{isClearing ? 'Suppression...' : 'Vider la base'}</span>
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Structure des données</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>📁 <code>utilisateurs/</code> - Comptes utilisateurs</div>
          <div className="ml-4">📁 <code>clubs/</code> - Clubs de taekwondo</div>
          <div className="ml-8">📁 <code>joueurs/</code> - Membres des clubs</div>
          <div className="ml-4">📁 <code>competitions/</code> - Tournois et compétitions</div>
          <div className="ml-8">📁 <code>categories/</code> - Catégories de poids/âge</div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSeeder;