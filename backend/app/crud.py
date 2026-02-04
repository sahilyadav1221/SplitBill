from sqlalchemy.orm import Session
from sqlalchemy import select
from . import models, schemas
from .auth_utils import get_password_hash
import uuid

# --- USER ---
def get_user(db: Session, user_id: uuid.UUID):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        name=user.name,
        avatar_url=user.avatar_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- GROUP ---
def get_group(db: Session, group_id: uuid.UUID):
    return db.query(models.Group).filter(models.Group.id == group_id).first()

def get_groups_for_user(db: Session, user_id: uuid.UUID):
    # This query joins GroupMember to find groups a user belongs to
    return db.query(models.Group).join(models.GroupMember).filter(models.GroupMember.user_id == user_id).all()

def create_group(db: Session, group: schemas.GroupCreate, user_id: uuid.UUID):
    db_group = models.Group(name=group.name, created_by_user_id=user_id)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # Add creator as a member automatically
    add_user_to_group(db, group_id=db_group.id, user_id=user_id)
    
    return db_group

def add_user_to_group(db: Session, group_id: uuid.UUID, user_id: uuid.UUID):
    db_member = models.GroupMember(group_id=group_id, user_id=user_id)
    db.add(db_member)
    db.commit()
    return db_member
