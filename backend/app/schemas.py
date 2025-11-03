from datetime import datetime, date
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional


# ---------- Person Schemas ----------

class PersonBase(BaseModel):
    name: str = Field(..., description="Full name of the person")
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar_color: Optional[str] = "#10B981"

class PersonCreate(PersonBase):
    pass

class PersonUpdate(PersonBase):
    pass  # frontend sends full object on edit

class PersonOut(PersonBase):
    id: int
    class Config:
        from_attributes = True


# ---------- Expense Participant Schemas ----------

class ExpenseParticipantIn(BaseModel):
    person_id: int
    amount_owed: float
    is_settled: bool = False

class ExpenseParticipantOut(ExpenseParticipantIn):
    # same shape for output
    pass


# ---------- Expense Schemas ----------

class ExpenseBase(BaseModel):
    title: str
    description: Optional[str] = None
    total_amount: float
    currency: str = "INR"
    paid_by: int  # person_id of payer
    split_method: Optional[str] = "equal"
    category: Optional[str] = None
    expense_date: Optional[date] = None
    participants: List[ExpenseParticipantIn]

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(ExpenseBase):
    # frontend sends the whole object back (including id)
    id: Optional[int] = None
    created_date: Optional[datetime] = None

class ExpenseOut(ExpenseBase):
    id: int
    created_date: datetime
    participants: List[ExpenseParticipantOut]
    class Config:
        from_attributes = True
