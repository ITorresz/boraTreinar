// Utilitários de data e formatação em Português do Brasil

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatCurrency(amount: number = 0): string {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(validAmount);
}

export function getDayOfWeekName(dateStr?: string | null): string {
  const safeStr = dateStr && typeof dateStr === 'string' ? dateStr : getTodayDateString();
  const parts = safeStr.split('-').map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = parts[1] || 1;
  const day = parts[2] || 1;
  const date = new Date(year, month - 1, day);
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[date.getDay()] || 'Hoje';
}

export function getShortDayOfWeek(dateStr?: string | null): string {
  const safeStr = dateStr && typeof dateStr === 'string' ? dateStr : getTodayDateString();
  const parts = safeStr.split('-').map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = parts[1] || 1;
  const day = parts[2] || 1;
  const date = new Date(year, month - 1, day);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[date.getDay()] || 'Hoje';
}

export function getWeekDates(baseDateStr?: string | null): string[] {
  const safeStr = baseDateStr && typeof baseDateStr === 'string' ? baseDateStr : getTodayDateString();
  const parts = safeStr.split('-').map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = parts[1] || 1;
  const day = parts[2] || 1;
  const current = new Date(year, month - 1, day);
  const dayOfWeek = current.getDay(); // 0 = Dom, 1 = Seg...
  
  // Start on Monday (or Sunday if preferred, usually gym week starts on Monday)
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${dayNum}`);
  }
  return dates;
}

export function calculateDaysDiff(targetDateStr?: string | null, fromDateStr?: string | null): number {
  if (!targetDateStr || typeof targetDateStr !== 'string') return 0;
  const safeFrom = fromDateStr && typeof fromDateStr === 'string' ? fromDateStr : getTodayDateString();
  
  const [tY, tM, tD] = targetDateStr.split('-').map(Number);
  const [fY, fM, fD] = safeFrom.split('-').map(Number);
  
  const target = new Date(tY || 2026, (tM || 1) - 1, tD || 1);
  const from = new Date(fY || 2026, (fM || 1) - 1, fD || 1);
  
  const diffTime = target.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Avança a data de vencimento em 1 mês (ex: 10/09 -> 10/10)
export function getNextMonthDueDate(currentDueDateStr?: string | null, billingDay: number = 10): string {
  if (!currentDueDateStr || typeof currentDueDateStr !== 'string') {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    today.setDate(billingDay || 10);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const [y, m] = currentDueDateStr.split('-').map(Number);
  let nextYear = y || new Date().getFullYear();
  let nextMonth = (m || 1) + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }

  // Verificar o último dia do mês destino
  const lastDayOfMonth = new Date(nextYear, nextMonth, 0).getDate();
  const day = Math.min(billingDay || 10, lastDayOfMonth);
  const mStr = String(nextMonth).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');

  return `${nextYear}-${mStr}-${dStr}`;
}

// Retrocede a data de vencimento em 1 mês (ex: 10/10 -> 10/09) para uso em estornos
export function getPreviousMonthDueDate(currentDueDateStr?: string | null, billingDay: number = 10): string {
  if (!currentDueDateStr || typeof currentDueDateStr !== 'string') {
    const today = new Date();
    today.setDate(billingDay || 10);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const [y, m] = currentDueDateStr.split('-').map(Number);
  let prevYear = y || new Date().getFullYear();
  let prevMonth = (m || 1) - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear--;
  }

  const lastDayOfMonth = new Date(prevYear, prevMonth, 0).getDate();
  const day = Math.min(billingDay || 10, lastDayOfMonth);
  const mStr = String(prevMonth).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');

  return `${prevYear}-${mStr}-${dStr}`;
}
