from datetime import datetime, timezone
from pathlib import Path
import pytest
from pydantic import ValidationError
from app.schemas.project import ProjectManifest
from app.services.project_service import is_safe_project_path


def test_project_manifest_schema() -> None:
    manifest = ProjectManifest(formatVersion=1, name="Example", createdAt=datetime.now(timezone.utc), updatedAt=datetime.now(timezone.utc))
    assert manifest.formatVersion == 1


def test_project_path_boundary() -> None:
    root = Path("C:/projects/example")
    assert is_safe_project_path(root, root / ".nova/project.json")
    assert not is_safe_project_path(root, Path("C:/projects/other/file"))


def test_project_manifest_rejects_unsupported_version_and_naive_time() -> None:
    values = {"formatVersion": 2, "name": "Example", "createdAt": datetime.now(timezone.utc), "updatedAt": datetime.now(timezone.utc)}
    with pytest.raises(ValidationError):
        ProjectManifest(**values)
