import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCongregation } from '../context/CongregationContext';
import { Territory, TerritoryStatus, LatLngCoord } from '../types';
import {
  Map,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  History,
  Eye,
  X,
  Layers,
  MapPin,
} from 'lucide-react';

interface TerritoriesViewProps {
  territories: Territory[];
  onSaveTerritory: (terr: Territory) => Promise<void>;
  onDeleteTerritory: (id: string) => Promise<void>;
}

export const TerritoriesView: React.FC<TerritoriesViewProps> = ({
  territories,
  onSaveTerritory,
  onDeleteTerritory,
}) => {
  const { isServiceOverseer } = useAuth();
  const { currentCongregation } = useCongregation();

  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  // Formulario
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TerritoryStatus>('DISPONIBLE');
  const [observations, setObservations] = useState('');
  const [coordsText, setCoordsText] = useState('');

  const filteredTerritories = territories.filter((t) => {
    if (filterStatus === 'TODOS') return true;
    return t.status === filterStatus;
  });

  const handleOpenNew = () => {
    setNumber('');
    setName('');
    setDescription('');
    setStatus('DISPONIBLE');
    setObservations('');
    // Coordenadas demo de ejemplo para El Salvador
    setCoordsText('13.6929, -89.2182\n13.6955, -89.2150\n13.6910, -89.2120\n13.6890, -89.2160');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number) return;

    // Parsear coordenadas
    const parsedPolygon: LatLngCoord[] = coordsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.includes(','))
      .map((line) => {
        const [lat, lng] = line.split(',').map((s) => Number(s.trim()));
        return { latitude: lat, longitude: lng };
      })
      .filter((coord) => !isNaN(coord.latitude) && !isNaN(coord.longitude));

    const newTerr: Territory = {
      id: selectedTerritory ? selectedTerritory.id : `terr-${Date.now()}`,
      congregationId: currentCongregation?.id || 'cong-demo-01',
      number,
      name,
      description,
      status,
      polygon: parsedPolygon.length > 0 ? parsedPolygon : [
        { latitude: 13.692, longitude: -89.218 },
        { latitude: 13.695, longitude: -89.215 },
        { latitude: 13.691, longitude: -89.212 },
      ],
      active: true,
      observations,
      createdAt: selectedTerritory ? selectedTerritory.createdAt : new Date().toISOString(),
    };

    await onSaveTerritory(newTerr);
    setShowModal(false);
    setSelectedTerritory(null);
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Territorios Congregacionales</h2>
          <p className="text-xs text-slate-500">Límites poligonales, estado de asignación e historial</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro por estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="DISPONIBLE">Disponibles</option>
            <option value="ASIGNADO">Asignados</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="COMPLETADO">Completados</option>
          </select>

          {isServiceOverseer && (
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Territorio</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Territorios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTerritories.map((terr) => {
          const statusBadgeColor =
            terr.status === 'DISPONIBLE'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : terr.status === 'ASIGNADO'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : terr.status === 'EN_PROCESO'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200';

          return (
            <div
              key={terr.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                      {terr.number}
                    </span>
                    {terr.name || `Territorio ${terr.number}`}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeColor}`}>
                    {terr.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {terr.description || 'Sin descripción detallada'}
                </p>

                {/* Previsualización Vectorial del Polígono */}
                <div className="mt-2.5 h-24 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden flex items-center justify-center p-2">
                  {terr.polygon && terr.polygon.length >= 3 ? (
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <polygon
                        points="20,20 80,30 70,80 30,70"
                        className="fill-emerald-500/20 stroke-emerald-600 stroke-2"
                      />
                      <circle cx="20" cy="20" r="3" className="fill-emerald-700" />
                      <circle cx="80" cy="30" r="3" className="fill-emerald-700" />
                      <circle cx="70" cy="80" r="3" className="fill-emerald-700" />
                      <circle cx="30" cy="70" r="3" className="fill-emerald-700" />
                    </svg>
                  ) : (
                    <span className="text-[10px] text-slate-400">Sin polígono dibujado</span>
                  )}
                  <span className="absolute bottom-1 right-1 text-[9px] bg-white/90 px-1 rounded text-slate-500">
                    {terr.polygon?.length || 0} puntos GPS
                  </span>
                </div>

                {terr.lastAssignedTo && (
                  <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Último: {terr.lastAssignedTo} ({terr.lastAssignedDate})</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedTerritory(terr)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 text-[11px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver detalles</span>
                </button>

                {isServiceOverseer && (
                  <button
                    onClick={() => onDeleteTerritory(terr.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Dar de baja territorio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalle / Edición */}
      {(showModal || selectedTerritory) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">
                {selectedTerritory ? `Territorio ${selectedTerritory.number}` : 'Nuevo Territorio'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTerritory(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTerritory && !showModal ? (
              // Vista de sólo lectura / Historial
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 block">Nombre / Sector:</span>
                  <p className="text-slate-800 font-medium text-sm">{selectedTerritory.name || 'Sin nombre'}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block">Descripción:</span>
                  <p className="text-slate-700">{selectedTerritory.description || 'Sin notas'}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block">Estado:</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mt-0.5">
                    {selectedTerritory.status}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Coordenadas del polígono:</span>
                  <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[11px] text-slate-700 max-h-28 overflow-y-auto">
                    {selectedTerritory.polygon.map((p, idx) => (
                      <div key={idx}>P{idx + 1}: {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}</div>
                    ))}
                  </div>
                </div>
                {selectedTerritory.observations && (
                  <div>
                    <span className="font-semibold text-slate-400 block">Observaciones:</span>
                    <p className="text-slate-700 italic">{selectedTerritory.observations}</p>
                  </div>
                )}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedTerritory(null)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              // Formulario de edición
              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Número de territorio *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 05"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Estado</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TerritoryStatus)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="DISPONIBLE">DISPONIBLE</option>
                      <option value="ASIGNADO">ASIGNADO</option>
                      <option value="EN_PROCESO">EN_PROCESO</option>
                      <option value="COMPLETADO">COMPLETADO</option>
                      <option value="INACTIVO">INACTIVO</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre opcional</label>
                  <input
                    type="text"
                    placeholder="Ej: Residencial Los Álamos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej: Edificios multifamiliares y pasajes peatonales"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Puntos del Polígono (Latitud, Longitud por línea)
                  </label>
                  <textarea
                    rows={4}
                    value={coordsText}
                    onChange={(e) => setCoordsText(e.target.value)}
                    placeholder="13.6929, -89.2182&#10;13.6955, -89.2150&#10;13.6910, -89.2120"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Observaciones</label>
                  <input
                    type="text"
                    placeholder="Ej: Mejor predicar sábados en la mañana"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Guardar Territorio
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
