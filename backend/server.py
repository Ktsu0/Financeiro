from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import json
from fastapi.responses import FileResponse

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Data directory for JSON storage
DATA_DIR = ROOT_DIR / 'data'
DATA_DIR.mkdir(exist_ok=True)

# JSON file paths
EXPENSES_FILE = DATA_DIR / 'expenses.json'
DEBTS_FILE = DATA_DIR / 'debts.json'
INCOMES_FILE = DATA_DIR / 'incomes.json'

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Optimized Data store with in-memory caching
class DataStore:
    def __init__(self):
        self.expenses = self._load(EXPENSES_FILE)
        self.debts = self._load(DEBTS_FILE)
        self.incomes = self._load(INCOMES_FILE)

    def _load(self, file_path: Path) -> list:
        if not file_path.exists():
            return []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

    def save_expenses(self):
        self._write(EXPENSES_FILE, self.expenses)

    def save_debts(self):
        self._write(DEBTS_FILE, self.debts)

    def save_incomes(self):
        self._write(INCOMES_FILE, self.incomes)

    def save_all(self):
        self.save_expenses()
        self.save_debts()
        self.save_incomes()

    def _write(self, file_path: Path, data: list):
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

store = DataStore()

# Models
class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    value: float
    due_date: str  # DD/MM/YYYY format
    status: str = "pending"  # pending or paid
    is_fixed: bool = False  # For recurring expenses
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TransactionCreate(BaseModel):
    name: str
    category: str
    value: float
    due_date: str
    status: str = "pending"
    is_fixed: bool = False

class TransactionUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    value: Optional[float] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    is_fixed: Optional[bool] = None

class Debt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    total_amount: float
    paid_amount: float = 0.0
    installment_value: float
    due_date: str  # DD/MM/YYYY
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DebtCreate(BaseModel):
    name: str
    total_amount: float
    paid_amount: float = 0.0
    installment_value: float
    due_date: str

class DebtUpdate(BaseModel):
    name: Optional[str] = None
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    installment_value: Optional[float] = None
    due_date: Optional[str] = None

class Income(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    value: float
    date: str  # DD/MM/YYYY
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class IncomeCreate(BaseModel):
    name: str
    value: float
    date: str

class IncomeUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[float] = None
    date: Optional[str] = None

# Expenses endpoints
@api_router.get("/expenses", response_model=List[Transaction])
async def get_expenses():
    return store.expenses

@api_router.post("/expenses", response_model=Transaction)
async def create_expense(expense: TransactionCreate):
    new_expense = Transaction(**expense.model_dump())
    store.expenses.append(new_expense.model_dump())
    store.save_expenses()
    return new_expense

@api_router.put("/expenses/{expense_id}", response_model=Transaction)
async def update_expense(expense_id: str, expense: TransactionUpdate):
    for idx, exp in enumerate(store.expenses):
        if exp['id'] == expense_id:
            update_data = expense.model_dump(exclude_unset=True)
            store.expenses[idx].update(update_data)
            store.save_expenses()
            return Transaction(**store.expenses[idx])
    raise HTTPException(status_code=404, detail="Expense not found")

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    store.expenses = [exp for exp in store.expenses if exp['id'] != expense_id]
    store.save_expenses()
    return {"message": "Expense deleted successfully"}

# Debts endpoints
@api_router.get("/debts", response_model=List[Debt])
async def get_debts():
    return store.debts

@api_router.post("/debts", response_model=Debt)
async def create_debt(debt: DebtCreate):
    new_debt = Debt(**debt.model_dump())
    store.debts.append(new_debt.model_dump())
    store.save_debts()
    return new_debt

@api_router.put("/debts/{debt_id}", response_model=Debt)
async def update_debt(debt_id: str, debt: DebtUpdate):
    for idx, d in enumerate(store.debts):
        if d['id'] == debt_id:
            update_data = debt.model_dump(exclude_unset=True)
            store.debts[idx].update(update_data)
            store.save_debts()
            return Debt(**store.debts[idx])
    raise HTTPException(status_code=404, detail="Debt not found")

@api_router.delete("/debts/{debt_id}")
async def delete_debt(debt_id: str):
    store.debts = [d for d in store.debts if d['id'] != debt_id]
    store.save_debts()
    return {"message": "Debt deleted successfully"}

# Income endpoints
@api_router.get("/incomes", response_model=List[Income])
async def get_incomes():
    return store.incomes

@api_router.post("/incomes", response_model=Income)
async def create_income(income: IncomeCreate):
    new_income = Income(**income.model_dump())
    store.incomes.append(new_income.model_dump())
    store.save_incomes()
    return new_income

@api_router.put("/incomes/{income_id}", response_model=Income)
async def update_income(income_id: str, income: IncomeUpdate):
    for idx, inc in enumerate(store.incomes):
        if inc['id'] == income_id:
            update_data = income.model_dump(exclude_unset=True)
            store.incomes[idx].update(update_data)
            store.save_incomes()
            return Income(**store.incomes[idx])
    raise HTTPException(status_code=404, detail="Income not found")

@api_router.delete("/incomes/{income_id}")
async def delete_income(income_id: str):
    store.incomes = [inc for inc in store.incomes if inc['id'] != income_id]
    store.save_incomes()
    return {"message": "Income deleted successfully"}

# Summary endpoint
@api_router.get("/summary")
async def get_summary():
    total_income = sum(inc['value'] for inc in store.incomes)
    total_expenses = sum(exp['value'] for exp in store.expenses)
    total_debt = sum(d['total_amount'] - d['paid_amount'] for d in store.debts)
    total_committed = total_expenses + sum(d['installment_value'] for d in store.debts)
    available_salary = total_income - total_committed
    
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_debt": total_debt,
        "total_committed": total_committed,
        "available_salary": available_salary
    }

