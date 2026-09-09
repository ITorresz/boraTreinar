import { Plan, Client, Appointment, PaymentRecord, PersonalSettings } from '../types';
import { INITIAL_PLANS, INITIAL_SETTINGS, getInitialClients, getInitialAppointments, getInitialPaymentHistory } from './mockData';

const STORAGE_KEYS = {
  PLANS: 'pt_plans_v5_clean',
  CLIENTS: 'pt_clients_v5_clean',
  APPOINTMENTS: 'pt_appointments_v5_clean',
  PAYMENTS: 'pt_payments_v5_clean',
  SETTINGS: 'pt_settings_v5_clean',
  THEME: 'pt_theme_v5_clean',
};

const LEGACY_KEYS = [
  'pt_plans_v1', 'pt_clients_v1', 'pt_appointments_v1', 'pt_payments_v1', 'pt_settings_v1',
  'pt_plans_v2', 'pt_clients_v2', 'pt_appointments_v2', 'pt_payments_v2', 'pt_settings_v2',
  'pt_plans_v3', 'pt_clients_v3', 'pt_appointments_v3', 'pt_payments_v3', 'pt_settings_v3',
  'pt_plans_v4', 'pt_clients_v4', 'pt_appointments_v4', 'pt_payments_v4', 'pt_settings_v4',
  'pt_plans_v4_clean', 'pt_clients_v4_clean', 'pt_appointments_v4_clean', 'pt_payments_v4_clean', 'pt_settings_v4_clean',
];

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Erro ao carregar dados de ${key}:`, err);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Erro ao salvar dados de ${key}:`, err);
  }
}

export function initializeAppState() {
  // Limpar chaves legadas de demonstração para garantir tela zerada
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    // ignore
  }

  const plans = loadStoredData<Plan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  let clients = loadStoredData<Client[]>(STORAGE_KEYS.CLIENTS, getInitialClients());
  let appointments = loadStoredData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, getInitialAppointments());
  let payments = loadStoredData<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, getInitialPaymentHistory());
  const settings = loadStoredData<PersonalSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  const theme = loadStoredData<'light' | 'dark'>(STORAGE_KEYS.THEME, 'light');

  // Filtro de segurança caso algum dado residual com nomes mock tenha sido gravado
  const mockNames = ['Mariana Silva', 'Carlos Eduardo Santos', 'Beatriz Ramos', 'Lucas Albuquerque', 'Fernanda Lima Costa', 'Rodrigo Personal'];
  clients = clients.filter((c) => !mockNames.includes(c.name));
  appointments = appointments.filter((a) => !['appt-1', 'appt-2', 'appt-3', 'appt-4', 'appt-5'].includes(a.id));
  payments = payments.filter((p) => !mockNames.includes(p.clientName));

  return { plans, clients, appointments, payments, settings, theme };
}

export { STORAGE_KEYS };
