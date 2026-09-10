import { Client, ComputedClientStatus, PersonalSettings, Plan } from '../types';
import { calculateDaysDiff, formatDateBR, formatCurrency, getTodayDateString } from './dateUtils';

export function computeClientPaymentStatus(
  client: Client,
  warningDaysBeforeDue: number = 3,
  referenceDate: string = getTodayDateString()
): ComputedClientStatus {
  if (!client.active) {
    return {
      status: 'paid',
      label: 'Inativo',
      daysDiff: 0,
      badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
      textColor: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
    };
  }

  // Se o aluno tiver faturamento parcial em aberto com saldo devedor
  if (client.isPartialPayment && (client.partialRemainingAmount || 0) > 0) {
    const remaining = client.partialRemainingAmount || 0;
    const daysDiff = calculateDaysDiff(client.dueDate, referenceDate);
    return {
      status: 'partial',
      label: `Faturado Parcial (Falta ${formatCurrency(remaining)})`,
      daysDiff,
      badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold',
      textColor: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      isPartial: true,
      remainingAmount: remaining,
    };
  }

  const daysDiff = calculateDaysDiff(client.dueDate, referenceDate);

  if (daysDiff < 0) {
    const daysLate = Math.abs(daysDiff);
    return {
      status: 'overdue',
      label: `Vencido há ${daysLate} ${daysLate === 1 ? 'dia' : 'dias'}`,
      daysDiff,
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    };
  }

  if (daysDiff === 0) {
    return {
      status: 'warning',
      label: 'Vence Hoje!',
      daysDiff,
      badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    };
  }

  if (daysDiff <= warningDaysBeforeDue) {
    return {
      status: 'warning',
      label: `Vence em ${daysDiff} ${daysDiff === 1 ? 'dia' : 'dias'}`,
      daysDiff,
      badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    };
  }

  return {
    status: 'paid',
    label: `Em dia (Vence ${formatDateBR(client.dueDate)})`,
    daysDiff,
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
  };
}

export function generateWhatsAppCobrançaUrl(
  client: Client,
  plan: Plan | undefined,
  settings: PersonalSettings
): string {
  const cleanPhone = client.phone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 11 || cleanPhone.length === 10
    ? `55${cleanPhone}`
    : cleanPhone;

  const planName = plan ? plan.name : 'Plano de Treinos';
  const valorStr = formatCurrency(client.price);
  const dataVencStr = formatDateBR(client.dueDate);
  const daysDiff = calculateDaysDiff(client.dueDate);

  let message = '';
  if (client.isPartialPayment && (client.partialRemainingAmount || 0) > 0) {
    const restanteStr = formatCurrency(client.partialRemainingAmount);
    message = `Olá ${client.name}, tudo bem? Espero que sim!\n\nPassando para lembrar que ainda consta um *saldo pendente de ${restanteStr}* referente à mensalidade do seu plano (${planName}) com vencimento em *${dataVencStr}*.\n\n` +
      (settings.pixKey ? `🔑 Chave Pix para quitação do restante:\n*${settings.pixKey}* (${settings.pixKeyType.toUpperCase()})\nFavorecido: ${settings.trainerName || 'Personal'}\n\n` : '') +
      `Assim que efetuar o pagamento do saldo, me envie o comprovante por aqui para atualizarmos tudo no sistema. Muito obrigado! 💪🏋️`;
  } else if (daysDiff < 0) {
    const diasAtraso = Math.abs(daysDiff);
    message = `Olá ${client.name}, tudo bem? Espero que sim!\n\nPassando para lembrar que a mensalidade do seu plano de Personal (${planName}) referente ao vencimento de *${dataVencStr}* (${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'} em aberto) no valor de *${valorStr}* ainda não foi identificada no sistema.\n\n` +
      (settings.pixKey ? `🔑 Chave Pix para pagamento:\n*${settings.pixKey}* (${settings.pixKeyType.toUpperCase()})\nFavorecido: ${settings.trainerName || 'Personal'}\n\n` : '') +
      `Assim que efetuar o pagamento, por gentileza me envie o comprovante por aqui. Qualquer dúvida ou se já tiver pago, só me avisar! Bons treinos! 💪🏋️`;
  } else if (daysDiff === 0) {
    message = `Olá ${client.name}, tudo bem?\n\nPassando para lembrar que sua mensalidade do plano de Personal (${planName}) no valor de *${valorStr}* *vence hoje (${dataVencStr})*.\n\n` +
      (settings.pixKey ? `🔑 Chave Pix:\n*${settings.pixKey}* (${settings.pixKeyType.toUpperCase()})\n\n` : '') +
      `Assim que fizer o pagamento, pode mandar o comprovante aqui. Muito obrigado pela confiança e foco nos treinos! 💪`;
  } else {
    message = `Olá ${client.name}, tudo bem? Lembrete amigável: sua mensalidade do plano (${planName}) de *${valorStr}* vence no dia *${dataVencStr}*.\n\n` +
      (settings.pixKey ? `🔑 Chave Pix:\n*${settings.pixKey}*\n\n` : '') +
      `Seguimos firmes nos objetivos! 🏋️`;
  }

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppReminderUrl(
  client: Client,
  appointmentTime: string,
  serviceType: string
): string {
  const cleanPhone = client.phone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 11 || cleanPhone.length === 10
    ? `55${cleanPhone}`
    : cleanPhone;

  const msg = `Fala ${client.name}! Passando para confirmar nosso treino de *${serviceType || 'Personal'}* hoje às *${appointmentTime}*. Não esquece a garrafa de água e a toalha! Vamos pra cima! 🔥💪`;
  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
}
