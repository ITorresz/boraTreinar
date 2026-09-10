import React, { useState } from 'react';
import {
  AlertTriangle,
  Printer,
  Download,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  Users,
  MessageCircle,
  FileCheck,
  Clock,
  CheckCircle2,
  RotateCcw,
  Percent,
} from 'lucide-react';
import { Client, PaymentRecord, PersonalSettings, Plan } from '../types';
import { formatCurrency, formatDateBR, getTodayDateString } from '../utils/dateUtils';
import { computeClientPaymentStatus, generateWhatsAppCobrançaUrl } from '../utils/statusUtils';

interface InadimplenciaReportViewProps {
  clients: Client[];
  plans: Plan[];
  payments: PaymentRecord[];
  settings: PersonalSettings;
  onOpenPaymentModal: (client: Client) => void;
  onRefundPayment?: (paymentId: string) => void;
}

export const InadimplenciaReportView: React.FC<InadimplenciaReportViewProps> = ({
  clients,
  plans,
  payments,
  settings,
  onOpenPaymentModal,
  onRefundPayment,
}) => {
  const [copied, setCopied] = useState(false);
  const [paymentToRefund, setPaymentToRefund] = useState<PaymentRecord | null>(null);
  const today = getTodayDateString();

  // Calcular status de todos os clientes
  const activeClients = clients.filter((c) => c.active);

  const delinquentClients = activeClients
    .map((client) => {
      const status = computeClientPaymentStatus(client, settings.warningDaysBeforeDue);
      const plan = plans.find((p) => p.id === client.planId);
      return { client, status, plan };
    })
    .filter((item) => item.status.status === 'overdue' && !item.client.isPartialPayment)
    .sort((a, b) => a.status.daysDiff - b.status.daysDiff); // Mais atrasados primeiro

  // Clientes com pagamento parcial pendente
  const partialClients = activeClients
    .map((client) => {
      const status = computeClientPaymentStatus(client, settings.warningDaysBeforeDue);
      const plan = plans.find((p) => p.id === client.planId);
      return { client, status, plan };
    })
    .filter((item) => item.client.isPartialPayment && (item.client.partialRemainingAmount || 0) > 0);

  // Cálculos Financeiros
  const totalInadimplente = delinquentClients.reduce(
    (acc, curr) => acc + curr.client.price,
    0
  );

  const totalPartialPendente = partialClients.reduce(
    (acc, curr) => acc + (curr.client.partialRemainingAmount || 0),
    0
  );

  const totalEsperadoMes = activeClients.reduce(
    (acc, curr) => acc + curr.price,
    0
  );

  // Total recebido nos últimos 30 dias ou mês atual
  const totalRecebido = payments.reduce((acc, curr) => acc + curr.amount, 0);

  const taxaAdimplencia =
    activeClients.length > 0
      ? Math.round(((activeClients.length - delinquentClients.length - partialClients.length) / activeClients.length) * 100)
      : 100;

  // Exportar para CSV (Excel Brasil)
  const handleExportCSV = () => {
    const headers = ['Aluno', 'Telefone', 'Plano', 'Vencimento', 'Dias em Atraso', 'Valor (R$)'];
    const rows = delinquentClients.map(({ client, status, plan }) => [
      client.name,
      client.phone,
      plan ? plan.name : 'Plano',
      formatDateBR(client.dueDate),
      Math.abs(status.daysDiff),
      client.price.toFixed(2).replace('.', ','),
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM para abrir com acentuação correta no Excel
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_inadimplencia_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copiar Resumo para WhatsApp
  const handleCopySummary = () => {
    let summary = `📊 *RELATÓRIO DE INADIMPLÊNCIA - ${settings.trainerName || 'PERSONAL'}*\n`;
    summary += `📅 Data de Emissão: ${formatDateBR(today)}\n`;
    summary += `⚠️ Total em Atraso: ${formatCurrency(totalInadimplente)} (${delinquentClients.length} alunos)\n\n`;

    if (delinquentClients.length === 0) {
      summary += `✅ Parabéns! Todos os alunos estão em dia com as mensalidades!`;
    } else {
      summary += `*Lista de Clientes em Débito:*\n`;
      delinquentClients.forEach(({ client, status, plan }, idx) => {
        const dias = Math.abs(status.daysDiff);
        summary += `${idx + 1}. *${client.name}*\n`;
        summary += `   • Plano: ${plan?.name || 'Personal'}\n`;
        summary += `   • Venceu em: ${formatDateBR(client.dueDate)} (${dias} ${dias === 1 ? 'dia' : 'dias'} de atraso)\n`;
        summary += `   • Valor: ${formatCurrency(client.price)}\n`;
        summary += `   • Contato: ${client.phone}\n\n`;
      });
    }

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Imprimir relatório
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Printable Report View (Visible during Print, Clean layout) */}
      <div className="hidden print:block p-6 text-black bg-white">
        <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold">Relatório de Inadimplência</h1>
            <p className="text-sm text-slate-600">Gestão Financeira do Personal Trainer: {settings.trainerName}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            Emitido em: {formatDateBR(today)}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4 border p-3 rounded">
          <div>
            <p className="text-xs text-slate-500">Total Inadimplente</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalInadimplente)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Alunos em Atraso</p>
            <p className="text-lg font-bold">{delinquentClients.length} de {activeClients.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Taxa de Adimplência</p>
            <p className="text-lg font-bold">{taxaAdimplencia}%</p>
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-300">
              <th className="py-2">Aluno</th>
              <th className="py-2">Contato</th>
              <th className="py-2">Plano</th>
              <th className="py-2">Vencimento</th>
              <th className="py-2">Atraso</th>
              <th className="py-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {delinquentClients.map(({ client, status, plan }) => (
              <tr key={client.id} className="border-b border-slate-200">
                <td className="py-2 font-semibold">{client.name}</td>
                <td className="py-2">{client.phone}</td>
                <td className="py-2">{plan?.name || '-'}</td>
                <td className="py-2">{formatDateBR(client.dueDate)}</td>
                <td className="py-2 text-red-600">{Math.abs(status.daysDiff)} dias</td>
                <td className="py-2 text-right font-bold">{formatCurrency(client.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Screen View */}
      <div className="no-print space-y-4">
        {/* Header com Ações de Emissão */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Relatório de Inadimplência
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Controle de mensalidades em atraso e cobranças
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] text-xs font-semibold text-[var(--text-secondary)] transition shadow-xs"
              title="Copiar resumo de inadimplentes"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] text-xs font-semibold text-[var(--text-secondary)] transition shadow-xs"
              title="Baixar planilha CSV para Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition shadow-xs"
              title="Imprimir ou Salvar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir PDF</span>
            </button>
          </div>
        </div>

        {/* Cards de Métricas Financeiras */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Total Inadimplente */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 shadow-xs">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Total em Atraso
            </span>
            <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(totalInadimplente)}
            </p>
            <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              {delinquentClients.length} {delinquentClients.length === 1 ? 'aluno em atraso' : 'alunos em atraso'}
            </p>
          </div>

          {/* Faturamento Recebido */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Recebido no Mês
            </span>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {formatCurrency(totalRecebido)}
            </p>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              {payments.length} pagamentos baixados
            </p>
          </div>

          {/* Previsão Total */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Receita Mensal Esperada
            </span>
            <p className="text-lg font-black text-[var(--text-primary)] mt-1">
              {formatCurrency(totalEsperadoMes)}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Base de {activeClients.length} alunos
            </p>
          </div>

          {/* Taxa de Adimplência */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Taxa de Adimplência
            </span>
            <p className="text-lg font-black text-[var(--text-primary)] mt-1">
              {taxaAdimplencia}%
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Alunos com planos em dia
            </p>
          </div>
        </div>

        {/* Lista Detalhada de Inadimplentes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Alunos com Mensalidades Vencidas ({delinquentClients.length})
            </h3>
            {delinquentClients.length > 0 && (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                Cobrança prioritária
              </span>
            )}
          </div>

          {delinquentClients.length === 0 ? (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-8 text-center border border-emerald-200 dark:border-emerald-900/40">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Tudo 100% em dia!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-xs mx-auto mt-1">
                Nenhum aluno com mensalidade em atraso no momento. Sua gestão financeira está redonda!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {delinquentClients.map(({ client, status, plan }) => {
                const diasAtraso = Math.abs(status.daysDiff);

                return (
                  <div
                    key={client.id}
                    className="p-4 rounded-2xl bg-[var(--bg-card)] border border-rose-200 dark:border-rose-900/70 shadow-xs hover:border-rose-300 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">
                            {client.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            {diasAtraso} {diasAtraso === 1 ? 'dia' : 'dias'} em atraso
                          </span>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {plan?.name || 'Plano Personal'} • Venceu em{' '}
                          <strong className="text-rose-600 dark:text-rose-400">
                            {formatDateBR(client.dueDate)}
                          </strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-rose-600 dark:text-rose-400">
                          {formatCurrency(client.price)}
                        </span>
                        <p className="text-[10px] text-[var(--text-muted)]">Valor pendente</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                      <span className="text-xs text-[var(--text-muted)] truncate max-w-[150px]">
                        {client.phone}
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={generateWhatsAppCobrançaUrl(client, plan, settings)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition active:scale-95"
                          title="Abrir WhatsApp com texto de cobrança e Pix já preenchidos"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Cobrar WhatsApp</span>
                        </a>

                        <button
                          onClick={() => onOpenPaymentModal(client)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 text-xs font-semibold text-[var(--text-primary)] transition"
                          title="Dar baixa no pagamento"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dar Baixa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alunos com Faturamento Parcial (Metade/Entrada Pendente) */}
        {partialClients.length > 0 && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />
                Alunos com Faturamento Parcial ({partialClients.length})
              </h3>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                Total a receber: {formatCurrency(totalPartialPendente)}
              </span>
            </div>

            <div className="space-y-2.5">
              {partialClients.map(({ client, plan }) => {
                const restante = client.partialRemainingAmount || (client.price - (client.partialAmountPaid || 0));

                return (
                  <div
                    key={client.id}
                    className="p-4 rounded-2xl bg-[var(--bg-card)] border border-amber-300 dark:border-amber-800/80 shadow-xs hover:border-amber-400 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">
                            {client.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            Faturado Parcial
                          </span>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {plan?.name || 'Plano Personal'} • Total:{' '}
                          <strong>{formatCurrency(client.price)}</strong> • Já Pago:{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(client.partialAmountPaid || 0)}
                          </strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-amber-600 dark:text-amber-400">
                          {formatCurrency(restante)}
                        </span>
                        <p className="text-[10px] text-[var(--text-muted)]">Saldo restante</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                      <span className="text-xs text-[var(--text-muted)] truncate max-w-[150px]">
                        {client.phone}
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={generateWhatsAppCobrançaUrl(client, plan, settings)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition active:scale-95"
                          title="Cobrar saldo restante pelo WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Cobrar Restante</span>
                        </a>

                        <button
                          onClick={() => onOpenPaymentModal(client)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-xs font-semibold text-amber-900 dark:text-amber-200 transition"
                          title="Quitar restante do valor"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Quitar Restante</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Histórico Recente de Pagamentos */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Últimos Pagamentos Recebidos ({payments.length})
            </h3>
          </div>

          {payments.length === 0 ? (
            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)]">
              Nenhum pagamento registrado ainda.
            </div>
          ) : (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] overflow-hidden shadow-xs">
              {payments.slice(0, 15).map((p) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between gap-2.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[var(--text-primary)] truncate">{p.clientName}</span>
                      {p.isPartial && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Parcial
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {formatDateBR(p.paymentDate)} • Ref: {p.referenceMonth} • {p.paymentMethod.toUpperCase()}
                      {p.notes ? ` • "${p.notes}"` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                      +{formatCurrency(p.amount)}
                    </span>
                    {onRefundPayment && (
                      <button
                        type="button"
                        onClick={() => setPaymentToRefund(p)}
                        className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                        title="Estornar / Excluir pagamento lançado por engano"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Estornar</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Estorno (sem window.confirm) */}
      {paymentToRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  Confirmar Estorno
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Excluir recebimento registrado por engano
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/80 space-y-2 text-xs">
              <p className="text-rose-950 dark:text-rose-100">
                Aluno: <strong className="font-bold text-sm">{paymentToRefund.clientName}</strong>
              </p>
              <p className="text-rose-950 dark:text-rose-100">
                Valor do Pagamento: <strong className="text-base font-black text-rose-600 dark:text-rose-400">{formatCurrency(paymentToRefund.amount)}</strong>
              </p>
              <p className="text-rose-800 dark:text-rose-300">
                Data: {formatDateBR(paymentToRefund.paymentDate)} • Ref: {paymentToRefund.referenceMonth} • {paymentToRefund.paymentMethod.toUpperCase()}
              </p>
              {paymentToRefund.isPartial && (
                <p className="font-bold text-amber-700 dark:text-amber-400">
                  (Este foi um pagamento parcial)
                </p>
              )}
              <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-800 dark:text-rose-300">
                ⚠️ <strong>Atenção:</strong> O lançamento será excluído do histórico e a data de vencimento / pendência financeira do aluno será recalculada para o estado anterior.
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentToRefund(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-[var(--border-subtle)] text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onRefundPayment && paymentToRefund) {
                    onRefundPayment(paymentToRefund.id);
                  }
                  setPaymentToRefund(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
              >
                Sim, Estornar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
