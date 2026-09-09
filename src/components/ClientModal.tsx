import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Dumbbell,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';
import { Client, Plan } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => void;
  clientToEdit?: Client | null;
  plans: Plan[];
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
  plans,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState('');
  const [billingDay, setBillingDay] = useState<number>(10);
  const [dueDate, setDueDate] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setPhone(clientToEdit.phone || '');
      setEmail(clientToEdit.email || '');
      setPlanId(clientToEdit.planId || (plans[0]?.id ?? ''));
      setBillingDay(clientToEdit.billingDay || 10);
      setDueDate(clientToEdit.dueDate || getTodayDateString());
      setPrice(clientToEdit.price || 0);
      setNotes(clientToEdit.notes || '');
      setActive(clientToEdit.active ?? true);
      setShowAdvanced(true); // Se estiver editando, exibe os campos
    } else {
      setName('');
      setPhone('');
      setEmail('');
      const defaultPlan = plans[0];
      if (defaultPlan) {
        setPlanId(defaultPlan.id);
        setPrice(defaultPlan.defaultPrice);
      } else {
        setPlanId('');
        setPrice(0);
      }
      setBillingDay(10);
      
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      setDueDate(`${y}-${m}-10`);
      setNotes('');
      setActive(true);
      setShowAdvanced(false); // No cadastro novo: foco total no nome!
    }
  }, [clientToEdit, isOpen, plans]);

  const handlePlanSelect = (selectedId: string) => {
    setPlanId(selectedId);
    const plan = plans.find((p) => p.id === selectedId);
    if (plan) {
      setPrice(plan.defaultPrice);
    }
  };

  const handleBillingDayChange = (dayNum: number) => {
    setBillingDay(dayNum);
    const currentDueDate = dueDate || getTodayDateString();
    const [y, m] = currentDueDate.split('-');
    const formattedDay = String(dayNum).padStart(2, '0');
    setDueDate(`${y}-${m}-${formattedDay}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Salva imediatamente com o nome digitado, sem nenhuma validação que bloqueie
    const finalName = name.trim() || 'Novo Aluno';
    const finalPlanId = planId || (plans[0]?.id ?? '');
    const finalDueDate = dueDate || getTodayDateString();

    onSave({
      id: clientToEdit ? clientToEdit.id : `client-${Date.now()}`,
      name: finalName,
      phone: phone.trim(),
      email: email.trim(),
      planId: finalPlanId,
      billingDay: Number(billingDay) || 10,
      dueDate: finalDueDate,
      price: Number(price) || 0,
      notes: notes.trim(),
      active,
      createdAt: clientToEdit ? clientToEdit.createdAt : getTodayDateString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-xl bg-[var(--bg-surface)] rounded-t-3xl sm:rounded-3xl border border-[var(--border-subtle)] shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Cabeçalho com tipografia e ícones maiores */}
        <div className="sticky top-0 bg-[var(--bg-surface)] px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {clientToEdit ? 'Editar Aluno' : 'Cadastrar Aluno'}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-medium">
                Digite o nome e salve direto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Formulário com campos maiores e confortáveis */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5 flex-1">
          {/* Campo Nome - Destaque principal com fonte e altura ampliadas */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Nome do Aluno</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do aluno aqui..."
              autoFocus
              className="w-full px-5 py-4 rounded-2xl border-2 border-emerald-500/40 focus:border-emerald-500 bg-[var(--bg-card)] text-[var(--text-primary)] text-base sm:text-lg font-bold shadow-xs focus:outline-none transition"
            />
            <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Pronto! Basta colocar o nome e tocar em "Salvar Aluno".</span>
            </p>
          </div>

          {/* Botão de Salvar Imediato em Destaque */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-base sm:text-lg font-black shadow-lg transition flex items-center justify-center gap-2.5"
          >
            <CheckCircle className="w-6 h-6" />
            <span>{clientToEdit ? 'Salvar Alterações' : 'Salvar Aluno Agora'}</span>
          </button>

          {/* Seção Expansível Opcional: Detalhes Adicionais */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-3 px-4 rounded-2xl bg-[var(--bg-muted)] hover:bg-[var(--bg-muted)]/80 text-xs sm:text-sm font-bold text-[var(--text-secondary)] flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>Preencher WhatsApp, Plano ou Mensalidade (Opcional)</span>
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-fadeIn">
                {/* Telefone e Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      WhatsApp / Celular
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: (11) 98765-4321"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Plano Opcional */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-emerald-600" />
                    Plano de Treinos (Opcional)
                  </label>
                  <select
                    value={planId}
                    onChange={(e) => handlePlanSelect(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="">Sem plano específico / Padrão</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.daysPerWeek} dias/semana (R$ {p.defaultPrice.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valor da Mensalidade e Dia de Pagamento */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Mensalidade (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={price || ''}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold text-sm sm:text-base focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      Dia Vencimento
                    </label>
                    <select
                      value={billingDay}
                      onChange={(e) => handleBillingDayChange(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          Todo dia {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Data do Vencimento */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Data do Próximo Vencimento
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Observações
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Objetivos, restrições ou notas..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-emerald-500 transition resize-none"
                  />
                </div>

                {/* Status Ativo */}
                <div className="flex items-center justify-between py-2 border-t border-[var(--border-subtle)]">
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    Aluno Ativo
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Botão de Cancelar */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-2xl border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
