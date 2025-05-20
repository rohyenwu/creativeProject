from fastapi import FastAPI
from contextlib import asynccontextmanager

from Back.Model import DBConnection
from Back.Controller import userController
from starlette.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    await DBConnection.DBConnection.init_pool()
    yield
    DBConnection.DBConnection.pool.close()            # 🔒 먼저 pool 종료 요청
    await DBConnection.DBConnection.pool.wait_closed()



app = FastAPI(lifespan=lifespan)
app.include_router(userController.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins= ["*"],            # 허용할 origin
    allow_credentials=True,
    allow_methods=["*"],              # 허용할 HTTP 메서드 (GET, POST 등)
    allow_headers=["*", "-ijt"],
)
