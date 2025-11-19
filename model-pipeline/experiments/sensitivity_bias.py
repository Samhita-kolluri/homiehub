# model-pipeline/experiments/sensitivity_bias.py
"""
Feature sensitivity (SHAP), hyperparameter sensitivity helper, and slice-based bias checks.

Requires:
- shap
- numpy, pandas, scikit-learn
- fairlearn (for a MetricFrame-based slice check) -- optional; fallback to group metrics
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import ParameterGrid
from sklearn.metrics import f1_score, precision_score, recall_score, accuracy_score

try:
    import shap
except Exception as e:
    shap = None

try:
    from fairlearn.metrics import MetricFrame
except Exception:
    MetricFrame = None

logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())


@dataclass
class SweepResult:
    params: Dict[str, Any]
    metrics: Dict[str, float]


def compute_shap_feature_importance(
    model, X: pd.DataFrame, n_background: int = 100, out_path: Optional[str] = None
) -> Dict[str, float]:
    """
    Compute mean absolute SHAP values as feature importance.
    Returns dict {feature: mean_abs_shap}
    Writes CSV to out_path if provided.
    """
    if shap is None:
        raise RuntimeError("shap not installed. pip install shap to use this function.")

    # choose explainer
    # KernelExplainer is model-agnostic but expensive; use TreeExplainer when possible
    if hasattr(shap, "TreeExplainer") and "predict_proba" in dir(model):
        try:
            explainer = shap.Explainer(model, X)  # shap >= 0.40 unified API
        except Exception:
            explainer = shap.TreeExplainer(model)
    else:
        background = X.sample(n=min(len(X), n_background), random_state=42)
        explainer = shap.KernelExplainer(model.predict_proba, background)

    shap_values = explainer(X)
    # shap_values may be an Explanation object; get absolute mean across samples
    # for classification, shap_values.values might be list per class — take first/mean
    vals = getattr(shap_values, "values", None)
    if vals is None:
        # fallback: compute shap_values as numpy array
        arr = np.abs(np.array(shap_values))
    else:
        arr = np.array(vals)
    # If arr has shape (n_samples, n_features) or (n_classes, n_samples, n_features)
    if arr.ndim == 3:
        arr = np.mean(np.abs(arr), axis=0)  # mean across classes -> (n_samples, n_features)
    arr = np.mean(np.abs(arr), axis=0)  # mean across samples -> (n_features,)

    features = X.columns.tolist()
    importance = {f: float(v) for f, v in zip(features, arr)}
    if out_path:
        pd.DataFrame({"feature": list(importance.keys()), "importance": list(importance.values())}).to_csv(
            out_path, index=False
        )
    return importance


def hyperparameter_sweep(
    train_fn, param_grid: Dict[str, List[Any]], X_train, y_train, X_val, y_val
) -> List[SweepResult]:
    """
    Run a grid sweep using train_fn(params, X_train, y_train) -> fitted_model.
    Returns list of SweepResult (params + metrics on validation set).
    """
    results: List[SweepResult] = []
    for params in ParameterGrid(param_grid):
        model = train_fn(params, X_train, y_train)
        if hasattr(model, "predict_proba"):
            y_pred = model.predict(X_val)
        else:
            y_pred = model.predict(X_val)
        metrics = {
            "accuracy": float(accuracy_score(y_val, y_pred)),
            "f1": float(f1_score(y_val, y_pred, zero_division=0)),
            "precision": float(precision_score(y_val, y_pred, zero_division=0)),
            "recall": float(recall_score(y_val, y_pred, zero_division=0)),
        }
        results.append(SweepResult(params=params, metrics=metrics))
    return results


def slice_metrics(df: pd.DataFrame, slice_col: str, label_col: str, pred_col: str) -> Dict[str, Dict[str, float]]:
    """
    Compute metrics per group in slice_col. Returns dict {group: {metric: value}}.
    """
    groups = df[slice_col].dropna().unique().tolist()
    out: Dict[str, Dict[str, float]] = {}
    for g in groups:
        sub = df[df[slice_col] == g]
        if len(sub) == 0:
            continue
        y_true = sub[label_col].astype(int).to_numpy()
        y_pred = sub[pred_col].astype(int).to_numpy()
        out[g] = {
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "f1": float(f1_score(y_true, y_pred, zero_division=0)),
            "precision": float(precision_score(y_true, y_pred, zero_division=0)),
            "recall": float(recall_score(y_true, y_pred, zero_division=0)),
            "count": int(len(sub)),
        }
    return out


def fairlearn_slice_report(df: pd.DataFrame, slice_col: str, label_col: str, pred_col: str, metrics: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    If fairlearn is available, produce MetricFrame-based overall/by_group/disparities.
    Otherwise fallback to slice_metrics.
    """
    if MetricFrame is None:
        return {"warning": "fairlearn not installed", "by_group": slice_metrics(df, slice_col, label_col, pred_col)}

    y_true = df[label_col].astype(int).to_numpy()
    y_pred = df[pred_col].astype(int).to_numpy()
    sensitive = df[slice_col].fillna("UNKNOWN").astype(str)
    metric_funcs = metrics or {
        "f1": lambda y_t, y_p: f1_score(y_t, y_p, zero_division=0),
        "precision": lambda y_t, y_p: precision_score(y_t, y_p, zero_division=0),
        "recall": lambda y_t, y_p: recall_score(y_t, y_p, zero_division=0),
    }
    frame = MetricFrame(metrics=metric_funcs, y_true=y_true, y_pred=y_pred, sensitive_features=sensitive)
    disparities = {}
    for k in metric_funcs.keys():
        disparities[k] = {
            "difference": float(frame.difference(method="between_groups")[k]),
            "ratio": float(frame.ratio(method="between_groups")[k]),
        }
    return {
        "overall": frame.overall.to_dict(),
        "by_group": {k: frame.by_group[k].to_dict() for k in metric_funcs.keys()},
        "disparities": disparities,
    }


def suggest_mitigation(df: pd.DataFrame, slice_col: str, label_col: str, pred_col: str) -> List[str]:
    """
    Heuristic suggestions (not automatic): returns list of mitigation suggestions.
    """
    suggestions = []
    by_group = slice_metrics(df, slice_col, label_col, pred_col)
    # if one group very underrepresented -> suggest resampling
    counts = {g: stats["count"] for g, stats in by_group.items()}
    if counts:
        min_count = min(counts.values())
        max_count = max(counts.values())
        if min_count < 0.5 * max_count:
            suggestions.append("Consider upsampling underrepresented groups or collecting more data.")
    # if f1 disparity large -> suggest class reweighting or threshold tuning
    f1s = [stats["f1"] for stats in by_group.values()]
    if max(f1s) - min(f1s) > 0.10:
        suggestions.append("Investigate re-weighting loss, per-group threshold tuning, or fairness-aware training.")
    return suggestions
