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

# Helper functions for JSON file operations
def read_json_file(file_path: Path) -> list:
    if not file_path.exists():
        return []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def write_json_file(file_path: Path, data: list):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

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
    expenses = read_json_file(EXPENSES_FILE)
    return expenses

@api_router.post("/expenses", response_model=Transaction)
async def create_expense(expense: TransactionCreate):
    expenses = read_json_file(EXPENSES_FILE)
    new_expense = Transaction(**expense.model_dump())
    expenses.append(new_expense.model_dump())
    write_json_file(EXPENSES_FILE, expenses)
    return new_expense

@api_router.put("/expenses/{expense_id}", response_model=Transaction)
async def update_expense(expense_id: str, expense: TransactionUpdate):
    expenses = read_json_file(EXPENSES_FILE)
    for idx, exp in enumerate(expenses):
        if exp['id'] == expense_id:
            update_data = expense.model_dump(exclude_unset=True)
            expenses[idx].update(update_data)
            write_json_file(EXPENSES_FILE, expenses)
            return Transaction(**expenses[idx])
    raise HTTPException(status_code=404, detail="Expense not found")

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    expenses = read_json_file(EXPENSES_FILE)
    expenses = [exp for exp in expenses if exp['id'] != expense_id]
    write_json_file(EXPENSES_FILE, expenses)
    return {"message": "Expense deleted successfully"}

# Debts endpoints
@api_router.get("/debts", response_model=List[Debt])
async def get_debts():
    debts = read_json_file(DEBTS_FILE)
    return debts

@api_router.post("/debts", response_model=Debt)
async def create_debt(debt: DebtCreate):
    debts = read_json_file(DEBTS_FILE)
    new_debt = Debt(**debt.model_dump())
    debts.append(new_debt.model_dump())
    write_json_file(DEBTS_FILE, debts)
    return new_debt

@api_router.put("/debts/{debt_id}", response_model=Debt)
async def update_debt(debt_id: str, debt: DebtUpdate):
    debts = read_json_file(DEBTS_FILE)
    for idx, d in enumerate(debts):
        if d['id'] == debt_id:
            update_data = debt.model_dump(exclude_unset=True)
            debts[idx].update(update_data)
            write_json_file(DEBTS_FILE, debts)
            return Debt(**debts[idx])
    raise HTTPException(status_code=404, detail="Debt not found")

@api_router.delete("/debts/{debt_id}")
async def delete_debt(debt_id: str):
    debts = read_json_file(DEBTS_FILE)
    debts = [d for d in debts if d['id'] != debt_id]
    write_json_file(DEBTS_FILE, debts)
    return {"message": "Debt deleted successfully"}

# Income endpoints
@api_router.get("/incomes", response_model=List[Income])
async def get_incomes():
    incomes = read_json_file(INCOMES_FILE)
    return incomes

@api_router.post("/incomes", response_model=Income)
async def create_income(income: IncomeCreate):
    incomes = read_json_file(INCOMES_FILE)
    new_income = Income(**income.model_dump())
    incomes.append(new_income.model_dump())
    write_json_file(INCOMES_FILE, incomes)
    return new_income

@api_router.put("/incomes/{income_id}", response_model=Income)
async def update_income(income_id: str, income: IncomeUpdate):
    incomes = read_json_file(INCOMES_FILE)
    for idx, inc in enumerate(incomes):
        if inc['id'] == income_id:
            update_data = income.model_dump(exclude_unset=True)
            incomes[idx].update(update_data)
            write_json_file(INCOMES_FILE, incomes)
            return Income(**incomes[idx])
    raise HTTPException(status_code=404, detail="Income not found")

@api_router.delete("/incomes/{income_id}")
async def delete_income(income_id: str):
    incomes = read_json_file(INCOMES_FILE)
    incomes = [inc for inc in incomes if inc['id'] != income_id]
    write_json_file(INCOMES_FILE, incomes)
    return {"message": "Income deleted successfully"}

# Summary endpoint
@api_router.get("/summary")
async def get_summary():
    expenses = read_json_file(EXPENSES_FILE)
    debts = read_json_file(DEBTS_FILE)
    incomes = read_json_file(INCOMES_FILE)
    
    total_income = sum(inc['value'] for inc in incomes)
    total_expenses = sum(exp['value'] for exp in expenses)
    total_debt = sum(d['total_amount'] - d['paid_amount'] for d in debts)
    total_committed = total_expenses + sum(d['installment_value'] for d in debts)
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
    expenses = read_json_file(EXPENSES_FILE)
    debts = read_json_file(DEBTS_FILE)
    incomes = read_json_file(INCOMES_FILE)
    
    return {
        "expenses": expenses,
        "debts": debts,
        "incomes": incomes
    }

# Automation endpoint
@api_router.post("/roll-month")
async def roll_month():
    expenses = read_json_file(EXPENSES_FILE)
    debts = read_json_file(DEBTS_FILE)
    incomes = read_json_file(INCOMES_FILE)
    
    new_expenses = []
    # Clone fixed expenses
    fixed_expenses = [exp for exp in expenses if exp.get('is_fixed')]
    for exp in fixed_expenses:
        try:
            d, m, y = map(int, exp['due_date'].split('/'))
            # Simple month increment
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
    updated_debts = []
    for debt in debts:
        new_paid = min(debt['paid_amount'] + debt['installment_value'], debt['total_amount'])
        debt['paid_amount'] = new_paid
        updated_debts.append(debt)
        
    # Process incomes: Assume all current incomes are recurring for simplicity or user can delete later
    # Alternatively, just clone them to next month
    new_incomes = []
    for inc in incomes:
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

    # Save everything (appending new ones, updating debts)
    expenses.extend(new_expenses)
    write_json_file(EXPENSES_FILE, expenses)
    
    write_json_file(DEBTS_FILE, updated_debts)
    
    incomes.extend(new_incomes)
    write_json_file(INCOMES_FILE, incomes)
    
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
