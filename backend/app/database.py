from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Make DB path absolute so the .exe can always find it
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # backend/app
DB_PATH = os.path.join(BASE_DIR, "splitwise.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# For SQLite: actually enforce foreign keys when running
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
