# model-pipeline/experiments/visualize.py
"""
Visualization helpers for experiment reporting.

Creates:
- model comparison bar chart (metric across models)
- confusion matrix image for a single model
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, List

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import ConfusionMatrixDisplay, confusion_matrix

# NOTE: matplotlib styling/colors not set so CI/headless environments use defaults.


def plot_metric_comparison(
    results: Dict[str, Dict[str, float]],
    metric: str,
    out_path: str = "metric_comparison.png",
) -> str:
    """
    results: {model_name: {metric_name: value, ...}, ...}
    metric: metric to plot (e.g., "f1", "precision")
    Writes an image and returns path.
    """
    models = []
    values = []
    for model_name, metrics in results.items():
        if metric in metrics:
            models.append(model_name)
            values.append(metrics[metric])
    df = pd.DataFrame({"model": models, metric: values}).sort_values(metric, ascending=False)

    fig, ax = plt.subplots(figsize=(max(4, len(df) * 0.6), 4))
    ax.bar(df["model"], df[metric])
    ax.set_ylabel(metric)
    ax.set_xlabel("model")
    ax.set_title(f"{metric} comparison")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)
    return out_path


def plot_confusion_matrix(
    y_true: List[int],
    y_pred: List[int],
    labels: List[str] | None = None,
    out_path: str = "confusion_matrix.png",
) -> str:
    """
    Create and save confusion matrix image.
    """
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels)
    fig, ax = plt.subplots(figsize=(5, 5))
    disp.plot(ax=ax)
    ax.set_title("Confusion Matrix")
    plt.tight_layout()
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, bbox_inches="tight")
    plt.close(fig)
    return out_path
