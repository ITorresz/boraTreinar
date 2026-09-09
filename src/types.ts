export interface Plan {
  id: string;
  name: string;
  daysPerWeek: number; // ex: 5 para plano 5 dias
  defaultPrice: number;
  description: string;
  badgeColor: string; // Tailwind color code or hex
}

export interface Client {
  id: string;
  name: string;
  phone: string; // ex: "(11) 98765-4321"
  email?: string;
  planId: string;
  billingDay: number; // Dia do mês (1 a 31)
  dueDate: string; // YYYY-MM-DD
  price: number; // Valor acordado mensal
  active: boolean;
  notes?: string;
  lastPaymentDate?: string;
  createdAt: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  planId: string;
  serviceType: string; // ex: "Treino Presencial", "Musculação", "Funcional", "Consultoria"
  status: AppointmentStatus;
  location?: string;
  notes?: string;
}

export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro' | 'transferencia';

export interface PaymentRecord {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  referenceMonth: string; // ex: "09/2026"
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface PersonalSettings {
  trainerName: string;
  phone: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'email' | 'celular' | 'aleatoria';
  warningDaysBeforeDue: number; // Dias antes de avisar vencimento (ex: 3 dias)
}

export type PaymentStatusType = 'paid' | 'warning' | 'overdue';

export interface ComputedClientStatus {
  status: PaymentStatusType;
  label: string;
  daysDiff: number; // se negativo, dias de atraso; se positivo, dias restantes
  badgeClass: string;
  textColor: string;
  bgColor: string;
}
