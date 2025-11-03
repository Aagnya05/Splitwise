from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import people, expenses

# Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Splitwise Clone API",
    description="Backend for your Splitwise-style app (people, expenses, settlements).",
    version="1.0.0",
)

# Allow frontend (localhost dev, and later Electron)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # simple for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach the routers
app.include_router(people.router)
app.include_router(expenses.router)
