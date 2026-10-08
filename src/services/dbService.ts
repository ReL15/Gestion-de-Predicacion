import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Congregation,
  UserProfile,
  PreachingPlace,
  Territory,
  WeeklyAssignment,
  PublicPreachingPlace,
  PublicPreachingAssignment,
  AuditLog,
} from '../types';
import {
  DEMO_CONGREGATION,
  DEMO_USERS,
  DEMO_PLACES,
  DEMO_TERRITORIES,
  DEMO_WEEKLY_ASSIGNMENTS,
  DEMO_PUBLIC_PLACES,
  DEMO_PUBLIC_ASSIGNMENTS,
} from './demoData';

class DatabaseService {
  private isDemoMode = false;

  setDemoMode(enabled: boolean) {
    this.isDemoMode = enabled;
  }

  getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  // --- Congregaciones ---
  async getCongregation(id: string): Promise<Congregation | null> {
    if (this.isDemoMode) {
      return id === DEMO_CONGREGATION.id ? DEMO_CONGREGATION : null;
    }
    const path = `congregations/${id}`;
    try {
      const snap = await getDoc(doc(db, 'congregations', id));
      return snap.exists() ? (snap.data() as Congregation) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  async getAllCongregations(): Promise<Congregation[]> {
    if (this.isDemoMode) {
      return [DEMO_CONGREGATION];
    }
    const path = 'congregations';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => d.data() as Congregation);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async saveCongregation(cong: Congregation): Promise<void> {
    if (this.isDemoMode) return;
    const path = `congregations/${cong.id}`;
    try {
      await setDoc(doc(db, 'congregations', cong.id), cong);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // --- Usuarios / Publicadores ---
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (this.isDemoMode) {
      return DEMO_USERS.find(u => u.id === userId) || DEMO_USERS[0];
    }
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  async getCongregationUsers(congregationId: string): Promise<UserProfile[]> {
    if (this.isDemoMode) {
      return DEMO_USERS;
    }
    const path = 'users';
    try {
      const q = query(collection(db, path), where('congregationId', '==', congregationId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as UserProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async saveUserProfile(user: UserProfile): Promise<void> {
    if (this.isDemoMode) return;
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async updateUserRoleAndPrivileges(
    userId: string,
    updates: Partial<Pick<UserProfile, 'role' | 'canLeadPreaching' | 'canPublicPreaching' | 'active'>>
  ): Promise<void> {
    if (this.isDemoMode) return;
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  // --- Lugares de salida ---
  async getPreachingPlaces(congregationId: string): Promise<PreachingPlace[]> {
    if (this.isDemoMode) {
      return DEMO_PLACES.filter(p => p.active);
    }
    const path = 'preachingPlaces';
    try {
      const q = query(collection(db, path), where('congregationId', '==', congregationId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as PreachingPlace).filter(p => p.active !== false);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async savePreachingPlace(place: PreachingPlace): Promise<void> {
    if (this.isDemoMode) return;
    const path = `preachingPlaces/${place.id}`;
    try {
      await setDoc(doc(db, 'preachingPlaces', place.id), place);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async softDeletePreachingPlace(placeId: string): Promise<void> {
    if (this.isDemoMode) return;
    const path = `preachingPlaces/${placeId}`;
    try {
      await updateDoc(doc(db, 'preachingPlaces', placeId), { active: false });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  // --- Territorios ---
  async getTerritories(congregationId: string): Promise<Territory[]> {
    if (this.isDemoMode) {
      return DEMO_TERRITORIES.filter(t => t.active);
    }
    const path = 'territories';
    try {
      const q = query(collection(db, path), where('congregationId', '==', congregationId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Territory).filter(t => t.active !== false);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async saveTerritory(terr: Territory): Promise<void> {
    if (this.isDemoMode) return;
    const path = `territories/${terr.id}`;
    try {
      await setDoc(doc(db, 'territories', terr.id), terr);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async softDeleteTerritory(territoryId: string): Promise<void> {
    if (this.isDemoMode) return;
    const path = `territories/${territoryId}`;
    try {
      await updateDoc(doc(db, 'territories', territoryId), { active: false, status: 'INACTIVO' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  // --- Programa Semanal ---
  async getWeeklyAssignments(congregationId: string): Promise<WeeklyAssignment[]> {
    if (this.isDemoMode) {
      return DEMO_WEEKLY_ASSIGNMENTS;
    }
    const path = 'weeklyAssignments';
    try {
      const q = query(collection(db, path), where('congregationId', '==', congregationId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as WeeklyAssignment);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async saveWeeklyAssignment(assignment: WeeklyAssignment): Promise<void> {
    if (this.isDemoMode) return;
    const path = `weeklyAssignments/${assignment.id}`;
    try {
      await setDoc(doc(db, 'weeklyAssignments', assignment.id), assignment);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async deleteWeeklyAssignment(assignmentId: string): Promise<void> {
    if (this.isDemoMode) return;
    const path = `weeklyAssignments/${assignmentId}`;
    try {
      await deleteDoc(doc(db, 'weeklyAssignments', assignmentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  // --- Predicación Pública / Exhibidores ---
  async getPublicPlaces(congregationId: string): Promise<PublicPreachingPlace[]> {
    if (this.isDemoMode) {
      return DEMO_PUBLIC_PLACES.filter(p => p.active);
    }
    const path = 'publicPreachingPlaces';
    try {
      const q = query(collection(db, path), where('congregationId', '==', congregationId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as PublicPreachingPlace).filter(p => p.active !== false);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async savePublicPlace(place: PublicPreachingPlace): Promise<void> {
    if (this.isDemoMode) return;
    const path = `publicPreachingPlaces/${place.id}`;
    try {
      await setDoc(doc(db, 'publicPreachingPlaces', place.id), place);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async getPublicAssignments(congregationId: string): Promise<PublicPreachingAssignment[]> {
    if (this.isDemoMode) {
      return DEMO_PUBLIC_ASSIGNMENTS;
    }
    const path = 'publicPreachingAssignments';
    try {
      const q = query(collection(db, path), where('congregationId', '==', congregationId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as PublicPreachingAssignment);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async savePublicAssignment(assignment: PublicPreachingAssignment): Promise<void> {
    if (this.isDemoMode) return;
    const path = `publicPreachingAssignments/${assignment.id}`;
    try {
      await setDoc(doc(db, 'publicPreachingAssignments', assignment.id), assignment);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // --- Auditoría ---
  async logAction(log: Omit<AuditLog, 'id'>): Promise<void> {
    if (this.isDemoMode) return;
    const path = 'auditLogs';
    try {
      await addDoc(collection(db, path), {
        ...log,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('No se pudo registrar auditoría:', err);
    }
  }
}

export const dbService = new DatabaseService();
