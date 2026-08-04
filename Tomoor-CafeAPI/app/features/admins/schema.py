from pydantic import BaseModel, EmailStr


class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
