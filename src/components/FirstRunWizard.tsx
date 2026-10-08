import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCongregation } from '../context/CongregationContext';
import { dbService } from '../services/dbService';
import { Church, CheckCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface FirstRunWizardProps {
  onComplete: () => void;
}

export const FirstRunWizard: React.FC<FirstRunWizardProps> = ({ onComplete }) => {
  const { userProfile, refreshProfile } = useAuth();
  const { createCongregation } = useCongregation();

  const [step, setStep] = useState(1);
  const [congName, setCongName] = useState('');
  const [circuit, setCircuit] = useState('SV-01');
  const [timezone, setTimezone] = useState('America/El_Salvador');
  const [firstPlace, setFirstPlace] = useState('Salón del Reino');
  const [firstPlaceAddress, setFirstPlaceAddress] = useState('');

  const handleFinish = async () => {
    if (!congName) return;

    // 1. Crear congregación
    const cong = await createCongregation(congName, circuit, timezone);

    // 2. Crear primer lugar de salida
    if (firstPlace && firstPlaceAddress) {
      await dbService.savePreachingPlace({
        id: `place-${Date.now()}`,
        congregationId: cong.id,
        name: firstPlace,
        address: firstPlaceAddress,
        latitude: 13.6929,
        longitude: -89.2182,
        active: true,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Si el usuario actual no tiene rol de coordinador, otorgárselo
    if (userProfile) {
      await dbService.updateUserRoleAndPrivileges(userProfile.id, {
        role: 'COORDINADOR',
        canLeadPreaching: true,
        canPublicPreaching: true,
      });
      await refreshProfile();
    }

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Church className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Configuración Inicial</h2>
          <p className="text-xs text-slate-500">
            Paso {step} de 2 • Configura tu congregación para comenzar
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nombre de la Congregación *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Congregación El Roble"
                value={congName}
                onChange={(e) => setCongName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Circuito
                </label>
                <input
                  type="text"
                  placeholder="Ej: SV-03"
                  value={circuit}
                  onChange={(e) => setCircuit(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Zona Horaria
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="America/El_Salvador">America/El_Salvador</option>
                  <option value="America/Guatemala">America/Guatemala</option>
                  <option value="America/Mexico_City">America/Mexico_City</option>
                  <option value="America/Bogota">America/Bogota</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Rol de Coordinador Automático
              </div>
              <p className="text-[11px] text-blue-800">
                Tu cuenta será configurada automáticamente como Coordinador con todos los privilegios administrativos.
              </p>
            </div>

            <button
              type="button"
              disabled={!congName}
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Lugar de salida principal
              </label>
              <input
                type="text"
                placeholder="Ej: Salón del Reino"
                value={firstPlace}
                onChange={(e) => setFirstPlace(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Dirección del lugar
              </label>
              <input
                type="text"
                placeholder="Ej: Calle Principal #10"
                value={firstPlaceAddress}
                onChange={(e) => setFirstPlaceAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 border border-slate-300 text-slate-600 font-semibold rounded-xl text-xs"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalizar y Entrar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
