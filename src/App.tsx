import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CongregationProvider, useCongregation } from './context/CongregationContext';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { WeeklyProgramView } from './components/WeeklyProgramView';
import { CalendarView } from './components/CalendarView';
import { PublicPreachingView } from './components/PublicPreachingView';
import { TerritoriesView } from './components/TerritoriesView';
import { PlacesView } from './components/PlacesView';
import { PublishersView } from './components/PublishersView';
import { SettingsView } from './components/SettingsView';
import { AuthScreen } from './components/AuthScreen';
import { FirstRunWizard } from './components/FirstRunWizard';
import { KmpArchitectureModal } from './components/KmpArchitectureModal';
import { dbService } from './services/dbService';
import { PdfGenerator } from './services/pdfService';
import {
  WeeklyAssignment,
  PublicPreachingAssignment,
  PreachingPlace,
  Territory,
  UserProfile,
  PublicPreachingPlace,
} from './types';
import {
  Map,
  MapPin,
  Compass,
  Users,
  Settings as SettingsIcon,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

function MainApp() {
  const { currentUser, isDemoMode, userProfile, isCoordinator } = useAuth();
  const { currentCongregation, congregations } = useCongregation();

  // Navegación
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [moreSubview, setMoreSubview] = useState<
    'menu' | 'territorios' | 'lugares' | 'publica' | 'publicadores' | 'configuracion'
  >('menu');

  // Modales
  const [showKmpModal, setShowKmpModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Estados de datos
  const [weeklyAssignments, setWeeklyAssignments] = useState<WeeklyAssignment[]>([]);
  const [publicAssignments, setPublicAssignments] = useState<PublicPreachingAssignment[]>([]);
  const [places, setPlaces] = useState<PreachingPlace[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [publicPlaces, setPublicPlaces] = useState<PublicPreachingPlace[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Cargar datos de la congregación activa
  const refreshData = async () => {
    if (!currentCongregation) return;
    setLoadingData(true);
    try {
      const [wList, paList, plList, tList, pubPlaces, uList] = await Promise.all([
        dbService.getWeeklyAssignments(currentCongregation.id),
        dbService.getPublicAssignments(currentCongregation.id),
        dbService.getPreachingPlaces(currentCongregation.id),
        dbService.getTerritories(currentCongregation.id),
        dbService.getPublicPlaces(currentCongregation.id),
        dbService.getCongregationUsers(currentCongregation.id),
      ]);
      setWeeklyAssignments(wList);
      setPublicAssignments(paList);
      setPlaces(plList);
      setTerritories(tList);
      setPublicPlaces(pubPlaces);
      setUsers(uList);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentCongregation?.id, isDemoMode]);

  // Si no hay congregación creada y no estamos en demo mode, invitar al wizard
  useEffect(() => {
    if (!isDemoMode && congregations.length === 0 && !loadingData) {
      setShowWizard(true);
    }
  }, [congregations.length, isDemoMode, loadingData]);

  // Si el usuario no está autenticado ni en modo demo
  if (!currentUser && !isDemoMode) {
    return <AuthScreen />;
  }

  // Próxima asignación semanal (la más próxima a hoy)
  const today = new Date().toISOString().split('T')[0];
  const nextWeekly =
    weeklyAssignments
      .filter((w) => w.date >= today)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0] ||
    weeklyAssignments[0] ||
    null;

  const nextPublic =
    publicAssignments
      .filter((p) => p.date >= today)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0] ||
    publicAssignments[0] ||
    null;

  // Handlers para guardar y borrar
  const handleSaveWeekly = async (assignment: WeeklyAssignment) => {
    await dbService.saveWeeklyAssignment(assignment);
    await refreshData();
  };

  const handleDeleteWeekly = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta asignación semanal?')) {
      await dbService.deleteWeeklyAssignment(id);
      await refreshData();
    }
  };

  const handleSavePublicPlace = async (p: PublicPreachingPlace) => {
    await dbService.savePublicPlace(p);
    await refreshData();
  };

  const handleSavePublicAssignment = async (pa: PublicPreachingAssignment) => {
    await dbService.savePublicAssignment(pa);
    await refreshData();
  };

  const handleSaveTerritory = async (t: Territory) => {
    await dbService.saveTerritory(t);
    await refreshData();
  };

  const handleDeleteTerritory = async (id: string) => {
    if (window.confirm('¿Desea dar de baja este territorio?')) {
      await dbService.softDeleteTerritory(id);
      await refreshData();
    }
  };

  const handleSavePlace = async (p: PreachingPlace) => {
    await dbService.savePreachingPlace(p);
    await refreshData();
  };

  const handleDeletePlace = async (id: string) => {
    if (window.confirm('¿Desea dar de baja este lugar de salida?')) {
      await dbService.softDeletePreachingPlace(id);
      await refreshData();
    }
  };

  const handleSaveUser = async (u: UserProfile) => {
    await dbService.saveUserProfile(u);
    await refreshData();
  };

  const handleUpdatePrivileges = async (
    userId: string,
    updates: Partial<Pick<UserProfile, 'role' | 'canLeadPreaching' | 'canPublicPreaching' | 'active'>>
  ) => {
    await dbService.updateUserRoleAndPrivileges(userId, updates);
    await refreshData();
  };

  const handleExportWeeklyPdf = () => {
    if (!currentCongregation) return;
    const doc = PdfGenerator.generateWeeklyProgramPdf(currentCongregation, weeklyAssignments);
    doc.save(`Programa_Semanal_${currentCongregation.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100">
      {/* Barra de navegación superior */}
      <Navbar
        onOpenKmpModal={() => setShowKmpModal(true)}
        onOpenWizard={() => setShowWizard(true)}
      />

      {/* Contenedor Principal (ancho móvil optimizado para legibilidad compacta) */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5">
        {activeTab === 'inicio' && (
          <DashboardView
            nextWeekly={nextWeekly}
            nextPublic={nextPublic}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setMoreSubview('menu');
            }}
            onNavigateMoreSubview={(sub) => {
              setActiveTab('mas');
              setMoreSubview(sub);
            }}
            onGenerateWeeklyPdf={handleExportWeeklyPdf}
          />
        )}

        {activeTab === 'programa' && (
          <WeeklyProgramView
            assignments={weeklyAssignments}
            places={places}
            territories={territories}
            users={users}
            publicAssignments={publicAssignments}
            onSaveAssignment={handleSaveWeekly}
            onDeleteAssignment={handleDeleteWeekly}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarView
            weeklyAssignments={weeklyAssignments}
            publicAssignments={publicAssignments}
          />
        )}

        {activeTab === 'mas' && (
          <div>
            {moreSubview === 'menu' && (
              <div className="space-y-4 pb-20">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-800">Menú Administrativo</h2>
                  <p className="text-xs text-slate-500">Módulos de territorio, carritos y configuración</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
                  <button
                    onClick={() => setMoreSubview('territorios')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                        <Map className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Territorios</div>
                        <div className="text-xs text-slate-400">Polígonos, límites y estados</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </button>

                  <button
                    onClick={() => setMoreSubview('lugares')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Lugares de Salida</div>
                        <div className="text-xs text-slate-400">Salón del Reino y hogares</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </button>

                  <button
                    onClick={() => setMoreSubview('publica')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Predicación Pública</div>
                        <div className="text-xs text-slate-400">Exhibidores y hermanos fijos</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </button>

                  {isCoordinator && (
                    <button
                      onClick={() => setMoreSubview('publicadores')}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">Publicadores y Privilegios</div>
                          <div className="text-xs text-slate-400">Gestión de hermanos y permisos</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
                  )}

                  <button
                    onClick={() => setMoreSubview('configuracion')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                        <SettingsIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Configuración</div>
                        <div className="text-xs text-slate-400">Zona horaria, alertas y backups</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </button>
                </div>
              </div>
            )}

            {moreSubview !== 'menu' && (
              <div>
                <button
                  onClick={() => setMoreSubview('menu')}
                  className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al menú</span>
                </button>

                {moreSubview === 'territorios' && (
                  <TerritoriesView
                    territories={territories}
                    onSaveTerritory={handleSaveTerritory}
                    onDeleteTerritory={handleDeleteTerritory}
                  />
                )}

                {moreSubview === 'lugares' && (
                  <PlacesView
                    places={places}
                    onSavePlace={handleSavePlace}
                    onDeletePlace={handleDeletePlace}
                  />
                )}

                {moreSubview === 'publica' && (
                  <PublicPreachingView
                    places={publicPlaces}
                    assignments={publicAssignments}
                    users={users}
                    onSavePlace={handleSavePublicPlace}
                    onSaveAssignment={handleSavePublicAssignment}
                  />
                )}

                {moreSubview === 'publicadores' && (
                  <PublishersView
                    users={users}
                    onSaveUser={handleSaveUser}
                    onUpdatePrivileges={handleUpdatePrivileges}
                  />
                )}

                {moreSubview === 'configuracion' && <SettingsView />}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navegación inferior (Bottom Navigation) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(t) => {
          setActiveTab(t);
          if (t !== 'mas') {
            setMoreSubview('menu');
          }
        }}
      />

      {/* Modal de Arquitectura Kotlin Multiplatform */}
      {showKmpModal && (
        <KmpArchitectureModal onClose={() => setShowKmpModal(false)} />
      )}

      {/* Asistente de primera ejecución */}
      {showWizard && (
        <FirstRunWizard onComplete={() => setShowWizard(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CongregationProvider>
        <MainApp />
      </CongregationProvider>
    </AuthProvider>
  );
}
