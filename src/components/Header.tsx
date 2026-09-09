import React from 'react';
import { Dumbbell, Moon, Sun, AlertTriangle, User } from 'lucide-react';
import { PersonalSettings } from '../types';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  settings: PersonalSettings;
  overdueCount: number;
  onNavigateToInadimplencia: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  settings,
  overdueCount,
  onNavigateToInadimplencia,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 sm:px-6 py-3 shadow-xs transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                BoraTreinar
              </h1>
              <span className="text-[11px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PRO
              </span>
            </div>
            <p className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5 truncate max-w-[170px] sm:max-w-[260px] mt-0.5">
              <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{settings.trainerName || 'Meu Painel'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <button
              id="header-overdue-alert-btn"
              onClick={onNavigateToInadimplencia}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold transition hover:bg-rose-100"
              title="Ver clientes inadimplentes"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{overdueCount} {overdueCount === 1 ? 'atraso' : 'atrasos'}</span>
            </button>
          )}

          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition border border-[var(--border-subtle)]"
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            aria-label="Trocar Tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
