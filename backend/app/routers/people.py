from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/people", tags=["people"])

@router.get("/", response_model=list[schemas.PersonOut])
def list_people(db: Session = Depends(get_db)):
    people = db.query(models.Person).order_by(models.Person.id.asc()).all()
    return people

@router.post("/", response_model=schemas.PersonOut, status_code=status.HTTP_201_CREATED)
def create_person(person_in: schemas.PersonCreate, db: Session = Depends(get_db)):
    person = models.Person(
        name=person_in.name,
        email=person_in.email,
        phone=person_in.phone,
        avatar_color=person_in.avatar_color,
    )
    db.add(person)
    db.commit()
    db.refresh(person)
    return person

@router.put("/{person_id}", response_model=schemas.PersonOut)
def update_person(person_id: int, person_in: schemas.PersonUpdate, db: Session = Depends(get_db)):
    person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    person.name = person_in.name
    person.email = person_in.email
    person.phone = person_in.phone
    person.avatar_color = person_in.avatar_color

    db.commit()
    db.refresh(person)
    return person

@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(person_id: int, db: Session = Depends(get_db)):
    person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    used_as_payer = (
        db.query(models.Expense)
        .filter(models.Expense.paid_by == person_id)
        .first()
    )
    used_as_participant = (
        db.query(models.ExpenseParticipant)
        .filter(models.ExpenseParticipant.person_id == person_id)
        .first()
    )

    if used_as_payer or used_as_participant:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete: this person is used in one or more expenses",
        )

    db.delete(person)
    db.commit()
    return
