from datetime import datetime, date
from sqlalchemy import (
    Integer,
    String,
    Float,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base

class Person(Base):
    __tablename__ = "people"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=True)
    phone: Mapped[str] = mapped_column(String, nullable=True)
    avatar_color: Mapped[str] = mapped_column(String, nullable=True)

    expenses_paid = relationship("Expense", back_populates="payer")
    participant_entries = relationship("ExpenseParticipant", back_populates="person")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)

    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String, default="INR")

    paid_by: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("people.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    split_method: Mapped[str] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=True)
    expense_date: Mapped[date] = mapped_column(Date, nullable=True)

    created_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True
    )

    payer = relationship("Person", back_populates="expenses_paid")

    participants = relationship(
        "ExpenseParticipant",
        back_populates="expense",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class ExpenseParticipant(Base):
    __tablename__ = "expense_participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    expense_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("expenses.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    person_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("people.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    amount_owed: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_settled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    expense = relationship("Expense", back_populates="participants")
    person = relationship("Person", back_populates="participant_entries")
