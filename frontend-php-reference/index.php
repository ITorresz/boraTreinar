<?php
/**
 * Frontend de Referência em PHP
 * Personal Trainer Agenda & Controle Financeiro de Inadimplência
 * 
 * Este arquivo demonstra como rodar uma interface simples em PHP com
 * suporte a Modo Escuro/Claro via variáveis CSS e conexão ao backend Python.
 */

$apiUrl = "http://localhost:8000/api";
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Personal Trainer - Gestão & Agenda (PHP/Python)</title>
    <style>
        :root {
            --bg-app: #f8fafc;
            --bg-surface: #ffffff;
            --bg-card: #ffffff;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --primary: #10b981;
            --border-subtle: #e2e8f0;
            --danger-bg: #fef2f2;
            --danger-text: #b91c1c;
        }

        [data-theme="dark"] {
            --bg-app: #090d16;
            --bg-surface: #111827;
            --bg-card: #141e33;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --primary: #10b981;
            --border-subtle: #1e293b;
            --danger-bg: #450a0a;
            --danger-text: #fecaca;
        }

        body {
            background-color: var(--bg-app);
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 16px;
            padding-bottom: 80px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-surface);
            padding: 12px 16px;
            border-radius: 16px;
            border: 1px solid var(--border-subtle);
            margin-bottom: 16px;
        }

        .card {
            background: var(--bg-card);
            border-radius: 16px;
            border: 1px solid var(--border-subtle);
            padding: 16px;
            margin-bottom: 12px;
        }

        .card-danger {
            background: var(--danger-bg);
            color: var(--danger-text);
            border: 1px solid #fca5a5;
        }

        .btn {
            background: var(--primary);
            color: white;
            padding: 8px 14px;
            border-radius: 10px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1 style="font-size: 16px; margin: 0;">Personal Agenda (PHP Frontend)</h1>
            <small style="color: var(--text-secondary);">Integrado ao Backend Python</small>
        </div>
        <button class="btn" onclick="toggleTheme()">🌓 Alternar Tema</button>
    </div>

    <div class="card card-danger">
        <h3 style="margin-top: 0;">⚠️ Relatório de Inadimplência</h3>
        <p>Controle automático de vencimentos de planos (ex: Plano 5 Dias, Plano 3x).</p>
        <p>Consulte os dados no backend Python via rota <code>/api/reports/inadimplencia</code>.</p>
    </div>

    <script>
        function toggleTheme() {
            const html = document.documentElement;
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        }

        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    </script>
</body>
</html>
