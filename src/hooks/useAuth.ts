import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, isConfigured } from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth && isConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If Firebase is not configured, set loading to false immediately
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (!auth || !isConfigured) {
        setError('Firebase n\'est pas configuré. Veuillez ajouter vos identifiants Firebase dans le fichier .env');
        return null;
      }
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      setError(getErrorMessage(error.code));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      if (!auth || !isConfigured) {
        setError('Firebase n\'est pas configuré. Veuillez ajouter vos identifiants Firebase dans le fichier .env');
        return null;
      }
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(result.user, {
        displayName: displayName
      });
      
      return result.user;
    } catch (error: any) {
      setError(getErrorMessage(error.code));
      return null;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      if (!auth || !isConfigured) {
        return; // Silently return if not configured
      }
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      setError(getErrorMessage(error.code));
      return null;
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cet email.';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect.';
      case 'auth/email-already-in-use':
        return 'Cet email est déjà utilisé.';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      case 'auth/invalid-email':
        return 'Format d\'email invalide.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  };
  return {
    user,
    loading,
    error,
    login,
    register,
    logout
  };
};