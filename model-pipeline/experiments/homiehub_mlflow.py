# homiehub_mlflow.py
"""
HomieHub MLflow tracking script — pipeline-friendly.
- Logs params, metrics, artifacts
- Registers a model in MLflow Model Registry (creates registered model if needed)
- Logs per-lane latency metrics
- Creates trace IDs and trace-links for Firestore & GCP logs, saved as artifacts + tags
"""

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import mlflow
from mlflow.tracking import MlflowClient

# ----------------------------
# Configuration
# ----------------------------
EXPERIMENT_NAME = "homiehub_recommendation_pipeline"
MODEL_REGISTRY_NAME = "homiehub_ranking_model" 
PIPELINE_VERSION = "v1.3"
ARTIFACT_ROOT = Path("artifacts")

# ----------------------------
# Embeddings
# ----------------------------
EMBEDDING_WEIGHTS = {"location": 0.4, "rent": 0.3, "lifestyle": 0.3}
BIAS_METRICS_DEFAULT = {
    "top_3_accuracy_global": 0.75,
    "top_3_accuracy_slice_a": 0.80,
    "top_3_accuracy_slice_b": 0.70,
    "bias_statistical_parity_diff": 0.05,
}

# ----------------------------
# Helpers
# ----------------------------
def _ensure_artifact_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)

def _save_json(obj: Any, path: Path):
    with open(path, "w") as f:
        json.dump(obj, f, indent=2)
    return str(path)

def _make_trace_links(trace_id: str, run_id: str, project: Optional[str] = None) -> Dict[str, str]:
    """
    Construct helpful trace links (placeholders) that point to your log systems.
    - Firestore link pattern and GCP log viewer pattern vary by org; these are templates.
    Replace with real URLs in your deployment.
    """
    firestore_link = f"https://console.firebase.google.com/project/{project or 'YOUR_PROJECT'}/firestore/data/~2Fruns~2F{run_id}?trace={trace_id}"
    gcp_logs_link = f"https://console.cloud.google.com/logs/query;query=trace:{trace_id}?project={project or 'YOUR_PROJECT'}"
    return {"trace_id": trace_id, "firestore_link": firestore_link, "gcp_logs_link": gcp_logs_link}

