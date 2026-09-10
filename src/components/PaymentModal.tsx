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
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [referenceMonth, setReferenceMonth] = useState<string>('');
  const [advanceDueDate, setAdvanceDueDate] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const fullPrice = client?.price || 0;
  const currentPendingBalance = client?.isPartialPayment && client.partialRemainingAmount
    ? client.partialRemainingAmount
    : fullPrice;

  useEffect(() => {
    if (client) {
      if (client.isPartialPayment && client.partialRemainingAmount && client.partialRemainingAmount > 0) {
        // Aluno já possui saldo parcial pendente
        setPaymentType('full');
        setAmount(client.partialRemainingAmount);
        setAdvanceDueDate(true);
      } else {
        setPaymentType('full');
        setAmount(client.price || 0);
        setAdvanceDueDate(true);
      }
      setPaymentDate(getTodayDateString());
      setPaymentMethod('pix');
      const now = new Date();
      const monthStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      setReferenceMonth(monthStr);
      setNotes('');
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const nextDueDate = getNextMonthDueDate(client.dueDate, client.billingDay);
  const remainingBalance = Math.max(0, currentPendingBalance - Number(amount || 0));

  const handleSelectType = (type: 'full' | 'partial') => {
    setPaymentType(type);
    if (type === 'full') {
      setAmount(currentPendingBalance);
      setAdvanceDueDate(true);
    } else {
      // Sugerir 50%
      setAmount(Math.round((currentPendingBalance / 2) * 100) / 100);
      setAdvanceDueDate(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isPartial = paymentType === 'partial' || remainingBalance > 0.01;
    const notesText = notes || (isPartial ? `Pagamento parcial. Saldo restante: ${formatCurrency(remainingBalance)}` : '');

    onConfirmPayment(
      {
        id: `pay-${Date.now()}`,
        clientId: client.id,
        clientName: client.name,
        amount: Number(amount),
        paymentDate,
        referenceMonth,
        paymentMethod,
        isPartial,
        remainingAmount: remainingBalance,
        notes: notesText,
      },
      advanceDueDate
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-xl bg-[var(--bg-surface)] rounded-t-3xl sm:rounded-3xl border border-[var(--border-subtle)] shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-surface)] px-5 sm:px-6 py-4.5 border-b border-[var(--border-subtle)] flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-[var(--text-primary)]">
                Dar Baixa em Pagamento
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                Confirmar recebimento de {client.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 pb-8 sm:pb-6">
          {/* Alerta de saldo parcial anterior se houver */}
          {client.isPartialPayment && client.partialRemainingAmount && client.partialRemainingAmount > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                Aluno com Faturamento Parcial Ativo
              </span>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                Valor do plano: <strong>{formatCurrency(client.price)}</strong> • Já pago:{' '}
                <strong>{formatCurrency(client.partialAmountPaid || 0)}</strong> • Falta pagar:{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-bold">
                  {formatCurrency(client.partialRemainingAmount)}
                </strong>
              </p>
            </div>
          )}

          {/* Seletor: Quitação Total vs Faturado Parcial */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Tipo de Recebimento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectType('full')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition ${
                  paymentType === 'full'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                Quitação Total ({formatCurrency(currentPendingBalance)})
              </button>
              <button
                type="button"
                onClick={() => handleSelectType('partial')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition ${
                  paymentType === 'partial'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                Faturado Parcial (Metade / Entrada)
              </button>
            </div>
          </div>

          {/* Valor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Valor Recebido Agora (R$) *
              </label>
              {paymentType === 'partial' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAmount(Math.round((currentPendingBalance / 2) * 100) / 100)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] hover:bg-slate-200"
                  >
                    50% (Metade)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount(currentPendingBalance)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] hover:bg-slate-200"
                  >
                    100%
                  </button>
                </div>
              )}
            </div>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full px-5 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] font-black text-xl focus:outline-none focus:border-emerald-500 transition"
            />

            {/* Resumo do Saldo Restante quando parcial */}
            {(paymentType === 'partial' || remainingBalance > 0.01) && (
              <div className="mt-2 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    Ficará como Faturado Parcial
                  </span>
                  <p className="text-amber-800 dark:text-amber-300 text-[11px]">
                    O aluno continuará com pendência de saldo restante.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80 block">
                    Saldo Restante
                  </span>
                  <span className="font-black text-sm text-rose-600 dark:text-rose-400">
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </div>
            )}
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
          <div className={`p-4 rounded-2xl border ${
            advanceDueDate
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
              : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={advanceDueDate}
                onChange={(e) => setAdvanceDueDate(e.target.checked)}
                className="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-sm text-[var(--text-primary)]">
                <span className={`font-extrabold block ${
                  advanceDueDate ? 'text-emerald-800 dark:text-emerald-300' : 'text-[var(--text-secondary)]'
                }`}>
                  {paymentType === 'partial'
                    ? 'Renovar data de vencimento (+1 mês)'
                    : 'Renovação automática do vencimento (+1 mês)'}
                </span>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                  {advanceDueDate ? (
                    <>
                      Atualizar data de vencimento de <strong>{formatDateBR(client.dueDate)}</strong> para{' '}
                      <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {formatDateBR(nextDueDate)}
                      </strong>.
                    </>
                  ) : (
                    <>
                      A data de vencimento permanecerá <strong>{formatDateBR(client.dueDate)}</strong> (Recomendado para manter o status em aberto até a quitação total).
                    </>
                  )}
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
