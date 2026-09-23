from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import categories, products, auth, wishlist, addresses, analytics, admin

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://urbanshop-store.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(products.router)
app.include_router(auth.router)
app.include_router(wishlist.router)
app.include_router(addresses.router)
app.include_router(analytics.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Urbanshop backend is running!"}
