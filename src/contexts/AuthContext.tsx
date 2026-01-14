import { createContext, useContext, ReactNode } from 'react';
import { User, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updatePhotoURL: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, loading] = useAuthState(auth);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateDisplayName = async (displayName: string) => {
    if (!user) {
      throw new Error('User is not authenticated');
    }
    try {
      await updateProfile(user, { displayName });
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  };

  const updatePhotoURL = async (photoURL: string) => {
    if (!user) {
      throw new Error('User is not authenticated');
    }
    try {
      await updateProfile(user, { photoURL });
    } catch (error) {
      console.error('Error updating photo URL:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading, signInWithGoogle, logout, updateDisplayName, updatePhotoURL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
