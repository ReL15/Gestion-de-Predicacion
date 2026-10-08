import React, { createContext, useContext, useEffect, useState } from 'react';
import { Congregation } from '../types';
import { dbService } from '../services/dbService';
import { DEMO_CONGREGATION } from '../services/demoData';
import { useAuth } from './AuthContext';

interface CongregationContextType {
  currentCongregation: Congregation | null;
  congregations: Congregation[];
  loading: boolean;
  selectCongregation: (id: string) => Promise<void>;
  createCongregation: (name: string, circuit?: string, timezone?: string) => Promise<Congregation>;
  refreshCongregations: () => Promise<void>;
}

const CongregationContext = createContext<CongregationContextType | undefined>(undefined);

export const CongregationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDemoMode, userProfile } = useAuth();
  const [currentCongregation, setCurrentCongregation] = useState<Congregation | null>(null);
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCongregations = async () => {
    setLoading(true);
    if (isDemoMode) {
      setCongregations([DEMO_CONGREGATION]);
      setCurrentCongregation(DEMO_CONGREGATION);
      setLoading(false);
      return;
    }

    try {
      const list = await dbService.getAllCongregations();
      setCongregations(list);
      if (userProfile?.congregationId) {
        const matching = list.find(c => c.id === userProfile.congregationId);
        if (matching) {
          setCurrentCongregation(matching);
        } else if (list.length > 0) {
          setCurrentCongregation(list[0]);
        }
      } else if (list.length > 0) {
        setCurrentCongregation(list[0]);
      }
    } catch (err) {
      console.error("Error al cargar congregaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCongregations();
  }, [isDemoMode, userProfile?.congregationId]);

  const selectCongregation = async (id: string) => {
    if (isDemoMode) {
      setCurrentCongregation(DEMO_CONGREGATION);
      return;
    }
    const found = congregations.find(c => c.id === id);
    if (found) {
      setCurrentCongregation(found);
    } else {
      const fetched = await dbService.getCongregation(id);
      if (fetched) {
        setCurrentCongregation(fetched);
      }
    }
  };

  const createCongregation = async (
    name: string,
    circuit = 'SV-01',
    timezone = 'America/El_Salvador'
  ): Promise<Congregation> => {
    const id = `cong-${Date.now()}`;
    const newCong: Congregation = {
      id,
      name,
      circuit,
      timezone,
      createdAt: new Date().toISOString(),
      createdBy: userProfile?.id || 'admin',
    };
    await dbService.saveCongregation(newCong);
    setCongregations(prev => [...prev, newCong]);
    setCurrentCongregation(newCong);
    return newCong;
  };

  return (
    <CongregationContext.Provider
      value={{
        currentCongregation,
        congregations,
        loading,
        selectCongregation,
        createCongregation,
        refreshCongregations: loadCongregations,
      }}
    >
      {children}
    </CongregationContext.Provider>
  );
};

export const useCongregation = () => {
  const context = useContext(CongregationContext);
  if (!context) {
    throw new Error('useCongregation debe usarse dentro de CongregationProvider');
  }
  return context;
};
