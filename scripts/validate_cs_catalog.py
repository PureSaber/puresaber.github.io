"""B-002 v0.1 candidate catalog validator; standard library only."""
import json
import re
import sys
from datetime import date
from urllib.parse import urlsplit

TYPES = set("course_container video audio book article documentation exercise paper".split())
SCENES = set("audio_only screen_required focused_reading hands_on bite_sized systematic".split())
ROLES = {"primary", "supplementary"}
ID = re.compile(r"[a-z][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*)+\Z")

def validate(d):
    def require(ok, msg):
        if not ok:
            raise ValueError(msg)
    def fields(obj, keys):
        require(isinstance(obj, dict) and set(keys) <= obj.keys(), "missing fields: " + str(keys))
    def index(items, prefix):
        out = {}
        for item in items:
            key = item["id"]
            require(isinstance(key, str) and ID.fullmatch(key) and key.startswith(prefix), "invalid ID")
            require(key not in out, "duplicate ID: " + key)
            out[key] = item
        return out
    def refs(values, target):
        require(isinstance(values, list) and len(values) == len(set(values)), "duplicate or invalid references")
        require(all(v in target for v in values), "dangling reference")
    def url(value):
        return isinstance(value, str) and urlsplit(value).scheme == "https" and bool(urlsplit(value).hostname)
    fields(d, ["schema_version","status","nodes","resources","routes","migrations"])
    require(d["schema_version"] == "0.1.0" and d["status"] in {"fixture","candidate","reviewed"}, "version/status")
    n = index(d["nodes"], "cs.")
    r = index(d["resources"], "res.")
    routes = index(d["routes"], "route.")
    seen = set()
    for key, x in r.items():
        fields(x, "id title authors institution requested_url resolved_url observed_version checked_at evidence type difficulty language fee duration_minutes recommendation scenes audio_grade audio_evidence parent_id".split())
        require(x["type"] in TYPES and x["audio_grade"] in {"A","B","C","U"}, "resource enum")
        require(isinstance(x["scenes"], list) and set(x["scenes"]) <= SCENES, "scene enum")
        require(url(x["requested_url"]) and (x["resolved_url"] is None or url(x["resolved_url"])), "URL")
        canonical = x["resolved_url"] or x["requested_url"]
        require(canonical not in seen, "duplicate resource URL")
        seen.add(canonical)
        if x["checked_at"] is not None:
            date.fromisoformat(x["checked_at"])
        require(x["duration_minutes"] is None or (type(x["duration_minutes"]) in (int,float) and x["duration_minutes"] > 0), "duration")
        if x["audio_grade"] == "A":
            require(x["type"] in {"audio","video"} and isinstance(x["audio_evidence"], str) and bool(x["audio_evidence"].strip()), "A requires content evidence")
        require("audio_only" not in x["scenes"] or x["audio_grade"] == "A", "audio_only requires A")
        if x["parent_id"] is not None:
            require(x["parent_id"] in r and x["parent_id"] != key and r[x["parent_id"]]["type"] == "course_container" and r[x["parent_id"]]["parent_id"] is None, "invalid container")
    for key,x in n.items():
        fields(x, "id title objectives concepts required suggested resource_refs practice review next_refs next_notes".split())
        for k in ("required","suggested","next_refs"):
            refs(x[k],n)
            require(key not in x[k], "self reference")
        refs([v["resource_id"] for v in x["resource_refs"]],r)
        require(all(v["role"] in ROLES for v in x["resource_refs"]), "teaching role")
    visiting, done = set(), set()
    def visit(k):
        require(k not in visiting, "hard prerequisite cycle")
        if k in done:
            return
        visiting.add(k)
        for p in n[k]["required"]:
            visit(p)
        visiting.remove(k)
        done.add(k)
    for k in n:
        visit(k)
    for x in routes.values():
        fields(x, ["id","title","node_refs"])
        refs(x["node_refs"],n)
    live = set(n)|set(r)|set(routes)
    for old,new in d["migrations"].items():
        require(ID.fullmatch(old) and old not in live and (new is None or new in live), "invalid migration")
    return True

if __name__ == "__main__":
    try:
        with open(sys.argv[1], encoding="utf-8") as f:
            validate(json.load(f))
        print("catalog validation passed")
    except (ValueError, KeyError, TypeError, IndexError) as e:
        sys.exit("catalog validation failed: " + str(e))
