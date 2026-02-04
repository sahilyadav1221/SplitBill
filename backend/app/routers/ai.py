from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai
import os
import json
from .. import crud, schemas, database, models
from .auth import get_current_user

router = APIRouter(prefix="/api", tags=["ai"])

# Configure Gemini
# In a real app, ensure GEMINI_API_KEY is set in environment
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use a model that supports JSON mode if available, or just standard prompt engineering
# Gemini 1.5 Flash is good for speed/cost.
model = genai.GenerativeModel('gemini-flash-latest')

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/parse-expense", response_model=schemas.ParsedExpense)
async def parse_expense(
    request: schemas.ParseExpenseRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Fetch group to get member names
    group = crud.get_group(db, group_id=request.group_id)
    if not group:
         raise HTTPException(status_code=404, detail="Group not found")
    
    # Verify membership
    is_member = any(m.user_id == current_user.id for m in group.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not authorized")

    member_names = [m.user.name for m in group.members]
    
    # 2. Construct Prompt
    prompt = f"""
    You are an expense parser. 
    Analyze the following text: "{request.text}"
    
    Context: The group members are: {", ".join(member_names)}.
    
    Task: Extract the following fields:
    - amount: (number)
    - description: (short text summary)
    - payer_name: (one of the group members, inferred from text. If 'me' or 'I', map to the current user's name: {current_user.name})
    - involved_users: (list of names from the group members list who should split this. If 'everyone', include all members. If specific names, match them to the closest group member name.)
    
    Return ONLY valid JSON with this structure:
    {{
      "amount": 0.0,
      "description": "string",
      "payer_name": "string",
      "involved_users": ["string", "string"],
      "split_type": "EQUAL"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text
        
        # Clean up markdown code blocks if present
        if "```json" in text_response:
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif "```" in text_response:
            text_response = text_response.split("```")[1].split("```")[0].strip()
            
        parsed_data = json.loads(text_response)
        
        return parsed_data
    except Exception as e:
        print(f"AI Parse Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse expense with AI")
