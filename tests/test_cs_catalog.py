"""B-002 regression tests; synthetic fixtures only.
Run: python3 -m unittest discover -s tests -p test_cs_catalog.py
"""
import copy
import unittest
from scripts.validate_cs_catalog import validate

def fixture():
    resource = dict(id="res.fixture.one", title="Synthetic", authors=None,
        institution=None, requested_url="https://example.invalid/one",
        resolved_url=None, observed_version=None, checked_at=None, evidence=None,
        type="video", difficulty=None, language=None, fee=None,
        duration_minutes=None, recommendation=None, scenes=[], audio_grade="U",
        audio_evidence=None, parent_id=None)
    node = dict(id="cs.fixture.one", title="Synthetic", objectives=[],
        concepts=[], required=[], suggested=[], resource_refs=[
            dict(resource_id=resource["id"], role="primary")],
        practice=[], review=[], next_refs=[], next_notes=[])
    second = copy.deepcopy(node)
    second.update(id="cs.fixture.two", required=[node["id"]])
    return dict(schema_version="0.1.0", status="fixture", nodes=[node,second],
        resources=[resource], routes=[dict(id="route.fixture.one",
        title="Synthetic", node_refs=[node["id"],second["id"]])], migrations={})

class CatalogTests(unittest.TestCase):
    def test_valid_shared_resource(self):
        self.assertTrue(validate(fixture()))

    def test_invalid_cases(self):
        cases = [
            ("duplicate node", lambda d: d["nodes"].append(d["nodes"][0])),
            ("dangling prerequisite", lambda d: d["nodes"][0]["required"].append("cs.missing")),
            ("cycle", lambda d: d["nodes"][0]["required"].append("cs.fixture.two")),
            ("dangling resource", lambda d: d["resources"].clear()),
            ("audio U", lambda d: d["resources"][0]["scenes"].append("audio_only")),
            ("audio A without evidence", lambda d: d["resources"][0].update(audio_grade="A")),
            ("invalid duration", lambda d: d["resources"][0].update(duration_minutes=-1)),
            ("duplicate URL", lambda d: d["resources"].append(dict(d["resources"][0], id="res.fixture.two"))),
            ("bad migration", lambda d: d["migrations"].update({"cs.retired":"cs.missing"})),
            ("bad route", lambda d: d["routes"][0]["node_refs"].append("cs.missing")),
        ]
        for name, mutate in cases:
            with self.subTest(name=name):
                data = fixture()
                mutate(data)
                with self.assertRaises(ValueError):
                    validate(data)

    def test_audio_a(self):
        data = fixture()
        data["resources"][0].update(audio_grade="A", audio_evidence="Synthetic evidence", scenes=["audio_only"])
        self.assertTrue(validate(data))

    def test_retired_id(self):
        data = fixture()
        data["migrations"]["cs.retired"] = "cs.fixture.one"
        self.assertTrue(validate(data))

if __name__ == "__main__":
    unittest.main()
