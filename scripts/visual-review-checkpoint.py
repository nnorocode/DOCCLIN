#!/usr/bin/env python3
"""Compara arquivos locais; hashes nunca significam aprovação visual."""
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHECKPOINT = ROOT / ".visual-review/checkpoint.json"


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def current():
    names = git("ls-files", "--cached", "--others", "--exclude-standard", "-z").decode().split("\0")
    files = {}
    for name in sorted(set(names)):
        if not name:
            continue
        path = ROOT / name
        relevant = name.startswith(("app/", "lib/", "public/", "components/")) or name in ("DESIGN_SYSTEM.md", "AGENTS.md", "package.json")
        if relevant and path.is_file() and not path.is_symlink():
            files[name] = hashlib.sha256(path.read_bytes()).hexdigest()
    return {"schema": 1, "created_at": datetime.now(timezone.utc).isoformat(), "git_head": git("rev-parse", "HEAD").decode().strip(), "files": files}


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("capture", "diff"):
        raise SystemExit("Uso: visual-review-checkpoint.py capture|diff")
    state = current()
    if sys.argv[1] == "capture":
        CHECKPOINT.parent.mkdir(exist_ok=True)
        temporary = CHECKPOINT.with_suffix(".tmp")
        temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n")
        temporary.replace(CHECKPOINT)
        print(json.dumps({"status": "snapshot_saved_not_visual_approval", "files": len(state["files"])}))
        return
    try:
        previous = json.loads(CHECKPOINT.read_text())
        if not isinstance(previous, dict) or previous.get("schema") != 1 or not isinstance(previous.get("files"), dict):
            raise ValueError("schema")
        if not all(isinstance(k, str) and isinstance(v, str) and len(v) == 64 and all(c in '0123456789abcdef' for c in v) for k, v in previous["files"].items()):
            raise ValueError("hashes")
    except (OSError, ValueError):
        print(json.dumps({"status": "checkpoint_missing_or_invalid", "visual_review": "pending"}))
        return
    old, new = previous["files"], state["files"]
    print(json.dumps({"status": "compared_not_visual_approval", "added": sorted(new.keys() - old.keys()), "removed": sorted(old.keys() - new.keys()), "changed": sorted(k for k in new.keys() & old.keys() if new[k] != old[k])}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
