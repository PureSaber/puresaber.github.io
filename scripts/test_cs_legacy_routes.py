"""Regression fixtures for B-001; run with python3 -m unittest discover -s scripts -p test_cs_legacy_routes.py."""
import tempfile
import unittest
from pathlib import Path
from check_cs_legacy_routes import check, LEGACY

class LegacyRouteTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.entry = self.root / "learn/index.html"
        self.cs = self.root / "learn/computer-science/index.html"
        self.cs.parent.mkdir(parents=True)
        self.entry.write_text('<a href="./computer-science/">CS</a>', encoding="utf-8")
        self.valid = "".join(f'<section id="{i}"></section>' for i in sorted(LEGACY))
        self.cs.write_text(self.valid, encoding="utf-8")

    def test_valid(self):
        self.assertEqual(check(self.root), [])

    def test_missing_anchor(self):
        self.cs.write_text(self.valid.replace('id="math"', ''), encoding="utf-8")
        self.assertTrue(any("Missing legacy anchors" in e for e in check(self.root)))

    def test_duplicate_id(self):
        self.cs.write_text(self.valid + '<div id="math"></div>', encoding="utf-8")
        self.assertTrue(any("duplicate IDs" in e for e in check(self.root)))

    def test_missing_link(self):
        self.cs.write_text(self.valid + '<a href="missing.html">bad</a>', encoding="utf-8")
        self.assertTrue(any("missing local target" in e for e in check(self.root)))

    def test_missing_fragment(self):
        self.cs.write_text(self.valid + '<a href="#absent">bad</a>', encoding="utf-8")
        self.assertTrue(any("missing fragment" in e for e in check(self.root)))

    def test_missing_entry(self):
        self.entry.write_text("", encoding="utf-8")
        self.assertTrue(any("Learning entry lost CS link" in e for e in check(self.root)))

if __name__ == "__main__":
    unittest.main()