# Export endpoints
@api_router.get("/export/csv")
async def export_csv():
    # This will return all data for frontend to process
    return {
        "expenses": store.expenses,
        "debts": store.debts,
        "incomes": store.incomes
    }

# Automation endpoint
@api_router.post("/roll-month")
async def roll_month():
    new_expenses = []
    # Clone fixed expenses
    fixed_expenses = [exp for exp in store.expenses if exp.get('is_fixed')]
    for exp in fixed_expenses:
        try:
            d, m, y = map(int, exp['due_date'].split('/'))
            new_m = m + 1
            new_y = y
            if new_m > 12:
                new_m = 1
                new_y += 1
            
            new_due_date = f"{d:02d}/{new_m:02d}/{new_y}"
            
            new_exp = exp.copy()
            new_exp['id'] = str(uuid.uuid4())
            new_exp['due_date'] = new_due_date
            new_exp['status'] = 'pending'
            new_exp['created_at'] = datetime.now(timezone.utc).isoformat()
            new_expenses.append(new_exp)
        except Exception as e:
            logger.error(f"Error rolling expense {exp['name']}: {e}")

    # Process debts: Add installment to paid_amount
    for debt in store.debts:
        debt['paid_amount'] = min(debt['paid_amount'] + debt['installment_value'], debt['total_amount'])
        
    # Process incomes
    new_incomes = []
    for inc in store.incomes:
        try:
            d, m, y = map(int, inc['date'].split('/'))
            new_m = m + 1
            new_y = y
            if new_m > 12:
                new_m = 1
                new_y += 1
            new_date = f"{d:02d}/{new_m:02d}/{new_y}"
            
            new_inc = inc.copy()
            new_inc['id'] = str(uuid.uuid4())
            new_inc['date'] = new_date
            new_inc['created_at'] = datetime.now(timezone.utc).isoformat()
            new_incomes.append(new_inc)
        except Exception as e:
            logger.error(f"Error rolling income {inc['name']}: {e}")

    # Save everything
    store.expenses.extend(new_expenses)
    store.incomes.extend(new_incomes)
    store.save_all()
    
    return {
        "message": "Próximo mês iniciado com sucesso!",
        "added_expenses": len(new_expenses),
        "updated_debts": len(updated_debts),
        "added_incomes": len(new_incomes)
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
