# model-pipeline/experiments/tracker.py
"""
MLflow-backed experiment tracking helpers.
Requires: mlflow, scikit-learn
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

import mlflow
from mlflow import MlflowClient
from sklearn.base import BaseEstimator

MLFLOW_DEFAULT_URI = os.getenv("MLFLOW_TRACKING_URI", "file://./mlruns")


def start_run(run_name: Optional[str] = None, experiment_name: str = "default"):
    """Start or get MLflow experiment and begin a run (context manager style)."""
    mlflow.set_tracking_uri(MLFLOW_DEFAULT_URI)
    client = MlflowClient()
    # create experiment if missing
    exp = client.get_experiment_by_name(experiment_name)
    if exp is None:
        client.create_experiment(experiment_name)
    mlflow.set_experiment(experiment_name)
    return mlflow.start_run(run_name=run_name)


def log_params(params: Dict[str, Any]) -> None:
    """Log a param dict to the active MLflow run."""
    for k, v in params.items():
        try:
            mlflow.log_param(k, v)
        except Exception:
            mlflow.log_param(k, json.dumps(v))


def log_metrics(metrics: Dict[str, float], step: Optional[int] = None) -> None:
    """Log metrics to the active run."""
    for k, v in metrics.items():
        if step is not None:
            mlflow.log_metric(k, float(v), step=step)
        else:
            mlflow.log_metric(k, float(v))


def log_artifact(path: str) -> None:
    """Log a file artifact (plot, report, etc.)."""
    mlflow.log_artifact(path)


def log_model(model: BaseEstimator, artifact_path: str = "model") -> None:
    """
    Log a sklearn-compatible model to MLflow.
    If you use other frameworks, replace with mlflow.pytorch/log_model etc.
    """
    mlflow.sklearn.log_model(model, artifact_path)


def end_run():
    """End the active MLflow run."""
    mlflow.end_run()
