import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCongregation } from '../context/CongregationContext';
import {
  PublicPreachingPlace,
  PublicPreachingAssignment,
  UserProfile,
} from '../types';
import {
  Compass,
  MapPin,
  Clock,
  Users,
  Plus,
  FileDown,
  Printer,
  AlertCircle,
  CheckCircle2,
  X,
  Trash2,
} from 'lucide-react';
import { PdfGenerator } from '../services/pdfService';

interface PublicPreachingViewProps {
  places: PublicPreachingPlace[];
  assignments: PublicPreachingAssignment[];
  users: UserProfile[];
  onSavePlace: (place: PublicPreachingPlace) => Promise<void>;
  onSaveAssignment: (assignment: PublicPreachingAssignment) => Promise<void>;
}

export const PublicPreachingView: React.FC<PublicPreachingViewProps> = ({
  places,
  assignments,
  users,
  onSavePlace,
  onSaveAssignment,
}) => {
  const { isServiceOverseer } = useAuth();
  const { currentCongregation } = useCongregation();

  const [activeTab, setActiveTab] = useState<'asignaciones' | 'puntos'>('asignaciones');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);

  // Formulario de asignación temporal
  const [assignDate, setAssignDate] = useState('');
  const [assignTime, setAssignTime] = useState('09:00');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [assignNotes, setAssignNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Formulario de nuevo punto / exhibidor
  const [placeName, setPlaceName] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');
  const [placeLat, setPlaceLat] = useState(13.699);
  const [placeLng, setPlaceLng] = useState(-89.191);
  const [placeDay, setPlaceDay] = useState('Sábado');
  const [placeTime, setPlaceTime] = useState('09:00');
  const [placeDuration, setPlaceDuration] = useState('2 horas');
  const [placeFixedMembers, setPlaceFixedMembers] = useState<string[]>([]);

  // Solo hermanos con privilegio de predicación pública
  const eligiblePublicPublishers = users.filter((u) => u.active && u.canPublicPreaching);

  // Al seleccionar punto de exhibidor, precargar los hermanos fijos
  const handlePlaceSelect = (id: string) => {
    setSelectedPlaceId(id);
    const place = places.find((p) => p.id === id);
    if (place) {
      setAssignTime(place.time || '09:00');
      // Precargar hermanos fijos configurados
      setSelectedUserIds(place.fixedMemberIds || []);
    }
  };

  const toggleParticipant = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
      setValidationError(null);
    } else {
      if (selectedUserIds.length >= 3) {
        setValidationError('No se permite guardar más de 3 participantes por exhibidor.');
        return;
      }
      setSelectedUserIds([...selectedUserIds, userId]);
      setValidationError(null);
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDate || !assignTime || !selectedPlaceId) {
      setValidationError('Por favor seleccione fecha, hora y punto de exhibidor.');
      return;
    }

    if (selectedUserIds.length > 3) {
      setValidationError('Máximo 3 participantes permitidos.');
      return;
    }

    if (selectedUserIds.length < 2) {
      const confirmSingle = window.confirm(
        'Se recomienda un mínimo de 2 hermanos por exhibidor. ¿Desea guardar con menos de 2 participantes?'
      );
      if (!confirmSingle) return;
    }

    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;

    const participantsData = selectedUserIds.map((uid) => {
      const u = users.find((user) => user.id === uid);
      const isFixed = place.fixedMemberIds?.includes(uid) || false;
      return {
        userId: uid,
        userName: u?.fullName || 'Hermano',
        isFixed,
      };
    });

    const newAssignment: PublicPreachingAssignment = {
      id: `pub-assign-${Date.now()}`,
      congregationId: currentCongregation?.id || 'cong-demo-01',
      placeId: place.id,
      placeName: place.name,
      date: assignDate,
      time: assignTime,
      participants: participantsData,
      notes: assignNotes,
      createdAt: new Date().toISOString(),
    };

    await onSaveAssignment(newAssignment);
    setShowAssignModal(false);
    setSelectedUserIds([]);
    setAssignNotes('');
    setValidationError(null);
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName || !placeAddress) return;

    const newPlace: PublicPreachingPlace = {
      id: `pub-place-${Date.now()}`,
      congregationId: currentCongregation?.id || 'cong-demo-01',
      name: placeName,
      address: placeAddress,
      latitude: Number(placeLat),
      longitude: Number(placeLng),
      day: placeDay,
      time: placeTime,
      duration: placeDuration,
      active: true,
      fixedMemberIds: placeFixedMembers,
      createdAt: new Date().toISOString(),
    };

    await onSavePlace(newPlace);
    setShowPlaceModal(false);
    setPlaceName('');
    setPlaceAddress('');
    setPlaceFixedMembers([]);
  };

  const handleExportPdf = () => {
    if (!currentCongregation) return;
    const doc = PdfGenerator.generatePublicPreachingPdf(currentCongregation, assignments);
    doc.save(`Predicacion_Publica_${currentCongregation.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrintPdf = () => {
    if (!currentCongregation) return;
    const doc = PdfGenerator.generatePublicPreachingPdf(currentCongregation, assignments);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Encabezado y Pestañas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Predicación Pública (Exhibidores)</h2>
          <p className="text-xs text-slate-500">Puntos fijos, carritos móviles y asignación de 2 a 3 publicadores</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            title="Descargar PDF de predicación pública"
          >
            <FileDown className="w-4 h-4 text-teal-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>

          {isServiceOverseer && (
            <button
              onClick={() => {
                setValidationError(null);
                setShowAssignModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Asignación</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-selector Asignaciones vs Puntos de Exhibidor */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('asignaciones')}
          className={`py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'asignaciones'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Asignaciones Programadas ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('puntos')}
          className={`py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'puntos'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Puntos y Hermanos Fijos ({places.length})
        </button>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'asignaciones' ? (
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              No hay turnos de exhibidor programados.
            </div>
          ) : (
            assignments.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {item.date}
                    </span>
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.time} hrs
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {item.participants.length} participantes
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-teal-600" />
                  {item.placeName}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.participants.map((p) => (
                    <span
                      key={p.userId}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1 ${
                        p.isFixed
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <Users className="w-3 h-3 text-slate-500" />
                      {p.userName}
                      {p.isFixed && <span className="text-[9px] text-blue-600 font-bold">(Fijo)</span>}
                    </span>
                  ))}
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 italic pt-1">
                    "{item.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Pestaña: Puntos y Hermanos Fijos */
        <div className="space-y-4">
          {isServiceOverseer && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowPlaceModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Punto de Exhibidor</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {places.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800">{p.name}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {p.day} • {p.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {p.address}
                </p>
                <div className="text-[11px] text-slate-400">
                  GPS: {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)} • Duración: {p.duration}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-700 mb-1">
                    Hermanos fijos asignados:
                  </div>
                  {p.fixedMemberIds && p.fixedMemberIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.fixedMemberIds.map((fId) => {
                        const u = users.find((user) => user.id === fId);
                        return (
                          <span
                            key={fId}
                            className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-medium border border-teal-200"
                          >
                            {u?.fullName || fId}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Sin hermanos fijos</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Asignación Temporal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">Asignar Turno de Exhibidor</h3>
                <p className="text-xs text-slate-400">Seleccione punto y de 2 a 3 publicadores autorizados</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Punto de Exhibidor *</label>
                <select
                  required
                  value={selectedPlaceId}
                  onChange={(e) => handlePlaceSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Seleccionar lugar --</option>
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.day} {p.time})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hora *</label>
                  <input
                    type="time"
                    required
                    value={assignTime}
                    onChange={(e) => setAssignTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Selección de Participantes (2 a 3) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Participantes ({selectedUserIds.length} seleccionados - mín 2, máx 3) *
                  </label>
                  <span className="text-[10px] text-teal-700 font-semibold">
                    Solo con privilegio público
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 p-1">
                  {eligiblePublicPublishers.map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleParticipant(u.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          isSelected ? 'bg-teal-50 text-teal-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-teal-600"
                          />
                          <span>{u.fullName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {u.role === 'COORDINADOR' ? 'Coord.' : u.role === 'SUPERINTENDENTE_DE_SERVICIO' ? 'Super.' : 'Publicador'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {validationError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas u observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Llevar exhibidor #2, reposición de tratados..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Guardar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Punto de Exhibidor */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">Nuevo Punto de Exhibidor</h3>
              <button onClick={() => setShowPlaceModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre del punto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Frente al Centro Comercial"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dirección / Referencia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pasarela norte, sobre acera peatonal"
                  value={placeAddress}
                  onChange={(e) => setPlaceAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Latitud GPS</label>
                  <input
                    type="number"
                    step="any"
                    value={placeLat}
                    onChange={(e) => setPlaceLat(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Longitud GPS</label>
                  <input
                    type="number"
                    step="any"
                    value={placeLng}
                    onChange={(e) => setPlaceLng(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Día habitual</label>
                  <input
                    type="text"
                    value={placeDay}
                    onChange={(e) => setPlaceDay(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hora habitual</label>
                  <input
                    type="time"
                    value={placeTime}
                    onChange={(e) => setPlaceTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duración</label>
                  <input
                    type="text"
                    value={placeDuration}
                    onChange={(e) => setPlaceDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPlaceModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-lg"
                >
                  Guardar Punto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
