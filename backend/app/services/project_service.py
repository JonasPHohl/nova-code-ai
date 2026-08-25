from pathlib import Path


def is_safe_project_path(project_root: Path, candidate: Path) -> bool:
    root = project_root.resolve()
    target = candidate.resolve()
    return target == root or root in target.parents
