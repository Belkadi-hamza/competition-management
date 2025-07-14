import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { useAuth } from './useAuth';

export interface Club {
  id: string;
  nom: string;
  ville: string;
  pays: string;
  date_creation?: any;
}

export interface Joueur {
  id: string;
  nom_complet: string;
  sexe: 'Garçon' | 'Fille';
  date_naissance: any;
  poids: number;
  club_id: string;
  club_nom?: string;
  date_inscription?: any;
}

export const useClubs = () => {
  const { user } = useAuth();
  const { addDocument, updateDocument, deleteDocument, subscribeToCollection, loading, error } = useFirestore();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [joueurs, setJoueurs] = useState<Joueur[]>([]);

  // Subscribe to clubs
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToCollection('clubs', (data) => {
      setClubs(data as Club[]);
    });

    return unsubscribe;
  }, [user]);

  // Subscribe to all players from all clubs
  useEffect(() => {
    if (!user || clubs.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    clubs.forEach(club => {
      const unsubscribe = subscribeToCollection(`clubs/${club.id}/joueurs`, (data) => {
        const playersWithClub = data.map(player => ({
          ...player,
          club_id: club.id,
          club_nom: club.nom
        }));
        
        setJoueurs(prev => {
          // Remove players from this club and add new ones
          const filtered = prev.filter(p => p.club_id !== club.id);
          return [...filtered, ...playersWithClub];
        });
      });
      
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user, clubs]);

  const addClub = async (clubData: Omit<Club, 'id'>) => {
    return await addDocument('clubs', clubData);
  };

  const updateClub = async (clubId: string, clubData: Partial<Club>) => {
    return await updateDocument('clubs', clubId, clubData);
  };

  const deleteClub = async (clubId: string) => {
    return await deleteDocument('clubs', clubId);
  };

  const addJoueur = async (clubId: string, joueurData: Omit<Joueur, 'id' | 'club_id'>) => {
    return await addDocument(`clubs/${clubId}/joueurs`, joueurData);
  };

  const updateJoueur = async (clubId: string, joueurId: string, joueurData: Partial<Joueur>) => {
    return await updateDocument(`clubs/${clubId}/joueurs`, joueurId, joueurData);
  };

  const deleteJoueur = async (clubId: string, joueurId: string) => {
    return await deleteDocument(`clubs/${clubId}/joueurs`, joueurId);
  };

  const getJoueursByClub = (clubId: string) => {
    return joueurs.filter(joueur => joueur.club_id === clubId);
  };

  const getJoueursByCategory = (category: string, minAge: number, maxAge: number, minWeight: number, maxWeight: number, sexe?: string) => {
    return joueurs.filter(joueur => {
      const age = new Date().getFullYear() - new Date(joueur.date_naissance.toDate()).getFullYear();
      const matchesAge = age >= minAge && age <= maxAge;
      const matchesWeight = joueur.poids >= minWeight && joueur.poids <= maxWeight;
      const matchesSex = !sexe || joueur.sexe === sexe;
      
      return matchesAge && matchesWeight && matchesSex;
    });
  };

  return {
    clubs,
    joueurs,
    loading,
    error,
    addClub,
    updateClub,
    deleteClub,
    addJoueur,
    updateJoueur,
    deleteJoueur,
    getJoueursByClub,
    getJoueursByCategory
  };
};