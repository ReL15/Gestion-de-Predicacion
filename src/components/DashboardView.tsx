import React from 'react';
import { useAuth } from '../context/AuthContext';
import { WeeklyAssignment, PublicPreachingAssignment } from '../types';
import {
  MapPin,
  Map,
  UserCheck,
  Calendar,
  Users,
  Compass,
  FileText,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { TabType } from './BottomNav';

interface DashboardViewProps {
  nextWeekly: WeeklyAssignment | null;
  nextPublic: PublicPreachingAssignment | null;
  onNavigateTab: (tab: TabType) => void;
  onNavigateMoreSubview: (subview: 'territorios' | 'lugares' | 'publica' | 'publicadores' | 'configuracion') => void;
  onGenerateWeeklyPdf: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  nextWeekly,
  nextPublic,
  onNavigateTab,
  onNavigateMoreSubview,
  onGenerateWeeklyPdf,
}) => {
  const { userProfile, isCoordinator, isServiceOverseer } = useAuth();

  return (
    <div className="space-y-6 pb-20">
      {/* Encabezado Principal */}
      <div className="text-center py-2 border-b border-slate-100">
        <h1 className="text-xl font-bold tracking-wide text-slate-800 uppercase">
          Predicación
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {userProfile?.fullName ? `Bienvenido, ${userProfile.fullName}` : 'Organización congregacional'}
        </p>
      </div>

      {/* Tarjeta Destacada: Próxima asignación */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Próxima asignación
          </span>
          <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            Semanal
          </span>
        </div>

        {nextWeekly ? (
          <div className="p-5 space-y-4">
            <div>
              <div className="text-base sm:text-lg font-bold text-slate-900 uppercase">
                {new Date(nextWeekly.date + 'T12:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </div>
              <div className="text-sm font-semibold text-blue-700 mt-0.5">
                {nextWeekly.time} hrs
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2 border-t border-slate-100">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 mt-0.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Lugar de salida</div>
                  <div className="font-medium text-slate-800">{nextWeekly.placeName}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 mt-0.5">
                  <Map className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Territorio</div>
                  <div className="font-medium text-slate-800">Territorio {nextWeekly.territoryNumber}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Encargado:</span>
                  <span className="text-xs font-semibold text-slate-800">{nextWeekly.leaderName}</span>
                </div>
              </div>

              {nextWeekly.notes && (
                <span className="text-[11px] text-slate-500 max-w-[180px] truncate text-right">
                  {nextWeekly.notes}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-sm">
            No hay asignaciones programadas próximamente.
          </div>
        )}
      </div>

      {/* Asignación de Predicación Pública si existe */}
      {nextPublic && (
        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              Exhibidor Público Próximo
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
              {nextPublic.time} hrs
            </span>
          </div>
          <div className="text-xs font-medium text-emerald-950">
            {nextPublic.placeName}
          </div>
          <div className="text-[11px] text-emerald-800 flex items-center gap-1">
            <span>Participantes:</span>
            <span className="font-semibold">
              {nextPublic.participants.map(p => p.userName).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase px-1">
          Accesos Rápidos
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigateTab('programa')}
            className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Programa</div>
                <div className="text-[11px] text-slate-400">Salidas semanales</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={() => onNavigateMoreSubview('territorios')}
            className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Territorios</div>
                <div className="text-[11px] text-slate-400">Mapas y límites</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={() => onNavigateMoreSubview('publica')}
            className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Pred. Pública</div>
                <div className="text-[11px] text-slate-400">Exhibidores</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={() => onNavigateMoreSubview('lugares')}
            className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Lugares</div>
                <div className="text-[11px] text-slate-400">Puntos de salida</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Panel Administrativo (Visible para Coordinador y Superintendente) */}
      {(isCoordinator || isServiceOverseer) && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm tracking-wide">Panel de Administración</h3>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full uppercase">
              {isCoordinator ? 'Coordinador' : 'Superintendente'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {isCoordinator && (
              <button
                onClick={() => onNavigateMoreSubview('publicadores')}
                className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-slate-200 transition-colors"
              >
                <Users className="w-4 h-4 text-blue-400 shrink-0" />
                <span>👥 Publicadores</span>
              </button>
            )}

            <button
              onClick={() => onNavigateMoreSubview('territorios')}
              className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-slate-200 transition-colors"
            >
              <Map className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>🗺 Territorios</span>
            </button>

            <button
              onClick={() => onNavigateMoreSubview('lugares')}
              className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-slate-200 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>📍 Lugares</span>
            </button>

            <button
              onClick={() => onNavigateTab('programa')}
              className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-slate-200 transition-colors"
            >
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
              <span>📅 Prog. Semanal</span>
            </button>

            <button
              onClick={() => onNavigateMoreSubview('publica')}
              className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-slate-200 transition-colors"
            >
              <Compass className="w-4 h-4 text-teal-400 shrink-0" />
              <span>🪧 Pred. Pública</span>
            </button>

            <button
              onClick={onGenerateWeeklyPdf}
              className="flex items-center gap-2 p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>📄 Generar PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
