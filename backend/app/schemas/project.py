from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ProjectManifest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    formatVersion: int
    name: str
    createdAt: datetime
    updatedAt: datetime
