from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/expenses", tags=["expenses"])


def expense_to_schema(expense: models.Expense) -> schemas.ExpenseOut:
    return schemas.ExpenseOut(
        id=expense.id,
        title=expense.title,
        description=expense.description,
        total_amount=expense.total_amount,
        currency=expense.currency,
        paid_by=expense.paid_by,
        split_method=expense.split_method,
        category=expense.category,
        expense_date=expense.expense_date,
        created_date=expense.created_date,
        participants=[
            schemas.ExpenseParticipantOut(
                person_id=p.person_id,
                amount_owed=p.amount_owed,
                is_settled=p.is_settled,
            )
            for p in expense.participants
        ],
    )


@router.get("/", response_model=List[schemas.ExpenseOut])
def list_expenses(
    sort: Optional[str] = Query(default="-created_date"),
    limit: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    Your frontend calls:
      Expense.list("-created_date", 20)
      Expense.list("-expense_date")
    so we support:
      ?sort=-created_date&limit=20
    """

    # Parse sort
    # e.g. "-created_date" -> field="created_date", desc=True
    desc = True
    sort_field = "created_date"
    if sort:
        if sort.startswith("-"):
            desc = True
            sort_field = sort[1:]
        else:
            desc = False
            sort_field = sort

    # Map field string to actual column
    sort_column = {
        "created_date": models.Expense.created_date,
        "expense_date": models.Expense.expense_date,
        "total_amount": models.Expense.total_amount,
    }.get(sort_field, models.Expense.created_date)

    q = (
        db.query(models.Expense)
        .options(joinedload(models.Expense.participants))
    )

    if desc:
        q = q.order_by(sort_column.desc().nullslast())
    else:
        q = q.order_by(sort_column.asc().nullsfirst())

    if limit is not None:
        q = q.limit(limit)

    expenses = q.all()
    return [expense_to_schema(e) for e in expenses]


@router.post("/", response_model=schemas.ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(expense_in: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    # Validate payer exists
    payer = (
        db.query(models.Person)
        .filter(models.Person.id == expense_in.paid_by)
        .first()
    )
    if not payer:
        raise HTTPException(status_code=400, detail="paid_by person does not exist")

    # Validate all participants exist
    participant_ids = [p.person_id for p in expense_in.participants]
    existing_people = (
        db.query(models.Person)
        .filter(models.Person.id.in_(participant_ids))
        .all()
    )
    if len(existing_people) != len(participant_ids):
        raise HTTPException(
            status_code=400,
            detail="One or more participants do not exist",
        )

    # Create the Expense
    expense = models.Expense(
        title=expense_in.title,
        description=expense_in.description,
        total_amount=expense_in.total_amount,
        currency=expense_in.currency,
        paid_by=expense_in.paid_by,
        split_method=expense_in.split_method,
        category=expense_in.category,
        expense_date=expense_in.expense_date,
        created_date=datetime.utcnow(),
    )
    db.add(expense)
    db.flush()  # so expense.id is available

    # Create ExpenseParticipants
    for part in expense_in.participants:
        ep = models.ExpenseParticipant(
            expense_id=expense.id,
            person_id=part.person_id,
            amount_owed=part.amount_owed,
            is_settled=part.is_settled,
        )
        db.add(ep)

    db.commit()
    db.refresh(expense)

    return expense_to_schema(expense)


@router.put("/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(
    expense_id: int,
    expense_in: schemas.ExpenseUpdate,
    db: Session = Depends(get_db),
):
    # Get existing expense w/ participants
    expense = (
        db.query(models.Expense)
        .options(joinedload(models.Expense.participants))
        .filter(models.Expense.id == expense_id)
        .first()
    )
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Update main fields
    expense.title = expense_in.title
    expense.description = expense_in.description
    expense.total_amount = expense_in.total_amount
    expense.currency = expense_in.currency
    expense.paid_by = expense_in.paid_by
    expense.split_method = expense_in.split_method
    expense.category = expense_in.category
    expense.expense_date = expense_in.expense_date
    # keep created_date as original

    # Replace participants completely (your UI sends full participant array)
    db.query(models.ExpenseParticipant).filter(
        models.ExpenseParticipant.expense_id == expense.id
    ).delete()

    for part in expense_in.participants:
        ep = models.ExpenseParticipant(
            expense_id=expense.id,
            person_id=part.person_id,
            amount_owed=part.amount_owed,
            is_settled=part.is_settled,
        )
        db.add(ep)

    db.commit()
    db.refresh(expense)

    return expense_to_schema(expense)
