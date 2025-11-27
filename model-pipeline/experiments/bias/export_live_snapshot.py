#!/usr/bin/env python3
"""
Export live recommendation + interaction logs into a denormalized snapshot for
bias/fairness evaluation.

Expected Firestore collections:
1. `match_recommendations` - one document per recommendation event, containing:
   {
       "request_id": str,
       "user_id": str,
       "timestamp": ISO8601 str,
       "rooms": [
           {
               "room_id": str,
               "score": float,
               "flatmate_gender": str,
               "room_type": str,
               "rent": int,
               ...
           }
       ],
       "user_gender": str,
       "preferred_location": str,
       "budget": int,
       "room_type_preference": str,
       "lifestyle_food": str,
       "lifestyle_alcohol_smoke": str,
       "age": int
   }
2. `match_interactions` - downstream engagements referencing request_id + room_id:
   {
       "request_id": str,
       "room_id": str,
       "event_type": "clicked" | "applied" | "accepted" | ...,
       "timestamp": ISO8601 str
   }

The script flattens these logs into one row per (request_id, user_id, room_id),
adds derived bands (budget, age), and writes a Parquet snapshot + metadata JSON.
"""

from __future__ import annotations

import argparse
import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
from google.cloud.firestore import AsyncClient


@dataclass
class SnapshotArgs:
    project: Optional[str]
    database: str
    serve_collection: str
    interaction_collection: str
    start_ts: datetime
    end_ts: datetime
    output_path: Path


def _parse_dt(value: Optional[str], *, default: Optional[datetime] = None) -> datetime:
    if value:
        parsed = datetime.fromisoformat(value)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    if default:
        return default
    raise ValueError("timestamp argument missing and no default provided")


async def _fetch_collection(
    client: AsyncClient,
    collection: str,
    start_ts: datetime,
    end_ts: datetime,
) -> List[Dict[str, Any]]:
    query = (
        client.collection(collection)
        .where("timestamp", ">=", start_ts)
        .where("timestamp", "<", end_ts)
    )
    docs: List[Dict[str, Any]] = []
    async for doc in query.stream():
        data = doc.to_dict() or {}
        data["__doc_id"] = doc.id
        docs.append(data)
    return docs


async def _load_data(args: SnapshotArgs) -> Tuple[pd.DataFrame, pd.DataFrame]:
    client = AsyncClient(project=args.project, database=args.database)
    try:
        serves, interactions = await asyncio.gather(
            _fetch_collection(
                client,
                args.serve_collection,
                args.start_ts,
                args.end_ts,
            ),
            _fetch_collection(
                client,
                args.interaction_collection,
                args.start_ts,
                args.end_ts,
            ),
        )
    finally:
        await client.close()

    serves_df = pd.json_normalize(serves)
    interactions_df = pd.json_normalize(interactions)
    return serves_df, interactions_df


def _flatten_serves(serves_df: pd.DataFrame) -> pd.DataFrame:
    if serves_df.empty:
        raise RuntimeError("No recommendation events found for requested window")

    if "rooms" in serves_df.columns:
        serves_df = serves_df.explode("rooms").reset_index(drop=True)
        room_details = pd.json_normalize(serves_df.pop("rooms"))
        serves_df = pd.concat([serves_df, room_details], axis=1)

    serves_df.rename(
        columns={
            "rooms.room_id": "room_id",
            "rooms.score": "score",
        },
        inplace=True,
    )
    serves_df["served"] = 1
    serves_df["serve_timestamp"] = pd.to_datetime(
        serves_df.get("timestamp", serves_df.get("created_at"))
    )
    return serves_df


def _pivot_events(events_df: pd.DataFrame) -> pd.DataFrame:
    if events_df.empty:
        return pd.DataFrame(columns=["request_id", "room_id"])

    events_df["event_type"] = events_df["event_type"].str.lower()
    pivot = (
        events_df.pivot_table(
            index=["request_id", "room_id"],
            columns="event_type",
            aggfunc="size",
            fill_value=0,
        )
        .astype(int)
        .reset_index()
    )
    pivot.columns = [str(col).lower() for col in pivot.columns]
    return pivot


def _derive_bands(df: pd.DataFrame) -> pd.DataFrame:
    if "budget" in df.columns and "budget_band" not in df.columns:
        df["budget_band"] = pd.cut(
            df["budget"],
            bins=[0, 1000, 1500, 2000, 3000, 10000],
            labels=["<1k", "1-1.5k", "1.5-2k", "2-3k", "3k+"],
            include_lowest=True,
        )
    if "age" in df.columns and "age_band" not in df.columns:
        df["age_band"] = pd.cut(
            df["age"],
            bins=[18, 25, 35, 45, 200],
            labels=["18-24", "25-34", "35-44", "45+"],
            include_lowest=True,
        )
    return df


async def build_snapshot(args: SnapshotArgs) -> pd.DataFrame:
    serves_raw, interactions_raw = await _load_data(args)
    serves = _flatten_serves(serves_raw)
    events = _pivot_events(interactions_raw)

    snapshot = serves.merge(
        events,
        on=["request_id", "room_id"],
        how="left",
        suffixes=("", "_event"),
    )

    for col in ("clicked", "saved", "applied", "accepted"):
        if col not in snapshot.columns:
            snapshot[col] = 0

    snapshot = _derive_bands(snapshot)
    return snapshot


def parse_args() -> SnapshotArgs:
    parser = argparse.ArgumentParser(description="Export live snapshot for bias checks")
    parser.add_argument("--project", help="GCP project ID (default credentials if omitted)")
    parser.add_argument("--database", default="(default)", help="Firestore database ID")
    parser.add_argument("--serve-collection", default="match_recommendations")
    parser.add_argument("--interaction-collection", default="match_interactions")
    parser.add_argument("--start-ts", help="ISO8601 inclusive lower bound (defaults to 24h ago)")
    parser.add_argument("--end-ts", help="ISO8601 exclusive upper bound (defaults to now)")
    parser.add_argument(
        "--output",
        required=True,
        help="Parquet path to write (e.g., data/eval/live_feedback_20250203.parquet)",
    )
    args = parser.parse_args()

    end_ts = _parse_dt(args.end_ts, default=datetime.now(timezone.utc))
    start_ts = _parse_dt(args.start_ts, default=end_ts - pd.Timedelta(days=1))

    return SnapshotArgs(
        project=args.project,
        database=args.database,
        serve_collection=args.serve_collection,
        interaction_collection=args.interaction_collection,
        start_ts=start_ts,
        end_ts=end_ts,
        output_path=Path(args.output),
    )


def main() -> None:
    args = parse_args()
    args.output_path.parent.mkdir(parents=True, exist_ok=True)
    snapshot = asyncio.run(build_snapshot(args))
    snapshot.to_parquet(args.output_path, index=False)

    metadata = {
        "project": args.project,
        "database": args.database,
        "serve_collection": args.serve_collection,
        "interaction_collection": args.interaction_collection,
        "start_ts": args.start_ts.isoformat(),
        "end_ts": args.end_ts.isoformat(),
        "rows": int(snapshot.shape[0]),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    args.output_path.with_suffix(".json").write_text(
        pd.Series(metadata).to_json(indent=2),
        encoding="utf-8",
    )
    print(f"[bias] snapshot written to {args.output_path} ({snapshot.shape[0]} rows)")


if __name__ == "__main__":
    main()
