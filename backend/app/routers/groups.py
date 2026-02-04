from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from .. import crud, schemas, database, models
from .auth import get_current_user

router = APIRouter(prefix="/groups", tags=["groups"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_group(db=db, group=group, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Group])
def read_groups(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_groups_for_user(db, user_id=current_user.id)

@router.get("/{group_id}", response_model=schemas.Group)
def read_group(group_id: uuid.UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = crud.get_group(db, group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    # Verify membership
    is_member = any(m.user_id == current_user.id for m in group.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not authorized to view this group")
    return group

@router.post("/{group_id}/members", response_model=schemas.Group)
def add_member(group_id: uuid.UUID, member_data: schemas.AddMemberRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if group exists and user is member
    group = crud.get_group(db, group_id=group_id)
    if not group:
         raise HTTPException(status_code=404, detail="Group not found")
    
    is_member = any(m.user_id == current_user.id for m in group.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not authorized to edit this group")
    
    user_to_add = None

    if member_data.email:
        # Try to find existing user by email
        user_to_add = crud.get_user_by_email(db, email=member_data.email)
        if not user_to_add:
             raise HTTPException(status_code=404, detail="User with this email not found")
    elif member_data.name:
        # Create a "ghost" user (placeholder)
        # We need a unique email, so we generate one.
        ghost_email = f"ghost_{uuid.uuid4()}@splitmint.com"
        user_in = schemas.UserCreate(
            email=ghost_email,
            password="ghost_user_password", # Dummy password
            name=member_data.name
        )
        user_to_add = crud.create_user(db=db, user=user_in)
    else:
        raise HTTPException(status_code=400, detail="Must provide either email or name")

    
    # Check if already member
    if any(m.user_id == user_to_add.id for m in group.members):
        raise HTTPException(status_code=400, detail="User already in group")

    crud.add_user_to_group(db, group_id=group.id, user_id=user_to_add.id)
    db.refresh(group)
    return group
