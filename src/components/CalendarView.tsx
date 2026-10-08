import React, { useState } from 'react';
import { WeeklyAssignment, PublicPreachingAssignment } from '../types';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Map,
  Compass,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CalendarViewProps {
  weeklyAssignments: WeeklyAssignment[];
  publicAssignments: PublicPreachingAssignment[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  weeklyAssignments,
  publicAssignments,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Generar días del mes actual
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 es domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Filtrar asignaciones del día seleccionado
  const dayWeekly = weeklyAssignments.filter((w) => w.date === selectedDate);
  const dayPublic = publicAssignments.filter((p) => p.date === selectedDate);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Calendario de Predicación</h2>
          <p className="text-xs text-slate-500">Vista unificada de salidas grupales y carritos públicos</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-white rounded transition-colors text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-2 min-w-[110px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-white rounded transition-colors text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid del Calendario */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-2">
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 py-1 border-b border-slate-100">
          <span>Dom</span>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Celdas vacías previas */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 sm:h-14 rounded-lg bg-slate-50/40" />
          ))}

          {/* Días del mes */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;

            const hasWeekly = weeklyAssignments.some((a) => a.date === dateStr);
            const hasPublic = publicAssignments.some((a) => a.date === dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-12 sm:h-14 p-1 rounded-xl flex flex-col items-center justify-between transition-all border ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xs">{dayNum}</span>
                <div className="flex gap-1">
                  {hasWeekly && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" title="Salida semanal" />
                  )}
                  {hasPublic && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" title="Predicación pública" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" /> Salida congregacional
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> Exhibidor público
          </span>
        </div>
      </div>

      {/* Detalle del día seleccionado */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span>Asignaciones para: {selectedDate}</span>
        </h3>

        {dayWeekly.length === 0 && dayPublic.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
            No hay asignaciones programadas para esta fecha.
          </div>
        ) : (
          <div className="space-y-2">
            {/* Salidas semanales del día */}
            {dayWeekly.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-blue-200 p-3.5 shadow-xs space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Salida Grupal
                  </span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.time} hrs
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {item.placeName} (Territorio {item.territoryNumber})
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <span>Encargado:</span>
                  <strong className="text-slate-800">{item.leaderName}</strong>
                </div>
              </div>
            ))}

            {/* Exhibidores públicos del día */}
            {dayPublic.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-teal-200 p-3.5 shadow-xs space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    Exhibidor Público
                  </span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.time} hrs
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  {item.placeName}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <span>Hermanos:</span>
                  <strong className="text-slate-800">
                    {item.participants.map((p) => p.userName).join(', ')}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
