import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCongregation } from '../context/CongregationContext';
import { UserProfile, UserRole } from '../types';
import {
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Check,
  X,
  Search,
} from 'lucide-react';

interface PublishersViewProps {
  users: UserProfile[];
  onSaveUser: (user: UserProfile) => Promise<void>;
  onUpdatePrivileges: (
    userId: string,
    updates: Partial<Pick<UserProfile, 'role' | 'canLeadPreaching' | 'canPublicPreaching' | 'active'>>
  ) => Promise<void>;
}

export const PublishersView: React.FC<PublishersViewProps> = ({
  users,
  onSaveUser,
  onUpdatePrivileges,
}) => {
  const { isCoordinator } = useAuth();
  const { currentCongregation } = useCongregation();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Formulario nuevo usuario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('PUBLICADOR');
  const [canLead, setCanLead] = useState(false);
  const [canPublic, setCanPublic] = useState(false);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const handleOpenNew = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('PUBLICADOR');
    setCanLead(false);
    setCanPublic(false);
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (u: UserProfile) => {
    setEditingUser(u);
    setFirstName(u.firstName);
    setLastName(u.lastName);
    setEmail(u.email);
    setRole(u.role);
    setCanLead(u.canLeadPreaching);
    setCanPublic(u.canPublicPreaching);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    if (editingUser) {
      await onUpdatePrivileges(editingUser.id, {
        role,
        canLeadPreaching: canLead,
        canPublicPreaching: canPublic,
      });
    } else {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        congregationId: currentCongregation?.id || 'cong-demo-01',
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        role,
        canLeadPreaching: canLead,
        canPublicPreaching: canPublic,
        active: true,
        createdAt: new Date().toISOString(),
      };
      await onSaveUser(newUser);
    }

    setShowModal(false);
    setEditingUser(null);
  };

  const toggleUserActive = async (user: UserProfile) => {
    if (!isCoordinator) return;
    await onUpdatePrivileges(user.id, { active: !user.active });
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Publicadores y Privilegios</h2>
          <p className="text-xs text-slate-500">Gestión de roles y habilitación de asignaciones</p>
        </div>

        <div className="flex items-center gap-2">
          {isCoordinator && (
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Publicador</span>
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Buscar hermano por nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de Publicadores */}
      <div className="space-y-2.5">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              u.active ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/60 opacity-60'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800">{u.fullName}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    u.role === 'COORDINADOR'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : u.role === 'SUPERINTENDENTE_DE_SERVICIO'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : u.role === 'ASISTENTE_SUPERINTENDENTE_SERVICIO'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {u.role === 'COORDINADOR'
                    ? 'Coordinador'
                    : u.role === 'SUPERINTENDENTE_DE_SERVICIO'
                    ? 'Superintendente'
                    : u.role === 'ASISTENTE_SUPERINTENDENTE_SERVICIO'
                    ? 'Asistente'
                    : 'Publicador'}
                </span>
                {!u.active && (
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-medium">
                    Inactivo
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500">{u.email}</div>

              {/* Badges de Privilegios */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${
                    u.canLeadPreaching
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {u.canLeadPreaching ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-400" />
                  )}
                  Puede dirigir grupo
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${
                    u.canPublicPreaching
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {u.canPublicPreaching ? (
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-400" />
                  )}
                  Predicación pública
                </span>
              </div>
            </div>

            {isCoordinator && (
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleEdit(u)}
                  className="px-2.5 py-1 text-xs border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => toggleUserActive(u)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-lg ${
                    u.active
                      ? 'text-amber-700 hover:bg-amber-50'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {u.active ? 'Desactivar' : 'Reactivar'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Creación / Edición */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">
                {editingUser ? 'Editar Privilegios del Publicador' : 'Registrar Nuevo Publicador'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rol Congregacional</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="PUBLICADOR">Publicador</option>
                  <option value="ASISTENTE_SUPERINTENDENTE_SERVICIO">Asistente Sup. de Servicio</option>
                  <option value="SUPERINTENDENTE_DE_SERVICIO">Superintendente de Servicio</option>
                  <option value="COORDINADOR">Coordinador del Cuerpo de Ancianos</option>
                </select>
              </div>

              {/* Privilegios */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-700 block">Privilegios asignados:</span>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={canLead}
                    onChange={(e) => setCanLead(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Puede dirigir grupo de predicación</span>
                    <span className="text-[11px] text-slate-500">
                      Permite que aparezca en la lista de encargados del programa semanal
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={canPublic}
                    onChange={(e) => setCanPublic(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Participar en predicación pública</span>
                    <span className="text-[11px] text-slate-500">
                      Permite asignarlo a turnos de exhibidores y carritos
                    </span>
                  </div>
                </label>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Guardar Publicador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
