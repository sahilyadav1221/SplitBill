from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, groups, expenses, ai
from .database import engine, Base
from . import models

# Create tables if not using Alembic (useful for dev, though we used Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SplitMint API")

import os

# CORS setup
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SplitMint API"}
