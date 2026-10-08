import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCongregation } from '../context/CongregationContext';
import { UserRole } from '../types';
import { Church, Shield, Users, LogOut, Code, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenKmpModal: () => void;
  onOpenWizard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenKmpModal, onOpenWizard }) => {
  const {
    currentUser,
    userProfile,
    isDemoMode,
    toggleDemoMode,
    setDemoUserRole,
    logout,
  } = useAuth();
  const { currentCongregation } = useCongregation();

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-sm border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo / Congregación */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight text-slate-100">
              {currentCongregation?.name || 'Predicación'}
            </span>
            <span className="text-[11px] text-slate-400">
              {currentCongregation?.circuit ? `Circuito ${currentCongregation.circuit}` : 'Organizador Congregacional'}
            </span>
          </div>
        </div>

        {/* Acciones & Estado de Usuario */}
        <div className="flex items-center gap-2">
          {/* Selector de Rol en Modo Demo para pruebas inmediatas */}
          {isDemoMode ? (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-md text-xs text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline font-medium">Demo:</span>
              <select
                value={userProfile?.role || 'COORDINADOR'}
                onChange={(e) => setDemoUserRole(e.target.value as UserRole)}
                className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer text-xs"
                title="Cambiar rol para simular permisos"
              >
                <option value="COORDINADOR" className="bg-slate-800 text-white">Coordinador</option>
                <option value="SUPERINTENDENTE_DE_SERVICIO" className="bg-slate-800 text-white">Superintendente Serv.</option>
                <option value="PUBLICADOR" className="bg-slate-800 text-white">Publicador</option>
              </select>
            </div>
          ) : (
            userProfile && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-medium text-slate-300">
                <Shield className="w-3 h-3 text-blue-400" />
                {userProfile.role === 'COORDINADOR'
                  ? 'Coordinador'
                  : userProfile.role === 'SUPERINTENDENTE_DE_SERVICIO'
                  ? 'Superintendente'
                  : userProfile.role === 'ASISTENTE_SUPERINTENDENTE_SERVICIO'
                  ? 'Asistente'
                  : 'Publicador'}
              </span>
            )
          )}

          {/* Botón Ver Arquitectura Kotlin KMP */}
          <button
            onClick={onOpenKmpModal}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs px-2"
            title="Ver código y arquitectura Kotlin Multiplatform (Android & iOS)"
          >
            <Code className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">KMP</span>
          </button>

          {/* Botón Salir / Desconectar */}
          {(currentUser || isDemoMode) && (
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
