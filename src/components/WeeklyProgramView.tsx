import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCongregation } from '../context/CongregationContext';
import {
  WeeklyAssignment,
  PreachingPlace,
  Territory,
  UserProfile,
  PublicPreachingAssignment,
} from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Map,
  UserCheck,
  Plus,
  Trash2,
  FileDown,
  Printer,
  AlertTriangle,
  CheckCircle,
  X,
  FileText,
} from 'lucide-react';
import { PdfGenerator } from '../services/pdfService';

interface WeeklyProgramViewProps {
  assignments: WeeklyAssignment[];
  places: PreachingPlace[];
  territories: Territory[];
  users: UserProfile[];
  publicAssignments: PublicPreachingAssignment[];
  onSaveAssignment: (assignment: WeeklyAssignment) => Promise<void>;
  onDeleteAssignment: (id: string) => Promise<void>;
}

export const WeeklyProgramView: React.FC<WeeklyProgramViewProps> = ({
  assignments,
  places,
  territories,
  users,
  publicAssignments,
  onSaveAssignment,
  onDeleteAssignment,
}) => {
  const { isServiceOverseer } = useAuth();
  const { currentCongregation } = useCongregation();

  const [showModal, setShowModal] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');

  // Formulario de los 6 pasos
  const [date, setDate] = useState('');
  const [time, setTime] = useState('08:00');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [selectedLeaderId, setSelectedLeaderId] = useState('');
  const [selectedTerritoryId, setSelectedTerritoryId] = useState('');
  const [notes, setNotes] = useState('');

  // Detección de conflicto
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [allowConflictOverride, setAllowConflictOverride] = useState(false);

  // Filtrar solo hermanos que tienen canLeadPreaching = true
  const eligibleLeaders = users.filter((u) => u.active && u.canLeadPreaching);
  const activeTerritories = territories.filter((t) => t.active);

  // Detectar conflictos al cambiar fecha, hora o encargado
  const checkForConflicts = (checkLeaderId: string, checkDate: string, checkTime: string) => {
    if (!checkLeaderId || !checkDate || !checkTime) {
      setConflictWarning(null);
      return;
    }

    // 1. Conflicto con otra asignación semanal el mismo día y hora
    const duplicateWeekly = assignments.find(
      (a) => a.leaderId === checkLeaderId && a.date === checkDate && a.time === checkTime
    );
    if (duplicateWeekly) {
      setConflictWarning(
        `Este hermano ya tiene asignada la salida en "${duplicateWeekly.placeName}" (Terr. ${duplicateWeekly.territoryNumber}) a las ${duplicateWeekly.time}.`
      );
      return;
    }

    // 2. Conflicto con predicación pública (exhibidores)
    const duplicatePublic = publicAssignments.find(
      (pa) =>
        pa.date === checkDate &&
        pa.time === checkTime &&
        pa.participants.some((p) => p.userId === checkLeaderId)
    );
    if (duplicatePublic) {
      setConflictWarning(
        `Este hermano tiene turno en el exhibidor de "${duplicatePublic.placeName}" a las ${duplicatePublic.time}.`
      );
      return;
    }

    setConflictWarning(null);
  };

  const handleLeaderChange = (leaderId: string) => {
    setSelectedLeaderId(leaderId);
    checkForConflicts(leaderId, date, time);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    checkForConflicts(selectedLeaderId, newDate, time);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    checkForConflicts(selectedLeaderId, date, newTime);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !selectedPlaceId || !selectedLeaderId || !selectedTerritoryId) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const place = places.find((p) => p.id === selectedPlaceId);
    const leader = users.find((u) => u.id === selectedLeaderId);
    const territory = territories.find((t) => t.id === selectedTerritoryId);

    if (!place || !leader || !territory) return;

    if (conflictWarning && !allowConflictOverride) {
      alert('Debe confirmar explícitamente si desea guardar la asignación con el conflicto de horario.');
      return;
    }

    const newAssignment: WeeklyAssignment = {
      id: `assign-${Date.now()}`,
      congregationId: currentCongregation?.id || 'cong-demo-01',
      date,
      time,
      placeId: place.id,
      placeName: place.name,
      leaderId: leader.id,
      leaderName: leader.fullName,
      territoryId: territory.id,
      territoryNumber: territory.number,
      notes,
      hasConflict: Boolean(conflictWarning),
      createdAt: new Date().toISOString(),
    };

    await onSaveAssignment(newAssignment);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setDate('');
    setTime('08:00');
    setSelectedPlaceId('');
    setSelectedLeaderId('');
    setSelectedTerritoryId('');
    setNotes('');
    setConflictWarning(null);
    setAllowConflictOverride(false);
  };

  const handleExportPdf = () => {
    if (!currentCongregation) return;
    const doc = PdfGenerator.generateWeeklyProgramPdf(currentCongregation, assignments);
    doc.save(`Programa_Predicacion_${currentCongregation.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrintPdf = () => {
    if (!currentCongregation) return;
    const doc = PdfGenerator.generateWeeklyProgramPdf(currentCongregation, assignments);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  // Ordenar asignaciones cronológicamente
  const sortedAssignments = [...assignments].sort((a, b) => {
    return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
  });

  return (
    <div className="space-y-5 pb-20">
      {/* Barra de Título y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Programa Semanal</h2>
          <p className="text-xs text-slate-500">Salidas congregacionales y asignación de encargados</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            title="Descargar en PDF para imprimir o compartir"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            title="Imprimir directamente"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {isServiceOverseer && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Salida</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de Salidas */}
      {sortedAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
          No hay salidas programadas. Presiona "Nueva Salida" para agregar una.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAssignments.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-shadow shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {item.date}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.time}
                  </span>
                  {item.hasConflict && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Conflicto registrado
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-800">
                  <span className="font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {item.placeName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-medium flex items-center gap-1 text-emerald-800">
                    <Map className="w-3.5 h-3.5 text-emerald-600" />
                    Territorio {item.territoryNumber}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-700 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Encargado: <strong className="text-slate-900">{item.leaderName}</strong>
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 italic">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {isServiceOverseer && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onDeleteAssignment(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar asignación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal / Diálogo de los 6 Pasos */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">Nueva Salida de Predicación</h3>
                <p className="text-xs text-slate-400">Flujo guiado de 6 pasos</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Paso 1: Seleccionar fecha */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  1. Fecha de la salida *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              {/* Paso 2: Seleccionar hora */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  2. Hora de inicio *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              {/* Paso 3: Seleccionar lugar */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  3. Lugar de salida *
                </label>
                <select
                  required
                  value={selectedPlaceId}
                  onChange={(e) => setSelectedPlaceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="">-- Seleccionar lugar guardado --</option>
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.address})
                    </option>
                  ))}
                </select>
              </div>

              {/* Paso 4: Seleccionar encargado (Solo canLeadPreaching = true) */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  4. Encargado del grupo *
                  <span className="text-[10px] text-blue-600 font-normal ml-2">
                    (Solo hermanos con privilegio para dirigir)
                  </span>
                </label>
                <select
                  required
                  value={selectedLeaderId}
                  onChange={(e) => handleLeaderChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="">-- Seleccionar hermano encargado --</option>
                  {eligibleLeaders.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role === 'COORDINADOR' ? 'Coordinador' : u.role === 'SUPERINTENDENTE_DE_SERVICIO' ? 'Superintendente' : 'Publicador'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Advertencia de conflicto */}
              {conflictWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-start gap-2 text-amber-800 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Advertencia de conflicto de horario:</span>
                  </div>
                  <p className="text-amber-700 pl-6 leading-relaxed">
                    {conflictWarning}
                  </p>
                  <label className="flex items-center gap-2 pl-6 text-amber-900 cursor-pointer pt-1 font-semibold">
                    <input
                      type="checkbox"
                      checked={allowConflictOverride}
                      onChange={(e) => setAllowConflictOverride(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Comprendo el conflicto y deseo continuar de todos modos</span>
                  </label>
                </div>
              )}

              {/* Paso 5: Seleccionar territorio */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  5. Territorio asignado *
                </label>
                <select
                  required
                  value={selectedTerritoryId}
                  onChange={(e) => setSelectedTerritoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="">-- Seleccionar territorio --</option>
                  {activeTerritories.map((t) => (
                    <option key={t.id} value={t.id}>
                      Territorio {t.number} - {t.name || 'Sin nombre'} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Paso 6: Observaciones opcionales */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  6. Notas u observaciones opcionales
                </label>
                <input
                  type="text"
                  placeholder="Ej: Salida matutina, llevar revistas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={Boolean(conflictWarning && !allowConflictOverride)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Guardar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
