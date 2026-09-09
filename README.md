# BoraTreinar 💪

> Sistema completo e responsivo (Mobile-First) para Personal Trainers gerenciarem seus agendamentos, planos de alunos, controle de vencimentos e relatórios de inadimplência com cobrança em 1 clique via WhatsApp.

Repositório oficial: [https://github.com/ITorresz/boraTreinar](https://github.com/ITorresz/boraTreinar)

---

## 🚀 Funcionalidades

### 1. 📅 Agenda de Aulas & Treinos
- Visão diária e semanal com navegação fluida.
- Agendamento de sessões individuais ou de **todo o mês de uma só vez** com base na frequência semanal do plano.
- **Bloqueio automático de horários duplicados** para evitar conflitos de agenda entre alunos.
- Visualização de status (Agendado / Concluído).
- **Badge financeiro inteligente**: visualize no próprio treino do dia se a mensalidade do aluno está Em Dia, Vencendo ou Inadimplente.
- Atalho para envio de confirmação e lembrete de aula via WhatsApp.

### 2. 👥 Gestão de Alunos & Planos
- Cadastro completo com Nome, WhatsApp, E-mail, Plano contratado, Valor e Dia de Vencimento (1 a 31).
- Planos flexíveis customizáveis (ex: 2x, 3x, 5x na semana, avulso).
- Edição rápida e inativação de alunos.

### 3. ⚙️ Controle Automático de Vencimentos & Renovação
- Cálculo automático do status de pagamento:
  - **Em Dia**: Vencimento futuro regular.
  - **Vencendo**: Alerta visual nos dias que antecedem a data.
  - **Inadimplente**: Contagem exata de dias em atraso.
- **Baixa Automática de Pagamento**: ao registrar o pagamento (Pix, Cartão, Dinheiro), o sistema renova a data de vencimento para o mês seguinte e registra o histórico de caixa.

### 4. 📊 Relatório Financeiro & Inadimplência
- Métricas em tempo real: Total recebido, Total pendente em atraso, Previsão mensal e Taxa de adimplência.
- **Cobrança em 1 clique no WhatsApp**: mensagem profissional personalizada com nome, valor, dias de atraso e chave Pix.
- **Exportação de Relatórios**: Impressão/PDF limpo, exportação em CSV para planilhas e cópia de resumo textual.

### 5. 🌓 Modo Escuro e Claro
- Paleta profissional com variáveis CSS e suporte total a temas Claro e Escuro.

---

## 🛠️ Tecnologias Utilizadas

- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Vite**
- **Lucide Icons**

---

## 💻 Como Rodar Localmente

1. Clone o repositório ou faça o download dos arquivos:
```bash
git clone https://github.com/ITorresz/boraTreinar.git
cd boraTreinar
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra no navegador:
```
http://localhost:3000
```

---

## 📤 Como Enviar para o seu GitHub (Terminal do VS Code)

Se você estiver na pasta do projeto no VS Code:

```bash
git init
git add .
git commit -m "feat: lancamento do BoraTreinar"
git branch -M main
git remote add origin https://github.com/ITorresz/boraTreinar.git
git push -u origin main
```
