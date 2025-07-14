import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useFirestore = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get user's collection path
  const getUserPath = (collectionName: string) => {
    if (!user) return null;
    return `utilisateurs/${user.uid}/${collectionName}`;
  };

  // Generic CRUD operations
  const addDocument = async (collectionName: string, data: any) => {
    if (!db || !user) {
      setError('Firebase non configuré ou utilisateur non connecté');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const collectionPath = getUserPath(collectionName);
      if (!collectionPath) return null;

      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        date_creation: Timestamp.now(),
        user_id: user.uid
      });
      
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    if (!db || !user) {
      setError('Firebase non configuré ou utilisateur non connecté');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const collectionPath = getUserPath(collectionName);
      if (!collectionPath) return false;

      await updateDoc(doc(db, collectionPath, docId), {
        ...data,
        date_modification: Timestamp.now()
      });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    if (!db || !user) {
      setError('Firebase non configuré ou utilisateur non connecté');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const collectionPath = getUserPath(collectionName);
      if (!collectionPath) return false;

      await deleteDoc(doc(db, collectionPath, docId));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDocuments = async (collectionName: string, filters?: any[]) => {
    if (!db || !user) {
      setError('Firebase non configuré ou utilisateur non connecté');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const collectionPath = getUserPath(collectionName);
      if (!collectionPath) return [];

      let q = query(collection(db, collectionPath));
      
      if (filters) {
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return documents;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void, filters?: any[]) => {
    if (!db || !user) {
      setError('Firebase non configuré ou utilisateur non connecté');
      return () => {};
    }

    const collectionPath = getUserPath(collectionName);
    if (!collectionPath) return () => {};

    let q = query(collection(db, collectionPath));
    
    if (filters) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }

    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(documents);
    }, (err) => {
      setError(err.message);
    });
  };

  return {
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    subscribeToCollection
  };
};