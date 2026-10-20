"""Standalone, stdlib-only simulated web consumer. Never imports the price engine.

The trusted manifest comes from the reviewed build, NOT the downloaded payload.
The SHA-256 pin detects tampering; a self-declared checksum is not authentication.
"""

from __future__ import annotations

import hashlib
import json
import re
from copy import deepcopy
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from fractions import Fraction

VERSION = "mirurecetas.preparation-costs/1.0.0"
MAX_BYTES = 1024 * 1024


class ContractError(ValueError):
    """Untrusted, incomplete or incompatible export."""


def require(condition, message):
    if not condition:
        raise ContractError(message)


def keys(obj, expected):
    require(isinstance(obj, dict) and set(obj) == set(expected.split()), "Unexpected fields")


def number(value, *, positive=False):
    require(isinstance(value, str) and len(value) <= 100, "Decimal string required")
    require(bool(re.fullmatch(r"(?:0|[1-9][0-9]*)(?:\.[0-9]+)?", value)), "Invalid decimal")
    result = Decimal(value)
    require(result > 0 if positive else result >= 0, "Invalid amount")
    return result


def timestamp(value):
    require(isinstance(value, str) and value.endswith("Z"), "UTC timestamp required")
    try:
        return datetime.fromisoformat(value)
    except ValueError as exc:
        raise ContractError("Invalid timestamp") from exc


def day(value):
    require(
        isinstance(value, str) and bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", value)), "Date required"
    )
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ContractError("Invalid date") from exc


def cents(ratio):
    """Positive monetary ROUND_HALF_UP, using integer arithmetic, no float."""
    scaled = ratio * 100
    return (2 * scaled.numerator + scaled.denominator) // (2 * scaled.denominator)


def euros(ratio):
    value = cents(ratio)
    whole, part = divmod(value, 100)
    grouped = f"{whole:,}".replace(",", ".")
    return f"{grouped},{part:02d} €"


def duplicate_safe(pairs):
    result = {}
    for k, v in pairs:
        require(k not in result, "Duplicate JSON key")
        result[k] = v
    return result


def freshness(row, today):
    reference = row["price_reference"]
    oldest = reference["oldest_observed_on"]
    return {
        "stale": oldest is not None and today > day(oldest) + timedelta(days=30),
        "unverifiable": reference["undated_lines"] > 0,
        "retained": reference["retained_lines"] > 0,
    }


def validate(payload, trusted, canonical_sha256, now):
    require(isinstance(payload, bytes) and len(payload) <= MAX_BYTES, "Invalid payload size/type")
    require(
        hashlib.sha256(payload).hexdigest() == trusted.get("sha256"),
        "Payload differs from trusted pin",
    )
    require(trusted["canonical_sha256"] == canonical_sha256, "Canonical manifest mismatch")
    try:
        data = json.loads(payload, object_pairs_hook=duplicate_safe)
    except (ValueError, UnicodeError) as exc:
        raise ContractError("Invalid JSON") from exc
    keys(
        data,
        "contract_version currency generated_at catalogue canonical_sha256 public_use_approved production_approved recipes",
    )
    require(data["contract_version"] == VERSION and data["currency"] == "EUR", "Version/currency")
    require(
        data["public_use_approved"] is False and data["production_approved"] is False,
        "Private only",
    )
    require(data["canonical_sha256"] == canonical_sha256, "Canonical payload mismatch")
    generated = timestamp(data["generated_at"])
    require(generated <= now, "Future generation")
    keys(data["catalogue"], "version sha256")
    require(data["catalogue"] == trusted["catalogue"], "Catalogue differs from reviewed build")
    require(isinstance(data["recipes"], list), "Recipes must be an array")
    expected = trusted["preparations"]
    require(len(data["recipes"]) == len(expected), "Incomplete catalogue")
    seen = set()
    for row in data["recipes"]:
        keys(
            row,
            "preparation_id name base_portions estimated_total_eur estimated_per_portion_eur economic_state price_reference freshness",
        )
        pid = row["preparation_id"]
        require(isinstance(pid, str) and pid in expected and pid not in seen, "ID correspondence")
        seen.add(pid)
        require(
            isinstance(row["name"], str) and row["name"] == expected[pid]["name"],
            "Name correspondence",
        )
        portions = number(row["base_portions"], positive=True)
        require(
            portions == number(expected[pid]["base_portions"], positive=True), "Original portions"
        )
        total = number(row["estimated_total_eur"])
        keys(row["estimated_per_portion_eur"], "numerator denominator")
        ratio = row["estimated_per_portion_eur"]
        for k in ("numerator", "denominator"):
            require(
                isinstance(ratio[k], str)
                and len(ratio[k]) <= 100
                and bool(re.fullmatch(r"0|[1-9][0-9]*", ratio[k])),
                "Integer ratio required",
            )
        require(int(ratio["denominator"]) > 0, "Zero denominator")
        amount = Fraction(int(ratio["numerator"]), int(ratio["denominator"]))
        require(amount == Fraction(total) / Fraction(portions), "Total/portion inconsistency")
        require(row["economic_state"] == "complete", "Incomplete economic result")
        ref = row["price_reference"]
        keys(ref, "oldest_observed_on newest_observed_on undated_lines retained_lines")
        for k in ("undated_lines", "retained_lines"):
            require(type(ref[k]) is int and ref[k] >= 0, "Invalid evidence counters")
        oldest, newest = ref["oldest_observed_on"], ref["newest_observed_on"]
        require((oldest is None) == (newest is None), "Inconsistent reference range")
        if oldest is not None:
            require(day(oldest) <= day(newest) <= generated.date(), "Future/inverted price dates")
        else:
            require(ref["undated_lines"] > 0, "Missing evidence")
        keys(row["freshness"], "stale unverifiable retained")
        require(all(type(v) is bool for v in row["freshness"].values()), "Boolean flags required")
        require(row["freshness"] == freshness(row, generated.date()), "Incorrect freshness flags")
    return data


