import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, testConnection } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { dbService } from '../services/dbService';
import { DEMO_USERS } from '../services/demoData';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  activeDemoUser: UserProfile | null;
  setDemoUserRole: (role: UserRole) => void;
  toggleDemoMode: (enable?: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, firstName: string, lastName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Permisos derivados
  isCoordinator: boolean;
  isServiceOverseer: boolean;
  canLeadPreaching: boolean;
  canPublicPreaching: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeDemoUser, setActiveDemoUser] = useState<UserProfile | null>(DEMO_USERS[0]);

  useEffect(() => {
    // Probar conexión a Firestore en el arranque
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await dbService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Error al cargar perfil de usuario:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (isDemoMode && activeDemoUser) {
      setUserProfile(activeDemoUser);
      return;
    }
    if (currentUser) {
      const profile = await dbService.getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  };

  const toggleDemoMode = (enable?: boolean) => {
    const nextVal = enable !== undefined ? enable : !isDemoMode;
    setIsDemoMode(nextVal);
    dbService.setDemoMode(nextVal);
    if (nextVal) {
      setUserProfile(activeDemoUser);
    } else {
      if (currentUser) {
        dbService.getUserProfile(currentUser.uid).then(setUserProfile);
      } else {
        setUserProfile(null);
      }
    }
  };

  const setDemoUserRole = (role: UserRole) => {
    const found = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setActiveDemoUser(found);
    if (isDemoMode) {
      setUserProfile(found);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const profile = await dbService.getUserProfile(res.user.uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        // Asignar primer perfil provisional
        const newProf: UserProfile = {
          id: res.user.uid,
          congregationId: 'cong-demo-01',
          firstName: res.user.displayName?.split(' ')[0] || 'Hermano',
          lastName: res.user.displayName?.split(' ').slice(1).join(' ') || '',
          fullName: res.user.displayName || 'Hermano',
          email: res.user.email || '',
          role: res.user.email === 'tch.rivlue15@gmail.com' ? 'COORDINADOR' : 'PUBLICADOR',
          canLeadPreaching: res.user.email === 'tch.rivlue15@gmail.com',
          canPublicPreaching: true,
          active: true,
          createdAt: new Date().toISOString(),
        };
        await dbService.saveUserProfile(newProf);
        setUserProfile(newProf);
      }
    } catch (err) {
      console.error("Error al iniciar con Google:", err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await dbService.getUserProfile(res.user.uid);
    setUserProfile(profile);
  };

  const signUpWithEmail = async (email: string, pass: string, firstName: string, lastName: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const fullName = `${firstName} ${lastName}`.trim();
    const newProf: UserProfile = {
      id: res.user.uid,
      congregationId: 'cong-demo-01',
      firstName,
      lastName,
      fullName,
      email,
      role: email === 'tch.rivlue15@gmail.com' ? 'COORDINADOR' : 'PUBLICADOR',
      canLeadPreaching: false,
      canPublicPreaching: false,
      active: true,
      createdAt: new Date().toISOString(),
    };
    await dbService.saveUserProfile(newProf);
    setUserProfile(newProf);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    if (isDemoMode) {
      toggleDemoMode(false);
    }
    await signOut(auth);
    setUserProfile(null);
  };

  const effectiveProfile = isDemoMode ? activeDemoUser : userProfile;

  const isCoordinator = effectiveProfile?.role === 'COORDINADOR' || effectiveProfile?.email === 'tch.rivlue15@gmail.com';
  const isServiceOverseer =
    isCoordinator ||
    effectiveProfile?.role === 'SUPERINTENDENTE_DE_SERVICIO' ||
    effectiveProfile?.role === 'ASISTENTE_SUPERINTENDENTE_SERVICIO';

  const canLeadPreaching = !!effectiveProfile?.canLeadPreaching;
  const canPublicPreaching = !!effectiveProfile?.canPublicPreaching;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile: effectiveProfile,
        loading,
        isDemoMode,
        activeDemoUser,
        setDemoUserRole,
        toggleDemoMode,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        logout,
        refreshProfile,
        isCoordinator,
        isServiceOverseer,
        canLeadPreaching,
        canPublicPreaching,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
