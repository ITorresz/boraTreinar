import React from 'react';
import { Calendar, Users, AlertCircle, Settings } from 'lucide-react';

export type NavTab = 'agenda' | 'clients' | 'financial' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  overdueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  overdueCount,
}) => {
  const tabs = [
    {
      id: 'agenda' as NavTab,
      label: 'Agenda',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'clients' as NavTab,
      label: 'Alunos',
      icon: Users,
      badge: null,
    },
    {
      id: 'financial' as NavTab,
      label: 'Inadimplência',
      icon: AlertCircle,
      badge: overdueCount > 0 ? overdueCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'settings' as NavTab,
      label: 'Ajustes',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] px-3 py-2 shadow-2xl safe-area-bottom no-print">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl transition-all duration-150 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50/70 dark:bg-emerald-950/40'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-[18px] text-[11px] font-black rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 leading-tight tracking-tight ${isActive ? 'font-black' : 'font-semibold'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
