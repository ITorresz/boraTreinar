import React, { useState, useEffect } from 'react';
import { X, CheckCircle, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { Client, PaymentMethod, PaymentRecord } from '../types';
import { formatCurrency, getTodayDateString, getNextMonthDueDate, formatDateBR } from '../utils/dateUtils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onConfirmPayment: (payment: Partial<PaymentRecord>, advanceDueDate: boolean) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  client,
  onConfirmPayment,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [referenceMonth, setReferenceMonth] = useState<string>('');
  const [advanceDueDate, setAdvanceDueDate] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (client) {
      setAmount(client.price || 0);
      setPaymentDate(getTodayDateString());
      setPaymentMethod('pix');
      const now = new Date();
      const monthStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      setReferenceMonth(monthStr);
      setAdvanceDueDate(true);
      setNotes('');
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const nextDueDate = getNextMonthDueDate(client.dueDate, client.billingDay);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPayment(
      {
        id: `pay-${Date.now()}`,
        clientId: client.id,
        clientName: client.name,
        amount: Number(amount),
        paymentDate,
        referenceMonth,
        paymentMethod,
        notes,
      },
      advanceDueDate
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-[var(--bg-surface)] rounded-t-3xl sm:rounded-3xl border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                Dar Baixa em Pagamento
              </h2>
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                Confirmar recebimento de {client.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Valor */}
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Valor Recebido (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full px-5 py-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] font-black text-xl focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Data do Pagamento */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Data Pagamento
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Mês de Referência */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">
                Mês Ref. (MM/AAAA)
              </label>
              <input
                type="text"
                value={referenceMonth}
                onChange={(e) => setReferenceMonth(e.target.value)}
                placeholder="Ex: 09/2026"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['pix', 'dinheiro', 'cartao', 'transferencia'] as PaymentMethod[]).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-3 px-1.5 text-xs sm:text-sm rounded-xl font-bold border capitalize transition truncate ${
                    paymentMethod === method
                      ? 'bg-emerald-600 text-white border-emerald-600 font-black shadow-xs'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {method === 'cartao' ? 'Cartão' : method === 'transferencia' ? 'Transf.' : method}
                </button>
              ))}
            </div>
          </div>

          {/* Controle Automático de Vencimento */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={advanceDueDate}
                onChange={(e) => setAdvanceDueDate(e.target.checked)}
                className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-sm text-[var(--text-primary)]">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block">
                  Renovação automática do vencimento (+1 mês)
                </span>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                  Atualizar data de vencimento de <strong>{formatDateBR(client.dueDate)}</strong> para{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {formatDateBR(nextDueDate)}
                  </strong>.
                </p>
              </div>
            </label>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">
              Observação (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pago com Pix, comprovante salvo..."
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-4 rounded-2xl border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 shadow-md transition"
            >
              Confirmar Recebimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
