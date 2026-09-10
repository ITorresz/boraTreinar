import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { AgendaView } from './components/AgendaView';
import { ClientsView } from './components/ClientsView';
import { InadimplenciaReportView } from './components/InadimplenciaReportView';
import { SettingsView } from './components/SettingsView';
import { AppointmentModal } from './components/AppointmentModal';
import { ClientModal } from './components/ClientModal';
import { PaymentModal } from './components/PaymentModal';
import { PlansModal } from './components/PlansModal';
import { Plan, Client, Appointment, PaymentRecord, PersonalSettings } from './types';
import { initializeAppState, saveStoredData, STORAGE_KEYS } from './utils/storage';
import { computeClientPaymentStatus } from './utils/statusUtils';
import { getNextMonthDueDate, getPreviousMonthDueDate, getTodayDateString, formatDateBR, formatCurrency } from './utils/dateUtils';
import { INITIAL_PLANS, INITIAL_SETTINGS, getInitialClients, getInitialAppointments, getInitialPaymentHistory } from './utils/mockData';

export default function App() {
  const initialData = initializeAppState();

  const [theme, setTheme] = useState<'light' | 'dark'>(initialData.theme);
  const [plans, setPlans] = useState<Plan[]>(initialData.plans);
  const [clients, setClients] = useState<Client[]>(initialData.clients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialData.appointments);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialData.payments);
  const [settings, setSettings] = useState<PersonalSettings>(initialData.settings);
  const [activeTab, setActiveTab] = useState<NavTab>('agenda');
  const [agendaSelectedDate, setAgendaSelectedDate] = useState<string>(getTodayDateString());

  // Modals
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [apptSelectedDate, setApptSelectedDate] = useState<string>(getTodayDateString());

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientForPayment, setClientForPayment] = useState<Client | null>(null);

  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

  // Sync theme with DOM and CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveStoredData(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Sync state mutations to storage
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PLANS, plans);
  }, [plans]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.CLIENTS, clients);
  }, [clients]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.APPOINTMENTS, appointments);
  }, [appointments]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PAYMENTS, payments);
  }, [payments]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Calculate overdue count
  const overdueCount = clients.filter((c) => {
    if (!c.active) return false;
    const status = computeClientPaymentStatus(c, settings.warningDaysBeforeDue);
    return status.status === 'overdue';
  }).length;

  // Appointment Handlers
  const handleOpenAddAppt = (dateStr: string) => {
    setEditingAppt(null);
    setApptSelectedDate(dateStr);
    setIsApptModalOpen(true);
  };

  const handleOpenEditAppt = (appt: Appointment) => {
    setEditingAppt(appt);
    setApptSelectedDate(appt.date);
    setIsApptModalOpen(true);
  };

  const handleSaveAppt = (apptData: Partial<Appointment>) => {
    if (editingAppt) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === editingAppt.id ? ({ ...a, ...apptData } as Appointment) : a))
      );
    } else {
      setAppointments((prev) => [apptData as Appointment, ...prev]);
    }
  };

  const handleSaveMultipleAppts = (newAppts: Appointment[]) => {
    setAppointments((prev) => {
      const newIds = new Set(newAppts.map((a) => a.id));
      const filtered = prev.filter((a) => !newIds.has(a.id));
      return [...newAppts, ...filtered].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
    });
  };

  const handleToggleApptStatus = (apptId: string) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === apptId) {
          const nextStatus = a.status === 'completed' ? 'scheduled' : 'completed';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const handleDeleteAppt = (apptId: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== apptId));
  };

  const handleRescheduleAppt = (
    originalApptId: string,
    dateOrData: string | { date: string; time: string; notes?: string },
    possibleTime?: string,
    possibleNotes?: string
  ) => {
    const originalAppt = appointments.find((a) => a.id === originalApptId);
    if (!originalAppt) return;

    let newDate = '';
    let newTime = '';
    let newNotes = '';

    if (typeof dateOrData === 'object') {
      newDate = dateOrData.date;
      newTime = dateOrData.time;
      newNotes = dateOrData.notes || '';
    } else {
      newDate = dateOrData;
      newTime = possibleTime || originalAppt.time;
      newNotes = possibleNotes || '';
    }

    if (!newDate || !newTime) return;

    const newApptId = `appt-${Date.now()}`;
    const newAppointment: Appointment = {
      ...originalAppt,
      id: newApptId,
      date: newDate,
      time: newTime,
      status: 'rescheduled',
      originalAppointmentId: originalApptId,
      rescheduledFromDate: originalAppt.date,
      rescheduledFromTime: originalAppt.time,
      notes: newNotes || `[Reagendada da aula de ${formatDateBR(originalAppt.date)} às ${originalAppt.time}]`,
    };

    const updatedAppts = [
      ...appointments.map((a) =>
        a.id === originalApptId
          ? {
              ...a,
              status: 'cancelled' as const,
              rescheduledToDate: newDate,
              rescheduledToTime: newTime,
              notes: newNotes
                ? `[Remarcada para ${formatDateBR(newDate)} às ${newTime}: ${newNotes}]`
                : `[Remarcada para ${formatDateBR(newDate)} às ${newTime}]`,
            }
          : a
      ),
      newAppointment,
    ];

    setAppointments(updatedAppts);
    saveStoredData(STORAGE_KEYS.APPOINTMENTS, updatedAppts);
    setAgendaSelectedDate(newDate);
  };

  // Client Handlers
  const handleOpenAddClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingClient) {
      setClients((prev) =>
        prev.map((c) => (c.id === editingClient.id ? ({ ...c, ...clientData } as Client) : c))
      );
    } else {
      setClients((prev) => [clientData as Client, ...prev]);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      setAppointments((prev) => prev.filter((a) => a.clientId !== clientId));
    }
  };

  // Payment Handler with Automatic Expiration Rolling and Partial Support
  const handleOpenPaymentModal = (client: Client) => {
    setClientForPayment(client);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (paymentData: Partial<PaymentRecord>, advanceDueDate: boolean) => {
    if (!clientForPayment) return;

    // Add to payment history
    const newPayment: PaymentRecord = {
      id: paymentData.id || `pay-${Date.now()}`,
      clientId: clientForPayment.id,
      clientName: clientForPayment.name,
      amount: paymentData.amount || clientForPayment.price,
      paymentDate: paymentData.paymentDate || getTodayDateString(),
      referenceMonth: paymentData.referenceMonth || '09/2026',
      paymentMethod: paymentData.paymentMethod || 'pix',
      notes: paymentData.notes || '',
      isPartial: paymentData.isPartial || false,
      remainingAmount: paymentData.remainingAmount || 0,
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Update Client due date and partial flags
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientForPayment.id) {
          if (paymentData.isPartial) {
            const accumulatedPaid = (c.isPartialPayment ? (c.partialAmountPaid || 0) : 0) + newPayment.amount;
            const remaining = Math.max(0, paymentData.remainingAmount ?? (c.price - accumulatedPaid));
            return {
              ...c,
              lastPaymentDate: newPayment.paymentDate,
              isPartialPayment: remaining > 0.01,
              partialAmountPaid: accumulatedPaid,
              partialRemainingAmount: remaining,
              dueDate: advanceDueDate ? getNextMonthDueDate(c.dueDate, c.billingDay) : c.dueDate,
            };
          } else {
            const updatedDueDate = advanceDueDate
              ? getNextMonthDueDate(c.dueDate, c.billingDay)
              : c.dueDate;
            return {
              ...c,
              dueDate: updatedDueDate,
              lastPaymentDate: newPayment.paymentDate,
              isPartialPayment: false,
              partialAmountPaid: 0,
              partialRemainingAmount: 0,
            };
          }
        }
        return c;
      })
    );
  };

  // Estornar / Excluir Pagamento
  const handleRefundPayment = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const updatedPayments = payments.filter((p) => p.id !== paymentId);
    setPayments(updatedPayments);
    saveStoredData(STORAGE_KEYS.PAYMENTS, updatedPayments);

    setClients((prev) => {
      const updatedClients = prev.map((c) => {
        if (c.id === payment.clientId) {
          if (payment.isPartial && c.isPartialPayment) {
            const newPartialPaid = Math.max(0, (c.partialAmountPaid || 0) - payment.amount);
            return {
              ...c,
              isPartialPayment: newPartialPaid > 0,
              partialAmountPaid: newPartialPaid,
              partialRemainingAmount: c.price - newPartialPaid,
            };
          } else {
            const revertedDueDate = getPreviousMonthDueDate(c.dueDate, c.billingDay);
            return {
              ...c,
              dueDate: revertedDueDate,
              isPartialPayment: false,
              partialAmountPaid: 0,
              partialRemainingAmount: 0,
            };
          }
        }
        return c;
      });
      saveStoredData(STORAGE_KEYS.CLIENTS, updatedClients);
      return updatedClients;
    });
  };

  // Plan Handlers
  const handleSavePlan = (planData: Plan) => {
    setPlans((prev) => {
      const exists = prev.some((p) => p.id === planData.id);
      if (exists) {
        return prev.map((p) => (p.id === planData.id ? planData : p));
      }
      return [...prev, planData];
    });
  };

  const handleDeletePlan = (planId: string) => {
    if (plans.length <= 1) {
      alert('Você precisa ter pelo menos um plano cadastrado.');
      return;
    }
    setPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  // Backup and Demo Data
  const handleExportBackup = () => {
    const backupData = {
      plans,
      clients,
      appointments,
      payments,
      settings,
      exportDate: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_personal_trainer_${getTodayDateString()}.json`;
    link.click();
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.clients && data.plans) {
          setPlans(data.plans || INITIAL_PLANS);
          setClients(data.clients || []);
          setAppointments(data.appointments || []);
          setPayments(data.payments || []);
          if (data.settings) setSettings(data.settings);
          alert('Backup restaurado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados e zerar o aplicativo?')) {
      setPlans([]);
      setClients([]);
      setAppointments([]);
      setPayments([]);
      setSettings(INITIAL_SETTINGS);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors flex flex-col">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        settings={settings}
        overdueCount={overdueCount}
        onNavigateToInadimplencia={() => setActiveTab('financial')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'agenda' && (
          <AgendaView
            selectedDate={agendaSelectedDate}
            setSelectedDate={setAgendaSelectedDate}
            appointments={appointments}
            clients={clients}
            plans={plans}
            settings={settings}
            onAddAppointment={handleOpenAddAppt}
            onEditAppointment={handleOpenEditAppt}
            onToggleStatus={handleToggleApptStatus}
            onDeleteAppointment={handleDeleteAppt}
            onOpenPaymentModal={handleOpenPaymentModal}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            plans={plans}
            settings={settings}
            onAddClient={handleOpenAddClient}
            onEditClient={handleOpenEditClient}
            onDeleteClient={handleDeleteClient}
            onOpenPaymentModal={handleOpenPaymentModal}
            onOpenPlansModal={() => setIsPlansModalOpen(true)}
          />
        )}

        {activeTab === 'financial' && (
          <InadimplenciaReportView
            clients={clients}
            plans={plans}
            payments={payments}
            settings={settings}
            onOpenPaymentModal={handleOpenPaymentModal}
            onRefundPayment={handleRefundPayment}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={setSettings}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      {/* Navigation Bar for Mobile Thumbs */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        overdueCount={overdueCount}
      />

      {/* Modals */}
      <AppointmentModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        onSave={handleSaveAppt}
        onSaveMultiple={handleSaveMultipleAppts}
        onReschedule={handleRescheduleAppt}
        appointmentToEdit={editingAppt}
        clients={clients.filter((c) => c.active)}
        plans={plans}
        selectedDate={apptSelectedDate}
        appointments={appointments}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        clientToEdit={editingClient}
        plans={plans}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        client={clientForPayment}
        onConfirmPayment={handleConfirmPayment}
      />

      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        plans={plans}
        onSavePlan={handleSavePlan}
        onDeletePlan={handleDeletePlan}
      />
    </div>
  );
}
