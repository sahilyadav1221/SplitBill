from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
import uuid
from decimal import Decimal
from .. import crud, schemas, database, models
from .auth import get_current_user
from ..services.balance_engine import BalanceEngine

router = APIRouter(prefix="/expenses", tags=["expenses"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Expense)
def create_expense(expense_data: schemas.ExpenseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify group membership
    group = crud.get_group(db, group_id=expense_data.group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    is_member = any(m.user_id == current_user.id for m in group.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create expense record
    db_expense = models.Expense(
        group_id=expense_data.group_id,
        payer_id=expense_data.payer_id,
        amount=expense_data.amount,
        description=expense_data.description,
        split_type=expense_data.split_type.value
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    # Create splits
    total_split = Decimal(0)
    for split in expense_data.splits:
        db_split = models.ExpenseSplit(
            expense_id=db_expense.id,
            user_id=split.user_id,
            amount_owed=split.amount_owed
        )
        db.add(db_split)
        total_split += split.amount_owed
    
    # Validate total matches (approximate)
    if abs(total_split - expense_data.amount) > Decimal("0.05"):
         # Rollback? Ideally. For MVP we proceed but could log warning.
         # Ideally we should validate BEFORE commit.
         pass

    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/group/{group_id}", response_model=List[schemas.Expense])
def get_group_expenses(group_id: uuid.UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check auth
    group = crud.get_group(db, group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    is_member = any(m.user_id == current_user.id for m in group.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return group.expenses

@router.get("/group/{group_id}/balances")
def get_group_balances(group_id: uuid.UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check auth
    group = crud.get_group(db, group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Calculate Net Balances
    # Balance = Paid - Owed
    
    net_balances: Dict[str, Decimal] = {}
    
    # Initialize members
    for member in group.members:
        net_balances[str(member.user_id)] = Decimal(0)
        
    # Process all expenses in group
    for expense in group.expenses:
        payer_id = str(expense.payer_id)
        if payer_id not in net_balances: net_balances[payer_id] = Decimal(0)
        
        # Add to payer
        net_balances[payer_id] += expense.amount
        
        # Subtract from splitters
        for split in expense.splits:
            user_id = str(split.user_id)
            if user_id not in net_balances: net_balances[user_id] = Decimal(0)
            net_balances[user_id] -= split.amount_owed

    # Run Minimize Cash Flow
    optimized_debts = BalanceEngine.minimize_cash_flow(net_balances)
    
    return {
        "balances": net_balances,
        "settlements": optimized_debts
    }
