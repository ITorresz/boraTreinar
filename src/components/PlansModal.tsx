import React, { useState } from 'react';
import { X, Plus, Dumbbell, Trash2, Edit2 } from 'lucide-react';
import { Plan } from '../types';
import { formatCurrency } from '../utils/dateUtils';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: Plan[];
  onSavePlan: (plan: Plan) => void;
  onDeletePlan: (planId: string) => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  plans,
  onSavePlan,
  onDeletePlan,
}) => {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [defaultPrice, setDefaultPrice] = useState<number>(450);
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setName('');
    setDaysPerWeek(3);
    setDefaultPrice(450);
    setDescription('');
    setIsAdding(true);
    setEditingPlanId(null);
  };

  const handleStartEdit = (p: Plan) => {
    setEditingPlanId(p.id);
    setName(p.name);
    setDaysPerWeek(p.daysPerWeek);
    setDefaultPrice(p.defaultPrice);
    setDescription(p.description);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSavePlan({
      id: editingPlanId || `plan-${Date.now()}`,
      name: name.trim(),
      daysPerWeek: Number(daysPerWeek),
      defaultPrice: Number(defaultPrice),
      description: description.trim(),
      badgeColor: 'emerald',
    });

    setIsAdding(false);
    setEditingPlanId(null);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-[var(--bg-surface)] rounded-t-3xl sm:rounded-3xl border border-[var(--border-subtle)] shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between sticky top-0 bg-[var(--bg-surface)] z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Dumbbell className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                Planos & Preços
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                Tabela de planos oferecidos
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

        <div className="p-6 space-y-4">
          {!isAdding && !editingPlanId && (
            <button
              onClick={handleStartAdd}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 text-sm font-black flex items-center justify-center gap-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Criar Novo Plano de Treino</span>
            </button>
          )}

          {(isAdding || editingPlanId) && (
            <form onSubmit={handleSave} className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border-subtle)] space-y-4 animate-fadeIn">
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                {editingPlanId ? 'Editar Plano' : 'Novo Plano'}
              </h3>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1">
                  Nome do Plano *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Musculação 5x na Semana"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-bold focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1">
                    Dias / Semana
                  </label>
                  <select
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-bold focus:outline-none focus:border-emerald-500 transition"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <option key={d} value={d}>
                        {d} {d === 1 ? 'dia' : 'dias'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1">
                    Preço Mensal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-bold focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[var(--text-secondary)] mb-1">
                  Descrição do Serviço
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Treinos com periodização"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingPlanId(null);
                  }}
                  className="flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs sm:text-sm rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          {/* Lista de Planos Existentes */}
          <div className="space-y-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-[var(--text-primary)] truncate">
                      {p.name}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {p.daysPerWeek}x / sem
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 truncate font-medium">
                    {p.description || 'Sem descrição'}
                  </p>
                  <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(p.defaultPrice)} / mês
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition"
                    title="Editar plano"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {plans.length > 1 && (
                    <button
                      onClick={() => onDeletePlan(p.id)}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Excluir plano"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
