import uuid
from sqlalchemy import Column, String, ForeignKey, Float, DateTime, Enum, Numeric, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

# Use standard UUID type from SQLAlchemy if available (>= 1.4), or fallback to String/Char for SQLite
from sqlalchemy.types import Uuid as SQLAlchemyUUID

class SplitType(str, enum.Enum):
    EQUAL = "EQUAL"
    EXACT = "EXACT"
    PERCENT = "PERCENT"

class User(Base):
    __tablename__ = "users"

    id = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String)
    avatar_url = Column(String)

    groups_created = relationship("Group", back_populates="creator")
    memberships = relationship("GroupMember", back_populates="user")
    expenses_paid = relationship("Expense", back_populates="payer")
    expense_splits = relationship("ExpenseSplit", back_populates="user")

class Group(Base):
    __tablename__ = "groups"

    id = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_by_user_id = Column(SQLAlchemyUUID(as_uuid=True), ForeignKey("users.id"))

    creator = relationship("User", back_populates="groups_created")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="group", cascade="all, delete-orphan")

class GroupMember(Base):
    __tablename__ = "group_members"

    group_id = Column(SQLAlchemyUUID(as_uuid=True), ForeignKey("groups.id"), primary_key=True)
    user_id = Column(SQLAlchemyUUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="memberships")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(SQLAlchemyUUID(as_uuid=True), ForeignKey("groups.id"), nullable=False)
    payer_id = Column(SQLAlchemyUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    # SQLite doesn't strictly enforce Numeric precision but it's good for PG
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(String)
    split_type = Column(String, nullable=False) # Store enum as string
    date = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="expenses")
    payer = relationship("User", back_populates="expenses_paid")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    expense_id = Column(SQLAlchemyUUID(as_uuid=True), ForeignKey("expenses.id"), primary_key=True)
    user_id = Column(SQLAlchemyUUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    amount_owed = Column(Numeric(10, 2), nullable=False)

    expense = relationship("Expense", back_populates="splits")
    user = relationship("User", back_populates="expense_splits")
