from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProjectManifest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    formatVersion: int = Field(default=1, strict=True)
    name: str = Field(min_length=1)
    createdAt: datetime
    updatedAt: datetime

    @field_validator("formatVersion")
    @classmethod
    def supported_format_version(cls, value: int) -> int:
        if value != 1:
            raise ValueError("Only project format version 1 is supported")
        return value

    @field_validator("createdAt", "updatedAt")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("Timestamps must include a timezone")
        return value
