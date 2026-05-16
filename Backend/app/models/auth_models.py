from pydantic import BaseModel, EmailStr, Field



class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    full_name: str = Field(..., max_length=30)
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    username: str
    password: str