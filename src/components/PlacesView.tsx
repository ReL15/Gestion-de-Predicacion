import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCongregation } from '../context/CongregationContext';
import { PreachingPlace } from '../types';
import { MapPin, Plus, Trash2, X, Navigation } from 'lucide-react';

interface PlacesViewProps {
  places: PreachingPlace[];
  onSavePlace: (place: PreachingPlace) => Promise<void>;
  onDeletePlace: (id: string) => Promise<void>;
}

export const PlacesView: React.FC<PlacesViewProps> = ({
  places,
  onSavePlace,
  onDeletePlace,
}) => {
  const { isServiceOverseer } = useAuth();
  const { currentCongregation } = useCongregation();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(13.6929);
  const [longitude, setLongitude] = useState(-89.2182);
  const [description, setDescription] = useState('');

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => {
          alert('No se pudo obtener la ubicación GPS actual: ' + err.message);
        }
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    const newPlace: PreachingPlace = {
      id: `place-${Date.now()}`,
      congregationId: currentCongregation?.id || 'cong-demo-01',
      name,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      description,
      active: true,
      createdAt: new Date().toISOString(),
    };

    await onSavePlace(newPlace);
    setShowModal(false);
    setName('');
    setAddress('');
    setDescription('');
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Lugares de Salida</h2>
          <p className="text-xs text-slate-500">Puntos de partida guardados para las salidas congregacionales</p>
        </div>

        {isServiceOverseer && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Lugar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {places.map((place) => (
          <div key={place.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{place.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{place.address}</p>
                </div>
              </div>

              {isServiceOverseer && (
                <button
                  onClick={() => onDeletePlace(place.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                  title="Dar de baja lugar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {place.description && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-md">
                "{place.description}"
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              <span>Coordenadas: {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <Navigation className="w-3 h-3" />
                <span>Ver en mapa</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">Nuevo Lugar de Salida</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre del lugar *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Salón del Reino, Casa del Hno. Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dirección completa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Av. Las Palmas #123"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Latitud GPS</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Longitud GPS</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Usar ubicación GPS actual del dispositivo</span>
              </button>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descripción / Notas</label>
                <input
                  type="text"
                  placeholder="Ej: Portón verde, timbre derecho"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg"
                >
                  Guardar Lugar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
