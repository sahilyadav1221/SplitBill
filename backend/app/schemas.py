from pydantic import BaseModel, EmailStr, UUID4, Field
from typing import List, Optional, Literal
from datetime import datetime
from decimal import Decimal
from enum import Enum

class SplitType(str, Enum):
    EQUAL = "EQUAL"
    EXACT = "EXACT"
    PERCENT = "PERCENT"

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: UUID4
    
    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Expense Split Schemas ---
class ExpenseSplitBase(BaseModel):
    user_id: UUID4
    amount_owed: Decimal

class ExpenseSplitCreate(ExpenseSplitBase):
    pass

class ExpenseSplit(ExpenseSplitBase):
    expense_id: UUID4
    
    class Config:
        from_attributes = True

# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    amount: Decimal
    description: Optional[str] = None
    split_type: SplitType
    group_id: UUID4

class ExpenseCreate(ExpenseBase):
    payer_id: UUID4
    splits: List[ExpenseSplitCreate]

    # Validation to ensure splits match total amount could go here
    # but might be complex for 'EQUAL' type on instantiation

class Expense(ExpenseBase):
    id: UUID4
    payer_id: UUID4
    date: datetime
    splits: List[ExpenseSplit] = []

    class Config:
        from_attributes = True

# --- Group Schemas ---
class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    pass

class GroupMember(BaseModel):
    user: User
    joined_at: datetime
    
    class Config:
        from_attributes = True

class Group(GroupBase):
    id: UUID4
    created_by_user_id: Optional[UUID4] = None
    members: List[GroupMember] = []
    # expenses: List[Expense] = [] # Optional to include expenses in detail view

    class Config:
        from_attributes = True

# --- AI Schemas ---
class ParseExpenseRequest(BaseModel):
    text: str
    group_id: UUID4

class SplitSuggestion(BaseModel):
    user_name: str
    amount: Decimal

class ParsedExpense(BaseModel):
    amount: Decimal
    description: str
    payer_name: str
    involved_users: List[str]
    split_type: Optional[SplitType] = SplitType.EQUAL


class AddMemberRequest(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
