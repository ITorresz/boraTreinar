import React, { useState } from 'react';
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Check,
} from 'lucide-react';
import { PersonalSettings } from '../types';

interface SettingsViewProps {
  settings: PersonalSettings;
  onSaveSettings: (newSettings: PersonalSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onExportBackup,
  onImportBackup,
  onResetDemoData,
}) => {
  const [formData, setFormData] = useState<PersonalSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
  };

  return (
    <div className="space-y-5 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>Configurações & Chave Pix</span>
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Ajuste seus dados para o WhatsApp de cobrança automática
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-5 shadow-xs">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--text-secondary)]">
          Dados do Personal Trainer
        </h3>

        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Seu Nome Profissional *</span>
          </label>
          <input
            type="text"
            value={formData.trainerName}
            onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
            placeholder="Digite seu nome ou estúdio..."
            required
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Chave Pix para Recebimento *</span>
            </label>
            <input
              type="text"
              value={formData.pixKey}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              placeholder="Ex: seu-pix@email.com ou CPF"
              required
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
              Tipo de Chave Pix
            </label>
            <select
              value={formData.pixKeyType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pixKeyType: e.target.value as PersonalSettings['pixKeyType'],
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="cpf">CPF</option>
              <option value="email">E-mail</option>
              <option value="celular">Celular</option>
              <option value="aleatoria">Chave Aleatória</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Avisar Vencimento com Antecedência (Dias)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 3, 5].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setFormData({ ...formData, warningDaysBeforeDue: d })}
                className={`py-3 text-xs sm:text-sm rounded-2xl font-bold border transition ${
                  formData.warningDaysBeforeDue === d
                    ? 'bg-emerald-600 text-white border-emerald-600 font-black shadow-xs'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                {d} {d === 1 ? 'dia antes' : 'dias antes'}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 font-medium">
            Alunos com vencimento dentro deste período aparecerão em alerta amarelo ("Vencendo em breve").
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-black transition shadow-md flex items-center justify-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-5 h-5 text-white" />
              <span>Configurações Salvas com Sucesso!</span>
            </>
          ) : (
            <span>Salvar Alterações</span>
          )}
        </button>
      </form>

      {/* Backup e Exportação */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-xs">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Backup & Segurança dos Dados</span>
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          Seus dados ficam gravados com segurança no seu dispositivo. Você pode exportar uma cópia a qualquer momento para guardar ou migrar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={onExportBackup}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] hover:bg-[var(--border-subtle)] text-xs sm:text-sm font-bold text-[var(--text-primary)] transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar Backup (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] hover:bg-[var(--border-subtle)] text-xs sm:text-sm font-bold text-[var(--text-primary)] transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Restaurar Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={onResetDemoData}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 transition font-bold"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Limpar Tudo (Zerar Todos os Dados)</span>
        </button>
      </div>
    </div>
  );
};
