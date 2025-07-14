import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { useAuth } from './useAuth';

export interface Competition {
  id: string;
  nom: string;
  ville: string;
  date_creation?: any;
  status?: 'registration' | 'active' | 'completed';
}

export interface Categorie {
  id: string;
  nom: string;
  poids_min: number;
  poids_max: number;
  age_min: number;
  age_max: number;
  sexe: 'Garçon' | 'Fille' | 'Mixte';
  competition_id: string;
  competition_nom?: string;
  date_creation?: any;
}

export const useCompetitions = () => {
  const { user } = useAuth();
  const { addDocument, updateDocument, deleteDocument, subscribeToCollection, loading, error } = useFirestore();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);

  // Subscribe to competitions
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToCollection('competitions', (data) => {
      setCompetitions(data as Competition[]);
    });

    return unsubscribe;
  }, [user]);

  // Subscribe to all categories from all competitions
  useEffect(() => {
    if (!user || competitions.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    competitions.forEach(competition => {
      const unsubscribe = subscribeToCollection(`competitions/${competition.id}/categories`, (data) => {
        const categoriesWithCompetition = data.map(category => ({
          ...category,
          competition_id: competition.id,
          competition_nom: competition.nom
        }));
        
        setCategories(prev => {
          // Remove categories from this competition and add new ones
          const filtered = prev.filter(c => c.competition_id !== competition.id);
          return [...filtered, ...categoriesWithCompetition];
        });
      });
      
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user, competitions]);

  const addCompetition = async (competitionData: Omit<Competition, 'id'>) => {
    return await addDocument('competitions', {
      ...competitionData,
      status: 'registration'
    });
  };

  const updateCompetition = async (competitionId: string, competitionData: Partial<Competition>) => {
    return await updateDocument('competitions', competitionId, competitionData);
  };

  const deleteCompetition = async (competitionId: string) => {
    return await deleteDocument('competitions', competitionId);
  };

  const addCategorie = async (competitionId: string, categorieData: Omit<Categorie, 'id' | 'competition_id'>) => {
    return await addDocument(`competitions/${competitionId}/categories`, categorieData);
  };

  const updateCategorie = async (competitionId: string, categorieId: string, categorieData: Partial<Categorie>) => {
    return await updateDocument(`competitions/${competitionId}/categories`, categorieId, categorieData);
  };

  const deleteCategorie = async (competitionId: string, categorieId: string) => {
    return await deleteDocument(`competitions/${competitionId}/categories`, categorieId);
  };

  const getCategoriesByCompetition = (competitionId: string) => {
    return categories.filter(category => category.competition_id === competitionId);
  };

  return {
    competitions,
    categories,
    loading,
    error,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    addCategorie,
    updateCategorie,
    deleteCategorie,
    getCategoriesByCompetition
  };
};