"""
Backend em Python (FastAPI + SQLite/PostgreSQL)
Personal Trainer Agenda & Gestão Financeira com Controle Automático de Vencimentos

Para rodar localmente:
    pip install fastapi uvicorn pydantic
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timedelta

app = FastAPI(title="Personal Trainer Agenda & Finanças API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class Plan(BaseModel):
    id: str
    name: str
    days_per_week: int
    default_price: float
    description: Optional[str] = None

class Client(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    plan_id: str
    billing_day: int
    due_date: str  # YYYY-MM-DD
    price: float
    active: bool = True
    notes: Optional[str] = None

class Appointment(BaseModel):
    id: str
    client_id: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    duration_minutes: int = 60
    service_type: str
    status: str = "scheduled"  # scheduled, completed, cancelled
    location: Optional[str] = None

class PaymentRecord(BaseModel):
    id: str
    client_id: str
    client_name: str
    amount: float
    payment_date: str
    reference_month: str
    payment_method: str = "pix"
    notes: Optional[str] = None

# Banco de dados em memória (exemplo simples que pode ser trocado por SQLite ou PostgreSQL via SQLAlchemy)
DB = {
    "plans": [
        {"id": "plan-5dias", "name": "Plano 5 Dias / Semana", "days_per_week": 5, "default_price": 650.0},
        {"id": "plan-3dias", "name": "Plano 3x na Semana", "days_per_week": 3, "default_price": 480.0},
        {"id": "plan-2dias", "name": "Plano 2x na Semana", "days_per_week": 2, "default_price": 350.0},
    ],
    "clients": [],
    "appointments": [],
    "payments": []
}

@app.get("/api/plans", response_model=List[Plan])
def get_plans():
    return DB["plans"]

@app.get("/api/clients", response_model=List[Client])
def get_clients():
    return DB["clients"]

@app.post("/api/clients", response_model=Client)
def create_client(client: Client):
    DB["clients"].append(client.dict())
    return client

@app.get("/api/reports/inadimplencia")
def get_inadimplencia_report():
    """
    Gera automaticamente o relatório de inadimplência comparando o vencimento com a data de hoje.
    """
    today = date.today()
    delinquents = []
    total_inadimplente = 0.0

    for c in DB["clients"]:
        if not c.get("active", True):
            continue
        due = datetime.strptime(c["due_date"], "%Y-%m-%d").date()
        if due < today:
            days_overdue = (today - due).days
            delinquents.append({
                "client_id": c["id"],
                "name": c["name"],
                "phone": c["phone"],
                "due_date": c["due_date"],
                "days_overdue": days_overdue,
                "amount": c["price"]
            })
            total_inadimplente += c["price"]

    return {
        "report_date": today.isoformat(),
        "total_inadimplente": total_inadimplente,
        "delinquent_count": len(delinquents),
        "clients": sorted(delinquents, key=lambda x: x["days_overdue"], reverse=True)
    }

@app.post("/api/payments/dar-baixa")
def dar_baixa_pagamento(payment: PaymentRecord, advance_due_date: bool = True):
    """
    Registra o pagamento e atualiza automaticamente a data de vencimento do aluno para o próximo mês.
    """
    DB["payments"].append(payment.dict())

    if advance_due_date:
        for c in DB["clients"]:
            if c["id"] == payment.client_id:
                # Avançar 1 mês
                current_due = datetime.strptime(c["due_date"], "%Y-%m-%d").date()
                year = current_due.year + (1 if current_due.month == 12 else 0)
                month = 1 if current_due.month == 12 else current_due.month + 1
                day = min(c["billing_day"], 28) # Simplificado
                next_due = date(year, month, day)
                c["due_date"] = next_due.isoformat()
                c["last_payment_date"] = payment.payment_date
                break

    return {"status": "success", "message": "Pagamento registrado com sucesso!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
