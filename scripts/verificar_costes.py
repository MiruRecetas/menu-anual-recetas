"""Verify only reviewed economic presentation; optionally compare anonymous Pages bytes."""
import argparse
import hashlib
import json
import re
import time
import urllib.request
from pathlib import Path

from coste_receta import PublicCosts

SITE = "https://mirurecetas.github.io/menu-anual-recetas"
ATTRIBUTION = ' Estimaciones de costes elaboradas con datos de <a href="https://github.com/ruvelro/opencesta">OpenCesta</a> (<a href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL 1.0</a>) y referencias comerciales documentadas.'


def verify(root, public=False):
    costs = PublicCosts(root / "presentacion/costes-recetas.json", root / "datos/recetas")
    resources = {}
    checked = []
    for slug in sorted(costs.bindings):
        recipe = json.loads((root / "datos/recetas" / (slug + ".json")).read_text())
        path = root / "recetas" / slug / "index.html"
        payload = path.read_bytes()
        html = payload.decode("utf-8")
        badge = costs.render(recipe)
        assert badge and html.count(badge) == 1, slug
        assert html.count(ATTRIBUTION) == 1, slug
        assert "{{COST_BADGE}}" not in html, slug
        assert re.search(r'<h1 itemprop="name">([^<]+)</h1>', html), slug
        if public:
            url = SITE + "/recetas/" + slug + "/"
            get_exact(url, payload, "text/html")
            for match in re.findall(r'(?:src|href)="([^"]+)"', html):
                if match.startswith(SITE + "/assets/") and re.search(r"\.(?:css|js)(?:\?|$)", match):
                    relative = match[len(SITE) + 1:].split("?")[0]
                    resources[match] = (root / relative).read_bytes()
        checked.append({"slug": slug, "display_cents": costs.rows[slug]["estimated_per_portion_eur"]["numerator"],
                        "html_sha256": hashlib.sha256(payload).hexdigest()})
    for url, payload in resources.items():
        get_exact(url, payload, "css" if ".css" in url else "javascript")
    result = {"recipes": len(checked), "prices_correct": True, "attribution_present": True,
              "public_http_and_bytes_verified": public, "resources_verified": len(resources),
              "details": checked}
    print(json.dumps(result, ensure_ascii=False))
    return result


def get_exact(url, expected, mime):
    last = None
    for attempt in range(12):
        try:
            separator = "&" if "?" in url else "?"
            request = urllib.request.Request(
                url + separator + "costcheck=" + hashlib.sha256(expected).hexdigest(),
                headers={"User-Agent": "MiruRecetas-Cost-Verification", "Cache-Control": "no-cache"},
            )
            with urllib.request.urlopen(request, timeout=20) as response:
                assert response.status == 200
                content_type = response.headers.get("Content-Type", "").lower()
                assert mime in content_type or (mime == "javascript" and "text/plain" in content_type), content_type
                actual = response.read()
            assert actual == expected, "Deployed bytes differ: " + url
            return
        except Exception as exc:
            last = exc
            if attempt < 11:
                time.sleep(5)
    raise AssertionError("Public validation failed: " + url) from last


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--public", action="store_true")
    args = parser.parse_args()
    verify(args.root.resolve(), args.public)