class Consumer:
    """Copy-on-success cache: failed refreshes never overwrite the last valid blob."""

    def __init__(self):
        self._valid = None
        self.last_error = None

    def receive(self, payload, trusted, canonical_sha256, now=None):
        now = now or datetime.now(UTC)
        try:
            data = validate(payload, trusted, canonical_sha256, now)
            if self._valid is not None and self._valid[0]["canonical_sha256"] == canonical_sha256:
                require(
                    timestamp(data["generated_at"]) >= timestamp(self._valid[0]["generated_at"]),
                    "Older replay rejected",
                )
        except (ContractError, KeyError, TypeError, OverflowError, RecursionError) as exc:
            self.last_error = str(exc)
            return False
        self._valid = deepcopy(data), bytes(payload)
        self.last_error = None
        return True

    def view(self, pid, canonical_sha256, *, now=None, offline=False):
        now = now or datetime.now(UTC)
        missing = {"state": "unavailable", "label": "Estimación no disponible"}
        if self._valid is None:
            return missing
        data, _ = self._valid
        if data["canonical_sha256"] != canonical_sha256:
            return {**missing, "reason": "canonical_mismatch"}
        if timestamp(data["generated_at"]) > now:
            return {**missing, "reason": "clock_before_generation"}
        row = next((r for r in data["recipes"] if r["preparation_id"] == pid), None)
        if row is None:
            return missing
        flags = freshness(row, now.date())
        # Align to the existing PWA 30-day runtime expiry; retained bytes remain
        # inspectable but no amount is offered beyond this storage horizon.
        if offline and now > timestamp(data["generated_at"]) + timedelta(days=30):
            return {**missing, "reason": "offline_cache_expired"}
        ratio = row["estimated_per_portion_eur"]
        amount = Fraction(int(ratio["numerator"]), int(ratio["denominator"]))
        warnings = []
        if flags["stale"]:
            warnings.append("Precios desactualizados")
        if flags["unverifiable"]:
            warnings.append("Fecha de algún precio no verificada")
        if flags["retained"] or self.last_error:
            warnings.append("Última estimación válida; actualización pendiente")
        if offline:
            warnings.append("Sin conexión; copia guardada")
        return {
            "state": "warning" if warnings else "available",
            "label": f"Estimado {euros(amount)}/ración",
            "warnings": warnings,
            "generated_at": data["generated_at"],
            "price_reference": deepcopy(row["price_reference"]),
        }
