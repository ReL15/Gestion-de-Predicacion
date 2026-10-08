import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCongregation } from '../context/CongregationContext';
import {
  Settings,
  Bell,
  Globe,
  Database,
  Download,
  Shield,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import { dbService } from '../services/dbService';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    isCoordinator,
    isDemoMode,
    toggleDemoMode,
    activeDemoUser,
  } = useAuth();
  const { currentCongregation, congregations } = useCongregation();

  // Preferencias de Notificaciones
  const [remind7Days, setRemind7Days] = useState(true);
  const [remind2Days, setRemind2Days] = useState(true);
  const [remindSameDay7AM, setRemindSameDay7AM] = useState(true);
  const [savedNotif, setSavedNotif] = useState(false);

  // Zona horaria
  const [timezone, setTimezone] = useState(
    currentCongregation?.timezone || 'America/El_Salvador'
  );

  const handleSaveNotifs = () => {
    setSavedNotif(true);
    setTimeout(() => setSavedNotif(false), 2500);
  };

  const handleExportJson = async () => {
    if (!currentCongregation) return;
    const data = {
      congregation: currentCongregation,
      users: await dbService.getCongregationUsers(currentCongregation.id),
      places: await dbService.getPreachingPlaces(currentCongregation.id),
      territories: await dbService.getTerritories(currentCongregation.id),
      weeklyAssignments: await dbService.getWeeklyAssignments(currentCongregation.id),
      publicPlaces: await dbService.getPublicPlaces(currentCongregation.id),
      publicAssignments: await dbService.getPublicAssignments(currentCongregation.id),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Copia_Seguridad_${currentCongregation.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-800">Configuración</h2>
        <p className="text-xs text-slate-500">Ajustes congregacionales, notificaciones y copias de seguridad</p>
      </div>

      {/* Modo de Demostración */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-amber-950">Modo de Demostración / Pruebas</h3>
          </div>
          <button
            onClick={() => toggleDemoMode()}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              isDemoMode
                ? 'bg-amber-600 text-white'
                : 'bg-amber-200/80 text-amber-900 hover:bg-amber-300'
            }`}
          >
            {isDemoMode ? 'Activo (Desactivar)' : 'Inactivo (Activar)'}
          </button>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          Permite explorar toda la funcionalidad con datos de prueba precargados (Congregación El Roble, hermanos Carlos López, Juan Pérez, territorios 1 al 3 y puntos de predicación pública) sin afectar la base de datos real de Firestore.
        </p>
      </div>

      {/* Zona Horaria */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-slate-800">
          <Globe className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm">Zona Horaria de la Congregación</h3>
        </div>
        <p className="text-xs text-slate-500">
          Utilizada para programar los recordatorios a las 7:00 AM hora local sin desfase UTC.
        </p>
        <div className="max-w-xs">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={!isCoordinator}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium disabled:bg-slate-50"
          >
            <option value="America/El_Salvador">America/El_Salvador (GMT-6)</option>
            <option value="America/Guatemala">America/Guatemala (GMT-6)</option>
            <option value="America/Tegucigalpa">America/Tegucigalpa (GMT-6)</option>
            <option value="America/Costa_Rica">America/Costa_Rica (GMT-6)</option>
            <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
            <option value="America/Bogota">America/Bogota (GMT-5)</option>
            <option value="America/Lima">America/Lima (GMT-5)</option>
          </select>
        </div>
      </div>

      {/* Preferencias de Notificaciones */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-slate-800">
          <Bell className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm">Preferencias de Notificaciones Automáticas</h3>
        </div>
        <p className="text-xs text-slate-500">
          Configuración personal para avisos de salidas y turnos de predicación pública:
        </p>

        <div className="space-y-2.5 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={remind7Days}
              onChange={(e) => setRemind7Days(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Recordatorio 7 días antes</span>
              <span className="text-[11px] text-slate-500">
                Aviso anticipado para confirmar disponibilidad
              </span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={remind2Days}
              onChange={(e) => setRemind2Days(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Recordatorio 2 días antes</span>
              <span className="text-[11px] text-slate-500">
                Preparación de literatura y exhibidor
              </span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={remindSameDay7AM}
              onChange={(e) => setRemindSameDay7AM(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Recordatorio el mismo día a las 7:00 AM</span>
              <span className="text-[11px] text-slate-500">
                "Buenos días. Hoy tienes una asignación de predicación..."
              </span>
            </div>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSaveNotifs}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            Guardar Preferencias
          </button>
          {savedNotif && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Guardado correctamente
            </span>
          )}
        </div>
      </div>

      {/* Copias de Seguridad / Exportación */}
      {isCoordinator && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm">Copia de Seguridad y Exportación</h3>
          </div>
          <p className="text-xs text-slate-500">
            Descarga una copia completa en formato JSON con todos los datos de la congregación (territorios, lugares, programas, hermanos e historial).
          </p>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Todos los Datos (.JSON)</span>
          </button>
        </div>
      )}

      {/* Información del Sistema */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500 space-y-1">
        <div className="font-semibold text-slate-700">Organizador de Predicación • Versión 1.0.0</div>
        <div>Desarrollo multiplataforma Kotlin Multiplatform (Compose Android & iOS) con backend Firebase.</div>
        <div>Sin publicidad • Sin fines de lucro • Uso exclusivo interno congregacional.</div>
      </div>
    </div>
  );
};
