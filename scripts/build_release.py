"""Build a versioned Foundry package using only Python's standard library.

Usage: python scripts/build_release.py [vVERSION]
No gameplay code is evaluated. Existing release assets are never changed remotely.
"""
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "module.json").read_text(encoding="utf-8-sig"))
version = manifest["version"]
if not re.fullmatch(r"\d+\.\d+\.\d+", version):
    raise SystemExit("Expected a numeric major.minor.patch version")
tag = f"v{version}"
if len(sys.argv) > 1 and sys.argv[1] != tag:
    raise SystemExit(f"Tag must match module.json: {tag}")
repo = "https://github.com/Kirai124/naruto-system-enhancments"
archive_name = f"{manifest['id']}-{version}.zip"
assert manifest["id"] == "naruto5e-system-enhancements"
assert manifest["url"] == repo
assert manifest["manifest"] == f"{repo}/releases/latest/download/module.json"
assert manifest["download"] == f"{repo}/releases/download/{tag}/{archive_name}"

# Publish runtime code and maintained documentation, never local audit exports,
# world data, backups, credentials, development history or machine-specific files.
files = {ROOT / "module.json"}
for directory in ("src", "lang"):
    files.update(p for p in (ROOT / directory).rglob("*") if p.is_file())
for pattern in ("*.md", "*.css", "RELEASE-*.json", "ABURAME-PROVENANCE.json"):
    files.update(ROOT.glob(pattern))
for key in ("esmodules", "styles"):
    for relative in manifest.get(key, []):
        assert ROOT / relative in files, f"Missing packaged file: {relative}"
for language in manifest.get("languages", []):
    assert ROOT / language["path"] in files
for path in files:
    relative = path.relative_to(ROOT).as_posix()
    assert not path.is_symlink(), f"Symlink not allowed: {relative}"
    assert path.resolve().is_relative_to(ROOT.resolve())
    assert not any(part.startswith(".") for part in path.relative_to(ROOT).parts)
    if path.suffix == ".json":
        json.loads(path.read_text(encoding="utf-8-sig"))

dist = ROOT / "dist"
dist.mkdir(exist_ok=True)
archive = dist / archive_name
with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as package:
    for path in sorted(files):
        # Stable timestamps and permissions produce identical ZIPs on Windows/Linux.
        info = zipfile.ZipInfo(path.relative_to(ROOT).as_posix(), (2020, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        package.writestr(info, path.read_bytes())
with zipfile.ZipFile(archive) as package:
    assert package.testzip() is None, "ZIP integrity check failed"
    assert package.read("module.json") == (ROOT / "module.json").read_bytes()
    assert len(package.namelist()) == len(files)
(dist / "module.json").write_bytes((ROOT / "module.json").read_bytes())
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
(dist / "SHA256SUMS.txt").write_text(f"{digest}  {archive_name}\n", encoding="utf-8")
print(json.dumps({"version": version, "files": len(files), "archive": str(archive), "sha256": digest}))