# ----------------------------
# MLflow logging function
# ----------------------------
def log_homiehub_run(
    *,
    user_payload: Dict[str, Any],
    room_candidates: List[Dict[str, Any]],
    recommendations: List[Dict[str, Any]],
    embeddings: Dict[str, Any],
    bias_metrics: Optional[Dict[str, float]] = None,
    latency_metrics: Optional[Dict[str, float]] = None,
    model_metadata: Optional[Dict[str, Any]] = None,
    trace_id: Optional[str] = None,
    project_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Log one HomieHub pipeline run to MLflow and register a model version.

    Params:
      - user_payload: validated user input (dict(UserCreate))
      - room_candidates: list of room dicts (dict(RoomCreate) for each)
      - recommendations: list of {"room_id":..., "score": ...}
      - embeddings: user + room embeddings
      - bias_metrics: fairness / accuracy values (defaults used if None)
      - latency_metrics: e.g. {"data_pipeline_ms": ..., "model_pipeline_ms": ..., "llm_agent_ms": ..., "recommendation_ms": ...}
      - model_metadata: optional dict describing model (name, framework, path, hyperparams)
      - trace_id: optional trace id (uuid) — if not given, generated
      - project_name: optional GCP / Firebase project used to build trace links
    Returns:
      - dict containing run_id, model_version_info, trace_links
    """
    mlflow.set_experiment(EXPERIMENT_NAME)
    client = MlflowClient()

    bias_metrics = bias_metrics or BIAS_METRICS_DEFAULT
    latency_metrics = latency_metrics or {
        "latency.data_pipeline_ms": 12.0,
        "latency.model_pipeline_ms": 25.0,
        "latency.llm_agent_ms": 80.0,
        "latency.recommendation_ms": 5.0,
        "latency.total_ms": 122.0,
    }

    # create a trace id if not provided
    trace_id = trace_id or str(uuid.uuid4())
    trace_links = _make_trace_links(trace_id, "RUN_ID_PLACEHOLDER", project_name)

    run_name = f"homiehub_reco_run_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    with mlflow.start_run(run_name=run_name) as run:
        run_id = run.info.run_id
        run_artifact_dir = ARTIFACT_ROOT / run_id
        _ensure_artifact_dir(run_artifact_dir)

        # ----------------------------
        # 1. Log parameters & tags
        # ----------------------------
        mlflow.log_params(EMBEDDING_WEIGHTS)
        mlflow.log_param("top_n", len(recommendations))
        mlflow.log_param("pipeline_version", PIPELINE_VERSION)
        mlflow.set_tag("component", "homiehub_recommender")
        mlflow.set_tag("run_name", run_name)
        mlflow.set_tag("trace_id", trace_id)
        if project_name:
            mlflow.set_tag("gcp_project", project_name)

        # ----------------------------
        # 2. Save & log artifacts (inputs/outputs/embeddings)
        # ----------------------------
        user_path = run_artifact_dir / "user_payload.json"
        rooms_path = run_artifact_dir / "room_candidates.json"
        recs_path = run_artifact_dir / "recommendations.json"
        emb_path = run_artifact_dir / "embeddings.json"

        _save_json(user_payload, user_path)
        _save_json(room_candidates, rooms_path)
        _save_json(recommendations, recs_path)
        _save_json(embeddings, emb_path)

        mlflow.log_artifact(str(user_path), artifact_path="inputs")
        mlflow.log_artifact(str(rooms_path), artifact_path="inputs")
        mlflow.log_artifact(str(recs_path), artifact_path="outputs")
        mlflow.log_artifact(str(emb_path), artifact_path="outputs")

        # ----------------------------
        # 3. Bias & Latency metrics
        # ----------------------------
        for name, val in (bias_metrics or {}).items():
            mlflow.log_metric(name, float(val))

        for name, val in (latency_metrics or {}).items():
            mlflow.log_metric(name, float(val))

        # ----------------------------
        # 4. Model metadata & registry
        # ----------------------------
        # Prepare model metadata artifact
        model_metadata = model_metadata or {
            "model_name": MODEL_REGISTRY_NAME,
            "model_version_label": PIPELINE_VERSION,
            "framework": "custom",
            "artifact": "model.bin",
            "created_at": datetime.utcnow().isoformat() + "Z",
        }

        model_meta_path = run_artifact_dir / "model_metadata.json"
        _save_json(model_metadata, model_meta_path)
        mlflow.log_artifact(str(model_meta_path), artifact_path="model")

        # Register model in MLflow Model Registry:
        # - Create registered model if not present
        try:
            client.create_registered_model(MODEL_REGISTRY_NAME)
        except Exception:
            # already exists
            pass

        # Create a model version that points to the model metadata artifact in this run
        model_source = f"runs:/{run_id}/model/model_metadata.json"
        try:
            mv = client.create_model_version(
                name=MODEL_REGISTRY_NAME,
                source=model_source,
                run_id=run_id,
                description=f"Auto-registered from pipeline run {run_id}"
            )
            # Optionally transition to a stage (None by default). Uncomment to auto-stage:
            client.transition_model_version_stage(
                 name=MODEL_REGISTRY_NAME, version=mv.version, stage="Staging", archive_existing_versions=True
             )
            model_version_info = {
                "name": mv.name,
                "version": mv.version,
                "source": mv.source,
                "status": mv.status
            }
        except Exception as e:
            # If registration fails, log an error-like tag and continue
            mlflow.set_tag("model_registry_error", str(e))
            model_version_info = {"error": str(e), "attempted_source": model_source}

        # ----------------------------
        # 5. Trace links artifact + tags (link run -> logs)
        # ----------------------------
        # update links with actual run_id
        trace_links = _make_trace_links(trace_id, run_id, project_name)
        trace_path = run_artifact_dir / "trace_links.json"
        _save_json(trace_links, trace_path)
        mlflow.log_artifact(str(trace_path), artifact_path="traces")

        # tags for quick view in UI
        mlflow.set_tag("firestore_link", trace_links["firestore_link"])
        mlflow.set_tag("gcp_logs_link", trace_links["gcp_logs_link"])

        # ----------------------------
        # 6. Final print + return
        # ----------------------------
        result = {
            "run_id": run_id,
            "run_name": run_name,
            "model_version_info": model_version_info,
            "trace_links": trace_links,
        }

        print("✅ HomieHub MLflow run logged:", json.dumps(result, indent=2))
        return result


# ----------------------------
# Example / Quick-run (when executed directly)
# ----------------------------
if __name__ == "__main__":
    # example inputs (replace with dict(UserCreate) / dict(RoomCreate) in production)
    user = {
        "user_id": "N7BHzi80hxrkDeOBAzi7",
        "message": "Find me rooms in Cambridge Area",
        "filters": {"max_rent": 2000, "room_type": "2BHK", "lease_duration": "12 months"},
    }

    rooms = [
        {"room_id": "R1001", "location": "Cambridge", "rent": 1800},
        {"room_id": "R1015", "location": "Cambridge", "rent": 1600},
    ]

    recs = [{"room_id": "R1001", "score": 0.92}, {"room_id": "R1015", "score": 0.87}]
    emb = {"user_vector": [0.2, 0.5, 0.3], "room_vectors": {"R1001": [0.21, 0.48, 0.31], "R1015": [0.19, 0.51, 0.29]}}

    latencies = {
        "latency.data_pipeline_ms": 15.5,
        "latency.model_pipeline_ms": 28.2,
        "latency.llm_agent_ms": 120.1,
        "latency.recommendation_ms": 6.3,
        "latency.total_ms": 170.1,
    }

    model_meta = {
        "model_name": MODEL_REGISTRY_NAME,
        "framework": "onnx",
        "artifact": "ranking.onnx",
        "hyperparams": {"embed_dim": 128, "similarity": "cosine"},
    }

    out = log_homiehub_run(
        user_payload=user,
        room_candidates=rooms,
        recommendations=recs,
        embeddings=emb,
        bias_metrics=None,
        latency_metrics=latencies,
        model_metadata=model_meta,
        trace_id=None,        
        project_name="my-gcp-project"
    )

    print("Run summary:", out)
