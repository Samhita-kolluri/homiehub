"""
Bias detection module using Fairlearn MetricFrame.

Usage:
    python bias_detection.py --snapshot data/eval/live_feedback.parquet \
        --config bias_config.yml --output-dir bias_reports/run_20250203
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
import yaml
from fairlearn.metrics import MetricFrame
from sklearn.metrics import f1_score, precision_score, recall_score


def selection_rate(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.mean(y_pred))


def click_through_rate(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    served = y_pred.astype(bool)
    if served.sum() == 0:
        return 0.0
    return float(y_true[served].mean())


METRIC_REGISTRY = {
    "selection_rate": selection_rate,
    "ctr": click_through_rate,
    "precision": lambda y_true, y_pred: precision_score(
        y_true, y_pred, zero_division=0
    ),
    "recall": lambda y_true, y_pred: recall_score(y_true, y_pred, zero_division=0),
    "f1": lambda y_true, y_pred: f1_score(y_true, y_pred, zero_division=0),
}


@dataclass
class SliceConfig:
    name: str
    column: str
    bins: Optional[List[float]] = None
    labels: Optional[List[str]] = None


@dataclass
class BiasConfig:
    label_column: str
    prediction_column: str
    metrics: Dict[str, Dict[str, Optional[float]]]
    slices: List[SliceConfig]


def load_config(path: Path) -> BiasConfig:
    raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    slices = [
        SliceConfig(
            name=entry.get("name", entry["column"]),
            column=entry["column"],
            bins=entry.get("bins"),
            labels=entry.get("labels"),
        )
        for entry in raw["slices"]
    ]
    return BiasConfig(
        label_column=raw.get("label_column", "clicked"),
        prediction_column=raw.get("prediction_column", "served"),
        metrics=raw["metrics"],
        slices=slices,
    )


def _build_sensitive_col(df: pd.DataFrame, cfg: SliceConfig) -> pd.Series:
    series = df[cfg.column]
    if cfg.bins:
        return pd.cut(
            series,
            bins=cfg.bins,
            labels=cfg.labels,
            include_lowest=True,
        )
    return series.fillna("UNKNOWN").astype(str)


def evaluate_slice(
    df: pd.DataFrame,
    cfg: SliceConfig,
    y_true: np.ndarray,
    y_pred: np.ndarray,
    metrics: Dict[str, Any],
) -> Dict[str, Any]:
    sensitive = _build_sensitive_col(df, cfg)
    frame = MetricFrame(
        metrics=metrics,
        y_true=y_true,
        y_pred=y_pred,
        sensitive_features=sensitive,
    )
    disparities = {
        metric: {
            "difference": float(
                frame.difference(method="between_groups")[metric]
            ),
            "ratio": float(frame.ratio(method="between_groups")[metric]),
        }
        for metric in metrics
    }
    by_group = {metric: frame.by_group[metric].to_dict() for metric in metrics}
    return {
        "slice": cfg.name,
        "column": cfg.column,
        "overall": frame.overall.to_dict(),
        "by_group": by_group,
        "disparities": disparities,
    }


def check_thresholds(
    slice_report: Dict[str, Any],
    thresholds: Dict[str, Dict[str, Optional[float]]],
) -> Dict[str, bool]:
    status: Dict[str, bool] = {}
    for metric, limits in thresholds.items():
        disp = slice_report["disparities"][metric]
        diff_limit = limits.get("max_difference")
        ratio_limit = limits.get("min_ratio")
        diff_ok = diff_limit is None or abs(disp["difference"]) <= diff_limit
        ratio_ok = ratio_limit is None or disp["ratio"] >= ratio_limit
        status[metric] = diff_ok and ratio_ok
    slice_report["metric_status"] = status
    slice_report["passed"] = all(status.values())
    return status


def write_reports(output_dir: Path, payload: Dict[str, Any]) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "bias_report.json").write_text(
        json.dumps(payload, indent=2), encoding="utf-8"
    )

    md_lines: List[str] = [
        "# Bias Report",
        f"- Rows evaluated: {payload['row_count']}",
        f"- Label column: `{payload['label_column']}`",
        f"- Prediction column: `{payload['prediction_column']}`",
        "",
    ]
    for slice_entry in payload["slices"]:
        md_lines.append(f"## Slice: {slice_entry['slice']} (`{slice_entry['column']}`)")
        md_lines.append("")
        groups = list(next(iter(slice_entry["by_group"].values())).keys())
        header = "| Group | " + " | ".join(slice_entry["overall"].keys()) + " |"
        md_lines.append(header)
        md_lines.append("|" + " --- |" * (len(slice_entry["overall"]) + 1))
        for group in groups:
            row = [group]
            for metric in slice_entry["overall"].keys():
                row.append(f"{slice_entry['by_group'][metric].get(group, float('nan')):.3f}")
            md_lines.append("| " + " | ".join(row) + " |")
        md_lines.append("")
        md_lines.append("Disparities:")
        for metric, stats in slice_entry["disparities"].items():
            status = "PASS" if slice_entry["metric_status"][metric] else "FAIL"
            md_lines.append(
                f"- **{metric}** diff={stats['difference']:.3f}, "
                f"ratio={stats['ratio']:.3f} → {status}"
            )
        md_lines.append("")
    (output_dir / "bias_report.md").write_text("\n".join(md_lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run fairness slice analysis")
    parser.add_argument("--snapshot", required=True, help="Snapshot parquet path")
    parser.add_argument("--config", required=True, help="Bias config YAML")
    parser.add_argument("--output-dir", default="bias_reports/latest")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = load_config(Path(args.config))
    df = pd.read_parquet(args.snapshot)
    if df.empty:
        raise RuntimeError("Snapshot contains no rows")

    missing_cols = {cfg.label_column, cfg.prediction_column} - set(df.columns)
    if missing_cols:
        raise KeyError(f"Snapshot missing required columns: {missing_cols}")

    y_true = df[cfg.label_column].astype(int).to_numpy()
    y_pred = df[cfg.prediction_column].astype(int).to_numpy()

    metric_funcs = {
        name: METRIC_REGISTRY[name]
        for name in cfg.metrics.keys()
        if name in METRIC_REGISTRY
    }
    slice_reports: List[Dict[str, Any]] = []
    for slice_cfg in cfg.slices:
        if slice_cfg.column not in df.columns:
            print(f"[bias] skipping slice {slice_cfg.name}: column {slice_cfg.column} missing")
            continue
        slice_entry = evaluate_slice(df, slice_cfg, y_true, y_pred, metric_funcs)
        check_thresholds(slice_entry, cfg.metrics)
        slice_reports.append(slice_entry)

    payload = {
        "row_count": int(df.shape[0]),
        "label_column": cfg.label_column,
        "prediction_column": cfg.prediction_column,
        "metrics": list(metric_funcs.keys()),
        "slices": slice_reports,
    }
    write_reports(Path(args.output_dir), payload)

    failing = [s["slice"] for s in slice_reports if not s.get("passed", True)]
    if failing:
        raise SystemExit(f"Bias detection failed for slices: {failing}")


if __name__ == "__main__":
    main()
