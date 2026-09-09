import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Appointment, Client, Plan } from '../types';
import { formatDateBR, getTodayDateString } from '../utils/dateUtils';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Partial<Appointment>) => void;
  onSaveMultiple?: (appointments: Appointment[]) => void;
  appointmentToEdit: Appointment | null;
  clients: Client[];
  plans: Plan[];
  selectedDate?: string;
  appointments?: Appointment[];
}

const WEEK_DAYS = [
  { id: 1, name: 'Segunda', short: 'Seg' },
  { id: 2, name: 'Terça', short: 'Ter' },
  { id: 3, name: 'Quarta', short: 'Qua' },
  { id: 4, name: 'Quinta', short: 'Qui' },
  { id: 5, name: 'Sexta', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
  { id: 0, name: 'Domingo', short: 'Dom' },
];

const PRESETS = [
  { label: 'Seg / Qua / Sex (3x)', days: [1, 3, 5] },
  { label: 'Ter / Qui (2x)', days: [2, 4] },
  { label: 'Seg a Sex (5x)', days: [1, 2, 3, 4, 5] },
  { label: 'Seg a Sáb (6x)', days: [1, 2, 3, 4, 5, 6] },
];

const SERVICE_TYPES = [
  'Musculação & Hipertrofia',
  'Emagrecimento & Funcional',
  'Treino em Casa / Online',
  'Corrida & Condicionamento',
  'Mobilidade & Reabilitação',
  'Avaliação Física',
];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveMultiple,
  appointmentToEdit,
  clients,
  plans,
  selectedDate,
  appointments = [],
}) => {
  const today = getTodayDateString();

  // Dados básicos do treino
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState<string>(selectedDate || today);
  const [time, setTime] = useState('08:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [serviceType, setServiceType] = useState('Musculação & Hipertrofia');
  const [location, setLocation] = useState('Academia');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled');
  const [notes, setNotes] = useState('');

  // Mensagem de bloqueio / erro em tela
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modo de Agendamento: 'month' (todo o mês junto) ou 'single' (aula avulsa)
  const [schedulingMode, setSchedulingMode] = useState<'month' | 'single'>('month');

  // Dias da semana selecionados (ex: Seg=1, Qua=3, Sex=5)
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([1, 3, 5]);

  // Opção de mesmo horário para todos os dias
  const [sameTimeForAllDays, setSameTimeForAllDays] = useState(true);
  const [customDayTimes, setCustomDayTimes] = useState<{ [dayIndex: number]: string }>({
    1: '08:00',
    2: '08:00',
    3: '08:00',
    4: '08:00',
    5: '08:00',
    6: '08:00',
    0: '08:00',
  });

  // Período: 'current_month' (Mês Completo atual) | 'next_month' | '30_days'
  const [periodType, setPeriodType] = useState<'current_month' | 'next_month' | '30_days'>('current_month');

  // Inicialização ao abrir modal ou editar
  useEffect(() => {
    setErrorMessage(null);
    if (appointmentToEdit) {
      setClientId(appointmentToEdit.clientId || '');
      setDate(appointmentToEdit.date || today);
      setTime(appointmentToEdit.time || '08:00');
      setDurationMinutes(appointmentToEdit.durationMinutes || 60);
      setServiceType(appointmentToEdit.serviceType || 'Musculação & Hipertrofia');
      setLocation(appointmentToEdit.location || 'Academia');
      setStatus(appointmentToEdit.status || 'scheduled');
      setNotes(appointmentToEdit.notes || '');
      setSchedulingMode('single'); // Edição de aula individual
    } else {
      const baseDate = selectedDate || today;
      setDate(baseDate);
      setTime('08:00');
      setDurationMinutes(60);
      setServiceType('Musculação & Hipertrofia');
      setLocation('Academia');
      setStatus('scheduled');
      setNotes('');
      setSchedulingMode('month'); // Padrão: agendar o mês todo de uma vez!
      setSameTimeForAllDays(true);

      // Pré-seleciona primeiro aluno se houver
      if (clients.length > 0 && !clientId) {
        setClientId(clients[0].id);
      }
    }
  }, [appointmentToEdit, isOpen, selectedDate, clients]);

  // Limpa erro ao mudar campos principais
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (errorMessage) setErrorMessage(null);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (errorMessage) setErrorMessage(null);
  };

  // Atualiza dias sugeridos de acordo com o plano do aluno escolhido
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    if (errorMessage) setErrorMessage(null);
    const client = clients.find((c) => c.id === newClientId);
    if (client) {
      const plan = plans.find((p) => p.id === client.planId);
      if (plan) {
        if (plan.daysPerWeek === 2) setSelectedWeekDays([2, 4]);
        else if (plan.daysPerWeek === 3) setSelectedWeekDays([1, 3, 5]);
        else if (plan.daysPerWeek === 5) setSelectedWeekDays([1, 2, 3, 4, 5]);
        else if (plan.daysPerWeek === 6) setSelectedWeekDays([1, 2, 3, 4, 5, 6]);
      }
    }
  };

  const toggleWeekDay = (dayId: number) => {
    if (errorMessage) setErrorMessage(null);
    setSelectedWeekDays((prev) => {
      if (prev.includes(dayId)) {
        return prev.filter((d) => d !== dayId);
      } else {
        return [...prev, dayId].sort();
      }
    });
  };

  const handleCustomTimeChange = (dayId: number, newTime: string) => {
    if (errorMessage) setErrorMessage(null);
    setCustomDayTimes((prev) => ({
      ...prev,
      [dayId]: newTime,
    }));
  };

  const handleApplyPreset = (days: number[]) => {
    if (errorMessage) setErrorMessage(null);
    setSelectedWeekDays(days);
  };

  const safeDate = date || today;

  // Cálculo das datas das aulas que serão geradas para todo o mês
  const generatedDatesPreview = useMemo(() => {
    if (schedulingMode === 'single' || selectedWeekDays.length === 0) {
      return [safeDate];
    }

    const parts = safeDate.split('-').map(Number);
    const refY = parts[0] || 2026;
    const refM = parts[1] || 1;
    const refD = parts[2] || 1;
    const targetDates: string[] = [];

    if (periodType === 'current_month') {
      // Mês completo do dia 1 ao último dia do mês
      const daysInMonth = new Date(refY, refM, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const checkDate = new Date(refY, refM - 1, day);
        if (selectedWeekDays.includes(checkDate.getDay())) {
          const mStr = String(refM).padStart(2, '0');
          const dStr = String(day).padStart(2, '0');
          targetDates.push(`${refY}-${mStr}-${dStr}`);
        }
      }
    } else if (periodType === 'next_month') {
      // Próximo mês completo
      const nextDate = new Date(refY, refM, 1);
      const nextY = nextDate.getFullYear();
      const nextM = nextDate.getMonth() + 1;
      const daysInMonth = new Date(nextY, nextM, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const checkDate = new Date(nextY, nextM - 1, day);
        if (selectedWeekDays.includes(checkDate.getDay())) {
          const mStr = String(nextM).padStart(2, '0');
          const dStr = String(day).padStart(2, '0');
          targetDates.push(`${nextY}-${mStr}-${dStr}`);
        }
      }
    } else {
      // Próximos 30 dias a partir da data de início
      const startDate = new Date(refY, refM - 1, refD);
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(startDate.getDate() + i);
        if (selectedWeekDays.includes(checkDate.getDay())) {
          const yStr = checkDate.getFullYear();
          const mStr = String(checkDate.getMonth() + 1).padStart(2, '0');
          const dStr = String(checkDate.getDate()).padStart(2, '0');
          targetDates.push(`${yStr}-${mStr}-${dStr}`);
        }
      }
    }

    return targetDates;
  }, [schedulingMode, selectedWeekDays, safeDate, periodType]);

  const selectedClient = clients.find((c) => c.id === clientId);
  const parts = safeDate.split('-').map(Number);
  const currentMonthNum = parts[1] || 1;
  const currentMonthName = MONTH_NAMES[currentMonthNum - 1] || '';

  // FUNÇÃO DE VERIFICAÇÃO DE HORÁRIO EXISTENTE / BLOQUEIO
  const findExistingAppointment = (targetDate: string, targetTime: string): Appointment | undefined => {
    return appointments.find((a) => {
      if (appointmentToEdit && a.id === appointmentToEdit.id) return false;
      if (a.status === 'cancelled') return false;
      return a.date === targetDate && a.time === targetTime;
    });
  };

  // Conflito em tempo real para aula individual ou edição
  const singleConflict = useMemo(() => {
    if (schedulingMode === 'single' || appointmentToEdit) {
      return findExistingAppointment(safeDate, time);
    }
    return null;
  }, [schedulingMode, appointmentToEdit, safeDate, time, appointments]);

  // Conflitos em lote para o modo Todo o Mês
  const monthConflicts = useMemo(() => {
    if (schedulingMode !== 'month' || appointmentToEdit) return [];
    const conflicts: { date: string; time: string; existingAppt: Appointment }[] = [];

    generatedDatesPreview.forEach((dateStr) => {
      const p = dateStr.split('-').map(Number);
      const y = p[0] || 2026;
      const m = p[1] || 1;
      const d = p[2] || 1;
      const dayOfWeek = new Date(y, m - 1, d).getDay();
      const apptTime = sameTimeForAllDays ? time : customDayTimes[dayOfWeek] || time;
      const existing = findExistingAppointment(dateStr, apptTime);
      if (existing) {
        conflicts.push({ date: dateStr, time: apptTime, existingAppt: existing });
      }
    });

    return conflicts;
  }, [schedulingMode, appointmentToEdit, generatedDatesPreview, sameTimeForAllDays, time, customDayTimes, appointments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setErrorMessage('Por favor, selecione um aluno para agendar o treino.');
      return;
    }

    // CASO 1: EDIÇÃO DE AULA EXISTENTE (ALTERAR HORÁRIO/DATA)
    if (appointmentToEdit) {
      // VERIFICAÇÃO DE BLOQUEIO
      const conflict = findExistingAppointment(safeDate, time);
      if (conflict) {
        const otherClient = clients.find((c) => c.id === conflict.clientId);
        const name = otherClient ? otherClient.name : 'outro aluno';
        setErrorMessage(
          `Horário Bloqueado: Já existe um treino marcado no dia ${formatDateBR(safeDate)} às ${time} com o aluno ${name}. Por favor, escolha outro horário ou dia.`
        );
        return; // BLOQUEIA O SALVAMENTO!
      }

      onSave({
        id: appointmentToEdit.id,
        clientId,
        date: safeDate,
        time,
        durationMinutes: Number(durationMinutes),
        planId: selectedClient?.planId || appointmentToEdit.planId,
        serviceType,
        location,
        status,
        notes,
        recurrenceGroupId: appointmentToEdit.recurrenceGroupId,
      });
      onClose();
      return;
    }

    // CASO 2: AGENDAR PARA TODO O MÊS (TODAS AS AULAS JUNTAS)
    if (schedulingMode === 'month' && onSaveMultiple) {
      if (selectedWeekDays.length === 0) {
        setErrorMessage('Selecione pelo menos 1 dia da semana para agendar a rotina.');
        return;
      }

      // VERIFICAÇÃO DE BLOQUEIO EM LOTE
      if (monthConflicts.length > 0) {
        const conflictDetails = monthConflicts
          .slice(0, 3)
          .map((c) => {
            const cl = clients.find((client) => client.id === c.existingAppt.clientId);
            return `${formatDateBR(c.date)} às ${c.time} (${cl ? cl.name : 'Aluno'})`;
          })
          .join('; ');
        const extra = monthConflicts.length > 3 ? ` e mais ${monthConflicts.length - 3} horário(s)` : '';

        setErrorMessage(
          `Horário Bloqueado: Não é possível salvar todo o mês pois já existem treinos marcados nos seguintes horários: ${conflictDetails}${extra}. Ajuste os horários ou libere a agenda antes de salvar.`
        );
        return; // BLOQUEIA O SALVAMENTO!
      }

      const recurrenceGroupId = `group-${Date.now()}`;
      const apptsToCreate: Appointment[] = generatedDatesPreview.map((dateStr, idx) => {
        const p = dateStr.split('-').map(Number);
        const y = p[0] || 2026;
        const m = p[1] || 1;
        const d = p[2] || 1;
        const dayOfWeek = new Date(y, m - 1, d).getDay();
        const apptTime = sameTimeForAllDays ? time : customDayTimes[dayOfWeek] || time;

        return {
          id: `appt-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          clientId,
          date: dateStr,
          time: apptTime,
          durationMinutes: Number(durationMinutes),
          planId: selectedClient?.planId,
          serviceType,
          location,
          status: 'scheduled',
          notes,
          recurrenceGroupId,
        };
      });

      onSaveMultiple(apptsToCreate);
      onClose();
      return;
    }

    // CASO 3: AULA AVULSA INDIVIDUAL
    const conflict = findExistingAppointment(safeDate, time);
    if (conflict) {
      const otherClient = clients.find((c) => c.id === conflict.clientId);
      const name = otherClient ? otherClient.name : 'outro aluno';
      setErrorMessage(
        `Horário Bloqueado: Já existe um treino marcado no dia ${formatDateBR(safeDate)} às ${time} com o aluno ${name}. Por favor, escolha outro horário ou dia.`
      );
      return; // BLOQUEIA O SALVAMENTO!
    }

    onSave({
      id: `appt-${Date.now()}`,
      clientId,
      date: safeDate,
      time,
      durationMinutes: Number(durationMinutes),
      planId: selectedClient?.planId,
      serviceType,
      location,
      status,
      notes,
    });
    onClose();
  };

  if (!isOpen) return null;

  const conflictClient = singleConflict ? clients.find((c) => c.id === singleConflict.clientId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-xl bg-[var(--bg-surface)] rounded-t-3xl sm:rounded-3xl border border-[var(--border-subtle)] shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-[var(--border-subtle)] flex items-center justify-between sticky top-0 bg-[var(--bg-surface)] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              {appointmentToEdit ? <Clock className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {appointmentToEdit ? 'Alterar Horário do Treino' : 'Agendar Aulas'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-normal">
                {appointmentToEdit
                  ? 'Modifique o dia ou horário desta aula'
                  : 'Agende as aulas na rotina do aluno'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* MENSAGEM DE ERRO / BLOQUEIO EM TELA */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-shake">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-900 dark:text-rose-100">
                  Horário já marcado!
                </p>
                <p className="mt-0.5 font-normal leading-relaxed text-xs sm:text-sm">
                  {errorMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900 transition shrink-0"
                title="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 1. Seleção do Aluno */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-1.5">
              Aluno *
            </label>
            {clients.length === 0 ? (
              <p className="text-xs text-rose-600 dark:text-rose-400 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 font-semibold">
                Nenhum aluno cadastrado. Adicione um aluno primeiro na aba Alunos.
              </p>
            ) : (
              <select
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="">Selecione o aluno...</option>
                {clients.map((c) => {
                  const plan = plans.find((p) => p.id === c.planId);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} {plan ? `(${plan.name} - ${plan.daysPerWeek}x/sem)` : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* 2. Seleção de Modo: Todo o Mês vs Aula Avulsa */}
          {!appointmentToEdit && (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setSchedulingMode('month');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition ${
                  schedulingMode === 'month'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Todo o Mês (Juntas)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchedulingMode('single');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition ${
                  schedulingMode === 'single'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>1 Aula Avulsa</span>
              </button>
            </div>
          )}

          {/* 3. Seleção dos Dias da Semana */}
          {!appointmentToEdit && schedulingMode === 'month' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>Dias de treino na semana</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-semibold">
                      {selectedWeekDays.length}x na semana
                    </span>
                  </h3>
                </div>
              </div>

              {/* Botões dos dias da semana */}
              <div className="grid grid-cols-7 gap-1">
                {WEEK_DAYS.map((dw) => {
                  const isSelected = selectedWeekDays.includes(dw.id);
                  return (
                    <button
                      type="button"
                      key={dw.id}
                      onClick={() => toggleWeekDay(dw.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold transition flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                      }`}
                    >
                      <span>{dw.short}</span>
                    </button>
                  );
                })}
              </div>

              {/* Atalhos Rápidos */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="text-[11px] font-medium text-[var(--text-muted)] self-center mr-1">
                  Atalhos:
                </span>
                {PRESETS.map((pr, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleApplyPreset(pr.days)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-500 transition"
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Configuração de Horários */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Horário do Treino</span>
              </label>

              {!appointmentToEdit && schedulingMode === 'month' && selectedWeekDays.length > 1 && (
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-muted)] px-2 py-0.5 rounded-lg">
                  <input
                    type="checkbox"
                    checked={sameTimeForAllDays}
                    onChange={(e) => {
                      setSameTimeForAllDays(e.target.checked);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Mesmo horário todos os dias</span>
                </label>
              )}
            </div>

            {/* Horário único para a aula ou todos os dias */}
            {(sameTimeForAllDays || appointmentToEdit || schedulingMode === 'single') && (
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Horário da Aula
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      required
                      className={`w-full px-3 py-2 rounded-xl border text-sm font-semibold transition focus:outline-none ${
                        singleConflict
                          ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Duração
                    </label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
                    >
                      <option value={30}>30 minutos</option>
                      <option value={45}>45 minutos</option>
                      <option value={60}>60 minutos (1h)</option>
                      <option value={75}>75 minutos</option>
                      <option value={90}>90 minutos</option>
                    </select>
                  </div>
                </div>

                {/* Aviso inline se o horário individual estiver ocupado */}
                {singleConflict && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-xl border border-rose-200 dark:border-rose-900">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>
                      Horário já ocupado: há treino marcado com {conflictClient ? conflictClient.name : 'outro aluno'} às {time}.
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Horários diferentes por dia */}
            {!appointmentToEdit && schedulingMode === 'month' && !sameTimeForAllDays && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-[var(--text-secondary)] font-normal">
                  Defina o horário para cada dia selecionado:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedWeekDays.map((dwId) => {
                    const dw = WEEK_DAYS.find((d) => d.id === dwId);
                    return (
                      <div
                        key={dwId}
                        className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                      >
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {dw?.name}:
                        </span>
                        <input
                          type="time"
                          value={customDayTimes[dwId] || '08:00'}
                          onChange={(e) => handleCustomTimeChange(dwId, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Período / Data */}
          {!appointmentToEdit && schedulingMode === 'month' ? (
            <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2.5">
              <label className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Período das Aulas</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPeriodType('current_month');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-xs font-semibold border transition text-center ${
                    periodType === 'current_month'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  Mês de {currentMonthName}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPeriodType('next_month');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-xs font-semibold border transition text-center ${
                    periodType === 'next_month'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  Próximo Mês
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPeriodType('30_days');
                    setErrorMessage(null);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-xs font-semibold border transition text-center ${
                    periodType === '30_days'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  Próximos 30 dias
                </button>
              </div>

              {/* Resumo do lote */}
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                    Total de aulas a serem criadas:
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-normal">
                    Adicionadas na rotina do aluno
                  </span>
                </div>
                <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                  {generatedDatesPreview.length} aulas
                </span>
              </div>

              {/* Aviso se houver conflitos no lote do mês */}
              {monthConflicts.length > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Conflito: {monthConflicts.length} horário(s) já ocupado(s)</span>
                  </div>
                  <p className="text-[11px] font-normal leading-tight">
                    Alguns dias selecionados já possuem treinos agendados nesse mesmo horário.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Data da Aula
              </label>
              <input
                type="date"
                value={safeDate}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}

          {/* 6. Tipo de Treino e Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Tipo de Treino
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
              >
                {SERVICE_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Local
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Smart Fit, Condomínio..."
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 ${
                singleConflict || monthConflicts.length > 0
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {appointmentToEdit
                  ? 'Salvar Alteração'
                  : schedulingMode === 'month'
                  ? `Adicionar ${generatedDatesPreview.length} Aulas`
                  : 'Salvar Aula'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
