import uvicorn
from config import setupLog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.users import router
from routes.conversation import router as conVrouter

setupLog()

app = FastAPI()
app.include_router(router)
app.include_router(conVrouter)

authorize_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",  
    "http://frontend:5173" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.O", port=8000, reload=True)


