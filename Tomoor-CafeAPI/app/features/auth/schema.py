from pydantic import BaseModel, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class LoginRequest(BaseModel):
    email: str = Field(max_length=255, pattern=EMAIL_PATTERN)
    password: str
