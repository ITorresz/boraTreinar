import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  MessageCircle,
  Activity,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { Appointment, Client, Plan, PersonalSettings } from '../types';
import {
  formatDateBR,
  getDayOfWeekName,
  getShortDayOfWeek,
  getWeekDates,
  getTodayDateString,
} from '../utils/dateUtils';
import {
  computeClientPaymentStatus,
  generateWhatsAppCobrançaUrl,
  generateWhatsAppReminderUrl,
} from '../utils/statusUtils';
import { FullCalendarModal } from './FullCalendarModal';

interface AgendaViewProps {
  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  appointments: Appointment[];
  clients: Client[];
  plans: Plan[];
  settings: PersonalSettings;
  onAddAppointment: (date?: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onToggleStatus: (appointmentId: string) => void;
  onOpenPaymentModal: (client: Client) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  selectedDate: externalSelectedDate,
  setSelectedDate: externalSetSelectedDate,
  appointments,
  clients,
  plans,
  settings,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onToggleStatus,
  onOpenPaymentModal,
}) => {
  const today = getTodayDateString();

  // Se o componente pai fornecer selectedDate e setSelectedDate, usa-os; caso contrário, usa estado interno
  const [internalDate, setInternalDate] = useState<string>(today);
  const selectedDate = externalSelectedDate !== undefined ? externalSelectedDate : internalDate;
  const setSelectedDate = externalSetSelectedDate !== undefined ? externalSetSelectedDate : setInternalDate;

  // Modal de Calendário Completo
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Calcular os 7 dias da semana baseado na data selecionada
  const weekDates = getWeekDates(selectedDate || today);

  // Navegação semanal
  const handlePrevWeek = () => {
    const parts = (selectedDate || today).split('-').map(Number);
    const y = parts[0] || 2026;
    const m = parts[1] || 1;
    const d = parts[2] || 1;
    const prevDate = new Date(y, m - 1, d);
    prevDate.setDate(prevDate.getDate() - 7);
    const newY = prevDate.getFullYear();
    const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
    const newD = String(prevDate.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextWeek = () => {
    const parts = (selectedDate || today).split('-').map(Number);
    const y = parts[0] || 2026;
    const m = parts[1] || 1;
    const d = parts[2] || 1;
    const nextDate = new Date(y, m - 1, d);
    nextDate.setDate(nextDate.getDate() + 7);
    const newY = nextDate.getFullYear();
    const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
    const newD = String(nextDate.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleGoToToday = () => {
    setSelectedDate(today);
  };

  // Filtrar treinos do dia selecionado e ordenar por horário
  const safeSelectedDate = selectedDate || today;
  const dayAppointments = appointments
    .filter((a) => a.date === safeSelectedDate)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const completedCount = dayAppointments.filter((a) => a.status === 'completed').length;
  const totalCount = dayAppointments.length;

  return (
    <div className="space-y-4 pb-28">
      {/* Header do Calendário Semanal */}
      <div className="bg-[var(--bg-card)] rounded-3xl p-4 sm:p-5 border border-[var(--border-subtle)] shadow-xs">
        <div className="flex items-center justify-between mb-4 gap-2">
          {/* Botão para Abrir Calendário Completo */}
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className="flex items-center gap-3 p-1 -ml-1 rounded-2xl hover:bg-[var(--bg-muted)] transition group text-left cursor-pointer"
            title="Abrir calendário mensal completo"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[var(--text-primary)] capitalize group-hover:text-emerald-600 transition-colors">
                  {getDayOfWeekName(safeSelectedDate)}, {formatDateBR(safeSelectedDate)}
                </span>
                {safeSelectedDate === today && (
                  <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Hoje
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-normal mt-0.5">
                Ver calendário completo
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
            {safeSelectedDate !== today && (
              <button
                onClick={handleGoToToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition mr-1"
              >
                Hoje
              </button>
            )}
            <button
              onClick={handlePrevWeek}
              className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition"
              title="Próxima semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linha dos Dias da Semana */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekDates.map((dateStr) => {
            const isSelected = safeSelectedDate === dateStr;
            const isToday = today === dateStr;
            const parts = dateStr ? dateStr.split('-') : [];
            const dayNum = parts[2] || '';
            const dayShort = getShortDayOfWeek(dateStr);
            const apptsOnThisDay = appointments.filter((a) => a.date === dateStr).length;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center py-2 px-1 rounded-2xl transition duration-150 relative ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : isToday
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] font-medium'
                }`}
              >
                <span className="text-xs tracking-tight uppercase">{dayShort}</span>
                <span className="text-sm sm:text-base font-bold mt-0.5">{dayNum}</span>
                {apptsOnThisDay > 0 && (
                  <span
                    className={`mt-1.5 w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-emerald-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de Status do Dia & Botão Novo Treino */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Horários Agendados
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-normal">
            {totalCount === 0
              ? 'Nenhum treino agendado'
              : `${totalCount} ${totalCount === 1 ? 'treino' : 'treinos'} (${completedCount} concluídos)`}
          </p>
        </div>

        <button
          id="agenda-add-btn"
          onClick={() => onAddAppointment(safeSelectedDate)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Treino</span>
        </button>
      </div>

      {/* Lista de Agendamentos */}
      {dayAppointments.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-3xl p-8 sm:p-12 text-center border border-[var(--border-subtle)] shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[var(--text-primary)]">
            Nenhum treino marcado para este dia
          </h4>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xs mx-auto mt-1 mb-4 font-normal">
            Toque abaixo para agendar horários com seus alunos para este dia.
          </p>
          <button
            onClick={() => onAddAppointment(safeSelectedDate)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Treino para {formatDateBR(safeSelectedDate)}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dayAppointments.map((appt) => {
            const client = clients.find((c) => c.id === appt.clientId);
            const plan = plans.find((p) => p.id === (client?.planId || appt.planId));
            const isCompleted = appt.status === 'completed';

            // Cálculo do status financeiro automático
            const paymentStatus = client
              ? computeClientPaymentStatus(client, settings.warningDaysBeforeDue)
              : null;

            return (
              <div
                key={appt.id}
                className={`bg-[var(--bg-card)] rounded-2xl p-4 sm:p-4.5 border transition-all duration-150 ${
                  isCompleted
                    ? 'border-[var(--border-subtle)] opacity-75 bg-[var(--bg-muted)]/30'
                    : 'border-[var(--border-subtle)] hover:border-emerald-500/40 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Horário e Status */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleStatus(appt.id)}
                      className="p-1 text-[var(--text-muted)] hover:text-emerald-600 transition shrink-0"
                      title={isCompleted ? 'Desmarcar concluído' : 'Marcar como concluído'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5 text-[var(--text-muted)] stroke-[1.5]" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-bold tracking-tight ${
                            isCompleted
                              ? 'line-through text-[var(--text-muted)]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {appt.time}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-normal">
                          <Clock className="w-3.5 h-3.5" />
                          {appt.durationMinutes} min
                        </span>
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-semibold ${
                          isCompleted
                            ? 'line-through text-[var(--text-secondary)]'
                            : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {client ? client.name : 'Aluno Removido'}
                      </h4>
                    </div>
                  </div>

                  {/* Badges de Plano e Opções */}
                  <div className="flex items-center gap-1">
                    {plan && (
                      <span className="text-xs font-normal px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] border border-[var(--border-subtle)] truncate max-w-[130px]">
                        {plan.name}
                      </span>
                    )}

                    <button
                      onClick={() => onEditAppointment(appt)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition"
                      title="Editar horário"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAppointment(appt.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Excluir horário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Linha do Serviço e Local */}
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-[var(--text-secondary)]">
                  {appt.serviceType && (
                    <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                      <Activity className="w-3.5 h-3.5" />
                      {appt.serviceType}
                    </span>
                  )}
                  {appt.location && (
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)] font-normal">
                      <MapPin className="w-3.5 h-3.5" />
                      {appt.location}
                    </span>
                  )}
                </div>

                {/* Informações do Pagamento / Vencimento do Aluno */}
                {client && paymentStatus && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                    {/* Badge de status do pagamento */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${paymentStatus.badgeClass}`}
                      >
                        {paymentStatus.status === 'overdue' && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                        <span>{paymentStatus.label}</span>
                      </span>

                      {paymentStatus.status === 'overdue' && (
                        <a
                          href={generateWhatsAppCobrançaUrl(client, plan, settings)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
                          title="Enviar lembrete de cobrança via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Cobrar WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botão de Enviar Lembrete da Aula */}
                      <a
                        href={generateWhatsAppReminderUrl(client, appt, settings)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition font-medium"
                        title="Enviar confirmação de aula por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Lembrar Treino</span>
                      </a>

                      {paymentStatus.status === 'overdue' && (
                        <button
                          onClick={() => onOpenPaymentModal(client)}
                          className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium px-2.5 py-1 rounded-lg transition"
                        >
                          Dar Baixa
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal do Calendário Completo para ver e alterar aulas de qualquer dia */}
      <FullCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDate={safeSelectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
        appointments={appointments}
        clients={clients}
        onEditAppointment={(appt) => onEditAppointment(appt)}
        onAddNewAppointment={(newDate) => onAddAppointment(newDate)}
      />
    </div>
  );
};
