from backend.database import engine, Base
from backend import models

def reset():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database reset at:", engine.url)

if __name__ == "__main__":
    reset()
