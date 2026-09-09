import { Plan, Client, Appointment, PaymentRecord, PersonalSettings } from '../types';

// Inicializar 100% vazio e limpo, sem nomes pré-adicionados
export const INITIAL_PLANS: Plan[] = [];

export const INITIAL_SETTINGS: PersonalSettings = {
  trainerName: '',
  phone: '',
  pixKey: '',
  pixKeyType: 'cpf',
  warningDaysBeforeDue: 3,
};

export function getInitialClients(): Client[] {
  return [];
}

export function getInitialAppointments(): Appointment[] {
  return [];
}

export function getInitialPaymentHistory(): PaymentRecord[] {
  return [];
}
