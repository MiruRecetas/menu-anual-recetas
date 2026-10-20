"""Build-time presentation adapter. Stdlib-only; no economic engine or network.

MIRU_COST_BUNDLE and MIRU_COST_CACHE are private local paths, never served URLs.
Pins/bindings are reviewed build inputs, not self-asserted data from a download.
"""

from __future__ import annotations

import hashlib
import html
import json
import os
from datetime import UTC, datetime
from fractions import Fraction
from pathlib import Path

from cost_contract import ContractError, euros, validate


def fingerprint(value):
    return hashlib.sha256(
        json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()
    ).hexdigest()


def culinary(recipe):
    return {k: recipe[k] for k in ("raciones", "ingredientes", "pasos")}


class Costs:
    def __init__(self, bundle=None, cache=None, now=None):
        self.rows = {}
        self.bindings = {}
        self.diagnostics = {"state": "disabled", "warnings": {}}
        bundle = bundle or os.environ.get("MIRU_COST_BUNDLE")
        cache = cache or os.environ.get("MIRU_COST_CACHE")
        if not bundle:
            return
        now = now or datetime.now(UTC)
        root = Path(bundle)
        try:
            config = json.loads((root / "bindings.json").read_text())
            canonical = config["canonical_sha256"]
            trusted = config["trusted_revisions"]
            self.bindings = config["recipes"]
            if (
                config["public_use_approved"] is not False
                or config["production_approved"] is not False
            ):
                raise ContractError("Private build only")
            if not trusted or any(t["canonical_sha256"] != canonical for t in trusted):
                raise ContractError("Canonical binding mismatch")
        except (OSError, ValueError, KeyError, TypeError) as exc:
            self.diagnostics = {"state": "blocked", "reason": str(exc), "warnings": {}}
            return
        selected = None
        current_error = None
        try:
            payload = (root / "precios.json").read_bytes()
            selected = validate(payload, trusted[0], canonical, now)
        except (OSError, ValueError, KeyError, TypeError, RecursionError) as exc:
            current_error = str(exc)
        if selected is None and cache:
            try:
                payload = Path(cache).read_bytes()
                for pin in trusted:
                    try:
                        selected = validate(payload, pin, canonical, now)
                        break
                    except (ValueError, KeyError, TypeError, RecursionError):
                        continue
            except OSError:
                pass
        if selected is None:
            self.diagnostics = {"state": "unavailable", "reason": current_error, "warnings": {}}
            return
        self.rows = {r["preparation_id"]: r for r in selected["recipes"]}
        self.diagnostics = {
            "state": "retained" if current_error else "valid",
            "reason": current_error,
            "canonical_sha256": canonical,
            "catalogue": selected["catalogue"],
            "warnings": {r["preparation_id"]: r["freshness"] for r in selected["recipes"]},
        }
        if cache and not current_error:
            target = Path(cache)
            # Cache MUST live outside the served site, as enforced by the runner.
            target.parent.mkdir(parents=True, exist_ok=True)
            staging = target.with_suffix(".tmp")
            staging.write_bytes(payload)
            staging.replace(target)

    def render(self, recipe):
        binding = self.bindings.get(recipe["slug"])
        if not binding or fingerprint(culinary(recipe)) != binding["culinary_sha256"]:
            return ""
        row = self.rows.get(binding["preparation_id"])
        if (
            row is None
            or str(recipe["raciones"]) != row["base_portions"]
            or recipe["nombre"] != binding["web_name"]
        ):
            return ""
        # Price is precomputed. Only exact display rounding happens here.
        value = row["estimated_per_portion_eur"]
        price = euros(Fraction(int(value["numerator"]), int(value["denominator"])))
        label = html.escape("≈ " + price + "/ración")
        accessible = html.escape("Coste estimado por ración: " + price, quote=True)
        return (
            '<span class="recipe-cost" role="img" aria-label="' + accessible + '">'
            '<i data-lucide="hand-coins" aria-hidden="true"></i><span aria-hidden="true">'
            + label
            + "</span></span>"
        )

class PublicCosts(Costs):
    """Reviewed public output only; reuse the Phase 3.2 renderer and rounding."""

    def __init__(self, projection=None, recipe_root=None):
        import re
        from cost_contract import duplicate_safe, keys, require

        root = Path(__file__).resolve().parents[1]
        projection = Path(projection) if projection else root / "presentacion/costes-recetas.json"
        recipe_root = Path(recipe_root) if recipe_root else root / "datos/recetas"
        payload = projection.read_bytes()
        require(len(payload) <= 1024 * 1024, "Public cost projection too large")
        data = json.loads(payload, object_pairs_hook=duplicate_safe)
        keys(data, "schema recipes")
        require(data["schema"] == "mirurecetas.public-recipe-costs/1", "Public projection version")
        require(isinstance(data["recipes"], dict) and bool(data["recipes"]), "Empty costs")
        self.rows = {}
        self.bindings = {}
        self.diagnostics = {"state": "valid-public-projection", "warnings": {}}
        for slug, row in data["recipes"].items():
            require(bool(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug)), "Invalid cost slug")
            keys(row, "web_name base_portions culinary_sha256 cents")
            require(isinstance(row["web_name"], str) and bool(row["web_name"]), "Cost name")
            require(
                isinstance(row["base_portions"], str)
                and bool(re.fullmatch(r"[1-9][0-9]*", row["base_portions"])),
                "Cost portions",
            )
            require(
                isinstance(row["cents"], str)
                and len(row["cents"]) <= 30
                and bool(re.fullmatch(r"0|[1-9][0-9]*", row["cents"])),
                "Cost cents",
            )
            require(
                isinstance(row["culinary_sha256"], str)
                and bool(re.fullmatch(r"[a-f0-9]{64}", row["culinary_sha256"])),
                "Cost culinary fingerprint",
            )
            recipe = json.loads((recipe_root / (slug + ".json")).read_text(encoding="utf-8"))
            require(
                recipe["slug"] == slug
                and recipe["nombre"] == row["web_name"]
                and str(recipe["raciones"]) == row["base_portions"]
                and fingerprint(culinary(recipe)) == row["culinary_sha256"],
                "Revalidate economic identity before publishing: " + slug,
            )
            # Internal renderer key is the public slug, never a canonical Airtable ID.
            self.bindings[slug] = {**row, "preparation_id": slug}
            self.rows[slug] = {
                "base_portions": row["base_portions"],
                "estimated_per_portion_eur": {"numerator": row["cents"], "denominator": "100"},
            }
