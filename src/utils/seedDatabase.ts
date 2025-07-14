import { db } from '../config/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

const sampleData = {
  "utilisateurs/user_taekwondo_001": {
    "nom": "Ahmed El Mansouri",
    "email": "ahmed.elmansouri@exemple.com",
    "mot_de_passe": "NOT_FOR_PRODUCTION_USE_UseFirebaseAuth",
    "date_creation": "2023-09-15T10:30:00Z"
  },
  "utilisateurs/user_taekwondo_001/clubs/club_id_drago": {
    "nom": "Dragon Blanc Taekwondo",
    "ville": "Casablanca",
    "pays": "Maroc",
    "date_creation": "2023-10-01T11:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/clubs/club_id_drago/joueurs/joueur_drago_01": {
    "nom_complet": "Fatima Zahraoui",
    "sexe": "Fille",
    "date_naissance": "2010-03-25T00:00:00Z",
    "poids": 48.5,
    "date_inscription": "2023-10-05T09:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/clubs/club_id_drago/joueurs/joueur_drago_02": {
    "nom_complet": "Yassine Daoudi",
    "sexe": "Garçon",
    "date_naissance": "2008-07-12T00:00:00Z",
    "poids": 62.0,
    "date_inscription": "2023-10-05T09:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/clubs/club_id_drago/joueurs/joueur_drago_03": {
    "nom_complet": "Nour Eddine Alaoui",
    "sexe": "Garçon",
    "date_naissance": "2012-01-10T00:00:00Z",
    "poids": 35.0,
    "date_inscription": "2023-10-05T09:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/clubs/club_id_tigre": {
    "nom": "Tigres Noirs TKD",
    "ville": "Rabat",
    "pays": "Maroc",
    "date_creation": "2023-10-10T12:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/clubs/club_id_tigre/joueurs/joueur_tigre_01": {
    "nom_complet": "Sarah Benani",
    "sexe": "Fille",
    "date_naissance": "2009-09-01T00:00:00Z",
    "poids": 55.0,
    "date_inscription": "2023-10-15T10:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/clubs/club_id_tigre/joueurs/joueur_tigre_02": {
    "nom_complet": "Mehdi Kassimi",
    "sexe": "Garçon",
    "date_naissance": "2007-04-18T00:00:00Z",
    "poids": 70.0,
    "date_inscription": "2023-10-15T10:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/competitions/comp_nat_2024": {
    "nom": "Championnat National Junior 2024",
    "ville": "Marrakech",
    "date_creation": "2024-01-20T08:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/competitions/comp_nat_2024/categories/cat_chabab_g_50": {
    "nom": "Chabab",
    "poids_min": 45,
    "poids_max": 50,
    "age_min": 12,
    "age_max": 14,
    "sexe": "Garçon",
    "date_creation": "2024-01-21T09:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/competitions/comp_nat_2024/categories/cat_chabab_f_45": {
    "nom": "Chabab",
    "poids_min": 40,
    "poids_max": 45,
    "age_min": 12,
    "age_max": 14,
    "sexe": "Fille",
    "date_creation": "2024-01-21T09:05:00Z"
  },
  "utilisateurs/user_taekwondo_001/competitions/comp_nat_2024/categories/cat_fityan_g_65": {
    "nom": "Fityan",
    "poids_min": 60,
    "poids_max": 65,
    "age_min": 15,
    "age_max": 17,
    "sexe": "Garçon",
    "date_creation": "2024-01-21T09:10:00Z"
  },
  "utilisateurs/user_taekwondo_001/competitions/comp_regionale_printemps": {
    "nom": "Compétition Régionale du Printemps",
    "ville": "Fès",
    "date_creation": "2024-03-01T14:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/competitions/comp_regionale_printemps/categories/cat_senior_h_75": {
    "nom": "Senior",
    "poids_min": 70,
    "poids_max": 75,
    "age_min": 18,
    "age_max": 35,
    "sexe": "Garçon",
    "date_creation": "2024-03-02T10:00:00Z"
  },
  "utilisateurs/user_taekwondo_001/competitions/comp_regionale_printemps/categories/cat_minime_f_35": {
    "nom": "Minime",
    "poids_min": 30,
    "poids_max": 35,
    "age_min": 10,
    "age_max": 11,
    "sexe": "Fille",
    "date_creation": "2024-03-02T10:05:00Z"
  }
};

export const seedDatabase = async () => {
  if (!db) {
    console.error('Firebase n\'est pas configuré. Veuillez configurer Firebase avant d\'importer les données.');
    return false;
  }

  try {
    console.log('Début de l\'importation des données...');
    
    // Use batched writes for better performance
    const batch = writeBatch(db);
    let operationCount = 0;
    const maxBatchSize = 500;

    for (const [path, data] of Object.entries(sampleData)) {
      // Parse the path to create proper document reference
      const pathParts = path.split('/');
      
      if (pathParts.length >= 2) {
        // Create document reference based on the path structure
        let docRef;
        
        if (pathParts.length === 2) {
          // Top level document (e.g., utilisateurs/user_id)
          docRef = doc(db, pathParts[0], pathParts[1]);
        } else if (pathParts.length === 4) {
          // Subcollection document (e.g., utilisateurs/user_id/clubs/club_id)
          docRef = doc(db, pathParts[0], pathParts[1], pathParts[2], pathParts[3]);
        } else if (pathParts.length === 6) {
          // Nested subcollection document (e.g., utilisateurs/user_id/clubs/club_id/joueurs/joueur_id)
          docRef = doc(db, pathParts[0], pathParts[1], pathParts[2], pathParts[3], pathParts[4], pathParts[5]);
        } else {
          console.warn(`Chemin non supporté: ${path}`);
          continue;
        }

        // Convert date strings to Date objects
        const processedData = { ...data };
        Object.keys(processedData).forEach(key => {
          if (typeof processedData[key] === 'string' && processedData[key].includes('T') && processedData[key].includes('Z')) {
            processedData[key] = new Date(processedData[key]);
          }
        });

        batch.set(docRef, processedData);
        operationCount++;

        // Commit batch if we reach the limit
        if (operationCount >= maxBatchSize) {
          await batch.commit();
          console.log(`${operationCount} documents importés...`);
          operationCount = 0;
        }
      }
    }

    // Commit remaining operations
    if (operationCount > 0) {
      await batch.commit();
    }

    console.log('✅ Importation des données terminée avec succès!');
    console.log(`Total: ${Object.keys(sampleData).length} documents importés`);
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'importation des données:', error);
    return false;
  }
};

// Helper function to clear all data (use with caution!)
export const clearDatabase = async () => {
  if (!db) {
    console.error('Firebase n\'est pas configuré.');
    return false;
  }

  try {
    console.log('⚠️  Suppression de toutes les données...');
    
    // This is a simplified version - in production you'd need to recursively delete subcollections
    const batch = writeBatch(db);
    
    // Delete main user document (this won't delete subcollections automatically)
    const userDocRef = doc(db, 'utilisateurs', 'user_taekwondo_001');
    batch.delete(userDocRef);
    
    await batch.commit();
    console.log('✅ Données supprimées');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    return false;
  }
};