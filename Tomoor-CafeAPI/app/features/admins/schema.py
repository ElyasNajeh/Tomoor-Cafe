from pydantic import BaseModel, ConfigDict, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class AdminCreate(BaseModel):
    email: str = Field(max_length=255, pattern=EMAIL_PATTERN)
    password: str = Field(min_length=4, max_length=128)


class AdminPublic(BaseModel):
    id: int
    email: str = Field(pattern=EMAIL_PATTERN)

    model_config = ConfigDict(from_attributes=True)
