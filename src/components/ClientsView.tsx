import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  MessageCircle,
  FileCheck,
} from 'lucide-react';
import { Client, Plan, PersonalSettings } from '../types';
import { formatCurrency, formatDateBR } from '../utils/dateUtils';
import {
  computeClientPaymentStatus,
  generateWhatsAppCobrançaUrl,
} from '../utils/statusUtils';

interface ClientsViewProps {
  clients: Client[];
  plans: Plan[];
  settings: PersonalSettings;
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onOpenPaymentModal: (client: Client) => void;
  onOpenPlansModal: () => void;
}

type FilterType = 'all' | 'overdue' | 'warning' | 'paid';

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  plans,
  settings,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onOpenPaymentModal,
  onOpenPlansModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Compute status for all clients
  const clientsWithStatus = clients.map((client) => {
    const status = computeClientPaymentStatus(client, settings.warningDaysBeforeDue);
    const plan = plans.find((p) => p.id === client.planId);
    return { client, status, plan };
  });

  const overdueCount = clientsWithStatus.filter((c) => c.status.status === 'overdue' && c.client.active).length;
  const warningCount = clientsWithStatus.filter((c) => c.status.status === 'warning' && c.client.active).length;
  const paidCount = clientsWithStatus.filter((c) => c.status.status === 'paid' && c.client.active).length;

  const filteredClients = clientsWithStatus.filter(({ client, status }) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'overdue') return status.status === 'overdue' && client.active;
    if (activeFilter === 'warning') return status.status === 'warning' && client.active;
    if (activeFilter === 'paid') return status.status === 'paid' && client.active;
    return true;
  });

  return (
    <div className="space-y-4 pb-28">
      {/* Barra de Título Superior */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Alunos & Planos</span>
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            {clients.length} {clients.length === 1 ? 'aluno cadastrado' : 'alunos cadastrados'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPlansModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] text-xs sm:text-sm font-bold text-[var(--text-secondary)] transition shadow-xs"
            title="Gerenciar Planos e Preços"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Planos</span>
          </button>

          <button
            id="clients-add-btn"
            onClick={onAddClient}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-md transition active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Aluno</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca com campo maior e ícone maior */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar aluno por nome, telefone..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm sm:text-base font-medium focus:outline-none focus:border-emerald-500 transition shadow-xs"
        />
      </div>

      {/* Filtros de Vencimento / Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs sm:text-sm">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition ${
            activeFilter === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold shadow-xs'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] font-semibold border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)]'
          }`}
        >
          Todos ({clients.length})
        </button>

        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition ${
            activeFilter === 'overdue'
              ? 'bg-rose-600 text-white font-extrabold shadow-xs'
              : 'bg-[var(--bg-card)] text-rose-600 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Inadimplentes ({overdueCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('warning')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition ${
            activeFilter === 'warning'
              ? 'bg-amber-600 text-white font-extrabold shadow-xs'
              : 'bg-[var(--bg-card)] text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900/60 hover:bg-amber-50'
          }`}
        >
          <span>Vencendo em breve ({warningCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('paid')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition ${
            activeFilter === 'paid'
              ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
              : 'bg-[var(--bg-card)] text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Em dia ({paidCount})</span>
        </button>
      </div>

      {/* Lista de Alunos */}
      {filteredClients.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-3xl p-8 sm:p-12 text-center border border-[var(--border-subtle)] shadow-xs">
          <p className="text-base sm:text-lg font-black text-[var(--text-primary)]">
            Nenhum aluno cadastrado ainda
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 mb-5 max-w-sm mx-auto">
            Basta tocar no botão abaixo, digitar o nome e salvar para começar!
          </p>
          <button
            onClick={onAddClient}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white text-sm sm:text-base font-black hover:bg-emerald-700 shadow-md transition"
          >
            <Plus className="w-5 h-5" />
            <span>Cadastrar Primeiro Aluno</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredClients.map(({ client, status, plan }) => {
            const isOverdue = status.status === 'overdue' && client.active;
            const isWarning = status.status === 'warning' && client.active;

            return (
              <div
                key={client.id}
                className={`bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 border transition-all duration-150 shadow-xs ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/10'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-900/80'
                    : 'border-[var(--border-subtle)] hover:border-emerald-500/40'
                }`}
              >
                {/* Linha superior: Aluno e Plano */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
                        {client.name}
                      </h3>
                      {!client.active && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                      {plan && (
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {plan.name} ({plan.daysPerWeek}d/sem)
                        </span>
                      )}
                      {plan && client.price > 0 && <span>•</span>}
                      {client.price > 0 && (
                        <span className="font-extrabold text-[var(--text-primary)]">
                          {formatCurrency(client.price)}/mês
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onEditClient(client)}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition"
                      title="Editar aluno"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteClient(client.id)}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Excluir aluno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vencimento e Status Automático */}
                <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${status.badgeClass}`}
                    >
                      {isOverdue && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                      <span>{status.label}</span>
                    </span>

                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      Todo dia {client.billingDay}
                    </span>
                  </div>

                  {/* Ações Rápidas: Dar Baixa e Cobrar no WhatsApp */}
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <a
                        href={generateWhatsAppCobrançaUrl(client, plan, settings)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                        title="Enviar cobrança educada com Pix no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Cobrar Pix</span>
                      </a>
                    )}

                    <button
                      onClick={() => onOpenPaymentModal(client)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-xs transition active:scale-95"
                      title="Dar baixa no pagamento e renovar vencimento"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Dar Baixa</span>
                    </button>
                  </div>
                </div>

                {/* Telefone e Notas */}
                {(client.phone || client.notes) && (
                  <div className="mt-2.5 text-xs text-[var(--text-secondary)] flex items-center justify-between gap-2">
                    {client.phone ? (
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)] font-medium">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        {client.phone}
                      </span>
                    ) : <span />}
                    {client.notes && (
                      <span className="truncate max-w-[220px] text-[var(--text-muted)] italic font-normal">
                        "{client.notes}"
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
