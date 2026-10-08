import React from 'react';
import { Home, Calendar, CalendarDays, MoreHorizontal } from 'lucide-react';

export type TabType = 'inicio' | 'programa' | 'calendario' | 'mas';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'inicio' as TabType, label: 'Inicio', icon: Home },
    { id: 'programa' as TabType, label: 'Programa', icon: Calendar },
    { id: 'calendario' as TabType, label: 'Calendario', icon: CalendarDays },
    { id: 'mas' as TabType, label: 'Más', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-transform ${
                  isActive ? 'bg-blue-50 text-blue-700 scale-110' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
