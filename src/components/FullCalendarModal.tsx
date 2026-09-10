import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  CalendarDays,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Appointment, Client } from '../types';
import { formatDateBR, getTodayDateString, getDayOfWeekName } from '../utils/dateUtils';

interface FullCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  appointments: Appointment[];
  clients?: Client[];
  onEditAppointment?: (appt: Appointment) => void;
  onAddNewAppointment?: (date: string) => void;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const FullCalendarModal: React.FC<FullCalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  appointments = [],
  clients = [],
  onEditAppointment,
  onAddNewAppointment,
}) => {
  const today = getTodayDateString();
  const safeDate = selectedDate || today;

  const [activeDate, setActiveDate] = useState<string>(safeDate);

  const getInitialYear = () => {
    const parts = (selectedDate || today).split('-').map(Number);
    return parts[0] || new Date().getFullYear();
  };

  const getInitialMonth = () => {
    const parts = (selectedDate || today).split('-').map(Number);
    const m = parts[1] || 1;
    return m - 1;
  };

  const [currentYear, setCurrentYear] = useState<number>(getInitialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(getInitialMonth);

  useEffect(() => {
    if (isOpen) {
      const base = selectedDate || today;
      setActiveDate(base);
      const parts = base.split('-').map(Number);
      if (parts[0]) setCurrentYear(parts[0]);
      if (parts[1]) setCurrentMonth(parts[1] - 1);
    }
  }, [isOpen, selectedDate, today]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setActiveDate(today);
    const parts = today.split('-').map(Number);
    if (parts[0]) setCurrentYear(parts[0]);
    if (parts[1]) setCurrentMonth(parts[1] - 1);
  };

  // Cálculos do calendário
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthAppointments = appointments.filter((a) => {
    if (!a.date) return false;
    const parts = a.date.split('-').map(Number);
    return parts[0] === currentYear && parts[1] === currentMonth + 1;
  });

  const selectedDayAppointments = appointments
    .filter((a) => a.date === activeDate)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const handleDaySelect = (dayNum: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    const fullDate = `${currentYear}-${m}-${d}`;
    setActiveDate(fullDate);
  };

  const handleConfirmAndGoToDay = (dateToOpen: string) => {
    onSelectDate(dateToOpen);
    onClose();
  };

  const handleEditClass = (appt: Appointment) => {
    if (onEditAppointment) {
      onClose();
      onEditAppointment(appt);
    }
  };

  const handleAddClassOnDay = () => {
    if (onAddNewAppointment) {
      onClose();
      onAddNewAppointment(activeDate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header do Calendário */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Visão Geral das Aulas no Calendário
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-normal">
                Selecione uma data para ver e alterar aulas daquele dia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {/* Navegação do Mês */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {monthAppointments.length} {monthAppointments.length === 1 ? 'aula' : 'aulas'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleGoToToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 transition mr-1"
              >
                Hoje
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-xs font-semibold uppercase text-[var(--text-muted)] py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Grade de dias do mês */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="p-2 text-center text-xs text-[var(--text-muted)]/40 font-medium select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const day = i + 1;
              const m = String(currentMonth + 1).padStart(2, '0');
              const d = String(day).padStart(2, '0');
              const dateStr = `${currentYear}-${m}-${d}`;
              const isSelected = activeDate === dateStr;
              const isToday = today === dateStr;
              const apptsOnDay = appointments.filter((a) => a.date === dateStr);
              const count = apptsOnDay.length;
              const hasCancelled = apptsOnDay.some((a) => a.status === 'cancelled');
              const hasRescheduled = apptsOnDay.some((a) => a.status === 'rescheduled');

              let badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200';
              if (hasCancelled) {
                badgeBg = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200';
              } else if (hasRescheduled) {
                badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200';
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDaySelect(day)}
                  className={`relative p-1.5 sm:p-2 rounded-2xl flex flex-col items-center justify-between transition-all duration-150 min-h-[50px] sm:min-h-[54px] border ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm scale-102 z-10'
                      : isToday
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border-emerald-400 dark:border-emerald-700'
                      : hasCancelled
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-[var(--text-primary)] font-medium'
                      : hasRescheduled
                      ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-[var(--text-primary)] font-medium'
                      : 'border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-primary)] font-medium'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-semibold">{day}</span>

                  {count > 0 ? (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                        isSelected
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : badgeBg
                      }`}
                    >
                      {count} {count === 1 ? 'aula' : 'aulas'}
                    </span>
                  ) : (
                    <span className="h-3" />
                  )}
                </button>
              );
            })}
          </div>

          {/* PAINEL DO DIA SELECIONADO: AULAS E ALTERAÇÃO DE HORÁRIOS */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
                  Aulas de {getDayOfWeekName(activeDate)}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  {formatDateBR(activeDate)}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddClassOnDay}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition"
                  title="Adicionar aula nesta data"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Aula</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmAndGoToDay(activeDate)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs transition"
                  title="Abrir este dia na tela principal da agenda"
                >
                  <span>Abrir Dia</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Lista das aulas deste dia */}
            {selectedDayAppointments.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-[var(--bg-muted)] text-center text-xs text-[var(--text-secondary)] font-normal">
                Nenhuma aula agendada para {formatDateBR(activeDate)}. Toque em "+ Nova Aula" para agendar.
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  Toque em <strong>"Alterar / Remarcar"</strong> para mudar o horário desta aula:
                </p>
                {selectedDayAppointments.map((appt) => {
                  const client = clients.find((c) => c.id === appt.clientId);
                  const isCancelled = appt.status === 'cancelled';
                  const isRescheduled = appt.status === 'rescheduled';

                  const itemClass = isCancelled
                    ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/60 dark:bg-rose-950/20'
                    : isRescheduled
                    ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/60 dark:bg-amber-950/20'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]';

                  return (
                    <div
                      key={appt.id}
                      className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2 shadow-xs ${itemClass}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : isRescheduled
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100/70 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs sm:text-sm font-bold ${
                              isCancelled ? 'line-through text-rose-600' : 'text-[var(--text-primary)]'
                            }`}>
                              {appt.time}
                            </span>
                            {isCancelled && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                                Desmarcada / Remarcada
                              </span>
                            )}
                            {isRescheduled && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                Reagendada
                              </span>
                            )}
                            <span className="text-xs text-[var(--text-muted)] font-normal">
                              ({appt.durationMinutes} min)
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[var(--text-secondary)] truncate">
                            {client ? client.name : 'Aluno'} - {appt.serviceType || 'Treino'}
                          </p>
                          {appt.notes && (
                            <p className="text-[10px] text-[var(--text-muted)] truncate">
                              {appt.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditClass(appt)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs shrink-0"
                          title="Alterar ou remarcar este horário"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Alterar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => handleConfirmAndGoToDay(activeDate)}
            className="py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs transition flex items-center gap-1.5"
          >
            <span>Ver {formatDateBR(activeDate)} na Agenda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
