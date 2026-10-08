/**
 * Tipos de datos para el Organizador de la Predicación Congregacional
 * Compatible con modelos Kotlin Multiplatform (KMP)
 */

export type UserRole =
  | 'COORDINADOR'
  | 'SUPERINTENDENTE_DE_SERVICIO'
  | 'ASISTENTE_SUPERINTENDENTE_SERVICIO'
  | 'PUBLICADOR';

export interface Congregation {
  id: string;
  name: string;
  circuit?: string;
  timezone: string; // Ej: 'America/El_Salvador'
  createdAt: string;
  createdBy?: string;
}

export interface UserProfile {
  id: string; // Auth UID
  congregationId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  canLeadPreaching: boolean; // Puede dirigir grupo de predicación
  canPublicPreaching: boolean; // Puede participar en predicación pública con exhibidores
  active: boolean;
  createdAt: string;
}

export interface PreachingPlace {
  id: string;
  congregationId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  active: boolean;
  createdAt: string;
}

export type TerritoryStatus =
  | 'DISPONIBLE'
  | 'ASIGNADO'
  | 'EN_PROCESO'
  | 'COMPLETADO'
  | 'INACTIVO';

export interface LatLngCoord {
  latitude: number;
  longitude: number;
}

export interface Territory {
  id: string;
  congregationId: string;
  number: string;
  name?: string;
  description?: string;
  status: TerritoryStatus;
  polygon: LatLngCoord[];
  active: boolean;
  observations?: string;
  lastAssignedDate?: string;
  lastAssignedTo?: string;
  createdAt: string;
}

export interface TerritoryHistoryRecord {
  id: string;
  territoryId: string;
  territoryNumber: string;
  congregationId: string;
  assignedToName: string;
  assignedToId: string;
  date: string;
  completedDate?: string;
}

export interface WeeklyAssignment {
  id: string;
  congregationId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  placeId: string;
  placeName: string;
  leaderId: string;
  leaderName: string;
  territoryId: string;
  territoryNumber: string;
  notes?: string;
  hasConflict?: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface PublicPreachingPlace {
  id: string;
  congregationId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  day: string; // Sábado, Domingo, Lunes...
  time: string; // 09:00 AM
  duration: string; // 2 horas
  description?: string;
  active: boolean;
  fixedMemberIds: string[]; // Hermanos fijos en este lugar
  createdAt: string;
}

export interface PublicPreachingAssignment {
  id: string;
  congregationId: string;
  placeId: string;
  placeName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  participants: {
    userId: string;
    userName: string;
    isFixed?: boolean;
  }[];
  notes?: string;
  createdAt: string;
}

export interface NotificationPreference {
  userId: string;
  congregationId: string;
  remind7DaysBefore: boolean;
  remind2DaysBefore: boolean;
  remindSameDay7AM: boolean;
  fcmToken?: string;
}

export interface AuditLog {
  id: string;
  congregationId: string;
  userId: string;
  userName: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details?: string;
  timestamp: string;
}
