# start_app.py
import uvicorn
from app.main import app

if __name__ == "__main__":
    # make sure this matches how you normally run uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
