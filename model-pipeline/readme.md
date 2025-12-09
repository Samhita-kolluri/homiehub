# **HomieHub Model Pipeline**

The **HomieHub Model Pipeline** contains all backend intelligence components for housing recommendations, embeddings, LLM processing, and Firestore interactions.
It is implemented as **three independent microservices**, each deployed on Google Cloud Run.

---

## **1. Overview**

The model pipeline includes:

### **Core Services**

* **LLM Agent** — Conversational interface powered by VertexAI Gemini for reasoning + LangGraph
* **Recommendation Service** — custom embeddings trained on Firestore data + Vector similarity search + rule-based filtering
* **User-Room Service** — User/room validation, CRUD, and embedding triggers

### **Supporting Infrastructure**

* Bias detection & fairness evaluation
* MLflow experiment tracking
* CI/CD pipelines built with GitHub Actions
* Firestore + GCP Cloud Functions
* Docker-based reproducible deployments

---

## **2. Architecture**

### **Service Layout**

```
model-pipeline/
├── llm-agent/               # LLM-based chat interface
├── recommendation-service/  # Vector search + ranking engine
└── user-room-service/       # CRUD + data validation + embeddings
└── experiments/             # MLflow tracking, bias/fairness evaluation, hyperparameter tuning
```
---

## **3. Service Summaries**

## **3.1 LLM Agent Service (`llm-agent/`)**

**Purpose**
Conversational interface that interprets user queries, extracts intent, and invokes the recommendation service.

**Responsibilities**

* Accepts `/chat` messages
* Runs Gemini through LangGraph
* Extracts filters (budget, location, lifestyle)
* Calls recommendation-service
* Returns formatted responses
* Does **not** connect to Firestore directly

**Technologies**

* VertexAI Gemini
* LangGraph
* FastAPI
* Pydantic

**Run Locally**

```bash
cd llm-agent
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

## **3.2 Recommendation Service (`recommendation-service/`)**

**Purpose**
Core matching engine computing vector similarity + filtering logic.

**Responsibilities**

* Fetch room/user vectors from Firestore
* Compute similarity score
* Apply filtering rules (rent, lifestyle, preferences)
* Rank results and return top-N to LLM Agent

**Run Locally**

```bash
cd recommendation-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

---

## **3.3 User-Room Service (`user-room-service/`)**

**Purpose**
Manages all data creation/updates and triggers embedding generation via Cloud Functions.

**Responsibilities**

* `/users` + `/rooms` CRUD
* 30+ field validation
* Store raw data in Firestore
* Trigger embedding computation via Firestore events
* Store final embeddings back into Firestore

**Run Locally**

```bash
cd user-room-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
```

---

## **4. Data Flow**

### **High-Level Flow**

1. User enters details
2. User-room-service validates and stores data
3. Firestore triggers Cloud Function
4. Cloud Function computes embeddings
5. Recommendation service fetches vectors
6. LLM Agent orchestrates chat → recommendation → results

Diagram:
![](assets/5-flow.png)

---

## **5. API Endpoints**

## **5.1 LLM Agent**

**POST**
`/chat`
`https://homiehub-llm-agent-api-766767793599.us-east4.run.app/chat`

**Sample Request**

```json
{
  "user_id": "N7BHzi80hxrkDeOBAzi7",
  "message": "Find me rooms in Cambridge Area"
}
```

---

## **5.2 Recommendation Service**

**POST**
`/recommendation`
`https://homiehub-recommendation-api-766767793599.us-east4.run.app/recommendation`

**Sample Request**

```json
{
  "user_id": "N7BHzi80hxrkDeOBAzi7",
  "max_rent": 2000,
  "limit": 10
}
```

---

## **5.3 User-Room Service (Internal)**

```
POST /users
POST /rooms
GET  /users/{id}
GET  /rooms/{id}
```

---

## **6. Embedding Logic**

Both users and rooms are converted into weighted embedding vectors.

### **Feature Categories**

* Location
* Rent / budget
* Lease duration
* Room type
* Bathroom type
* Lifestyle preferences
* Utilities included

### **Workflow**

1. User/room-service writes raw data
2. Firestore triggers Cloud Function
3. Cloud Function computes embedding vector
4. Firestore stores computed embeddings
5. Recommendation service runs vector similarity

### Bias & Fairness Checks

* Each model version is evaluated across demographic and feature slices.
* Metrics such as representation balance, ranking parity, and statistical parity differences are logged in MLflow.
* Bias mitigation techniques (resampling, reweighting) are applied automatically if disparities are detected.


### Model Training & Versioning

* Training data is pulled from Firestore via the data pipeline.
* Multiple model versions are trained and logged in MLflow.
* Validation is performed on hold-out datasets; metrics logged include F1-score, accuracy, and slice-level fairness metrics.
* The best-performing model is pushed to GCP Artifact Registry and MLflow Model Registry for version control.

---

## **7. Deployment Overview**

### **Cloud Run Services**

| Service                    | URL                                                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LLM Agent**              | [https://homiehub-llm-agent-api-766767793599.us-east4.run.app/chat](https://homiehub-llm-agent-api-766767793599.us-east4.run.app/chat)                               |
| **Recommendation Service** | [https://homiehub-recommendation-api-766767793599.us-east4.run.app/recommendation](https://homiehub-recommendation-api-766767793599.us-east4.run.app/recommendation) |
| **User-Room CRUD API**     | Internal only                                                                                                                                                        |

### **Other Components**

* Firestore (documents + vector indexes)
* Cloud Functions (embedding generation)
* VertexAI Gemini (LLM processing)

---

## **8. Monitoring & Failure Handling**

### **Monitoring**

* VertexAI LLM latency
* Tool-call success rates
* Firestore read/write latency
* Missing or invalid embeddings
* Slice-based fairness metrics

### **Failure Handling**

* Automatic retries
* Safe fallback ranking
* Strict input validation
* Cloud Function auto-retry

### Notifications & Alerts

* CI/CD pipeline sends notifications on:
  - Pipeline failures
  - Completion of model training
  - Bias violations
  - Model rollback events

![](assets/8-notify-ext.png)

![](assets/8-notify-trans.png)

![](assets/8-nofity-load.png)
* Email integration is configured via GitHub Actions workflows.

---

## **9. Repo Structure**

```
model-pipeline/
├── llm-agent/                     # LLM-based reasoning and generative evaluations
│   ├── agent_core/                # Core agent loop, tools, and thought manager
│   ├── api/                       # FastAPI endpoints for agent operations
│   ├── services/                  # Vector search, retrieval, scoring
│   ├── config/                    # Agent configuration + model settings
│   ├── Dockerfile
│   └── requirements.txt
│
├── recommendation-service/        # Personalized roommate & listing recommendations
│   ├── core/                      # Ranking logic, preference learning, heuristics
│   ├── services/                  # Similarity scoring, re-rankers, embeddings
│   ├── config/
│   ├── Dockerfile
│   └── requirements.txt
│
├── user-room-service/             # Shared user-room features under model-pipeline
│   ├── core/                      # Room/user vectorization, data adapters
│   ├── services/                  # Feature extraction & embedding pipeline
│   ├── config/
│   ├── Dockerfile
│   └── requirements.txt
│
├── experiments/                   # MLflow tracking, bias/fairness evaluation, hyperparameter tuning
│   ├── artifacts/
│   ├── bias/
│   ├── mlruns/
│   ├── model_env/
│   ├── reports/
│   ├── homiehub_mlflow.py
│   ├── prompt_mlflow.py
│   ├── run_report.py
│   ├── sensitivity_bias.py
│   ├── tracker.py
│   └── visualize.py
│
└── gcloud/functions/              # Cloud Functions for real-time recommendations
    ├── match_trigger/             # Event-driven matching function
    ├── embeddings_update/         # Periodic embedding refresh
    └── deployment/                # gcloud/terraform scripts
    
```

## 10. Bias & Experiment Layer

The HomieHub pipeline includes a **dedicated layer for fairness monitoring and experiment tracking** to ensure transparent, unbiased, and reproducible recommendations.

- **Metrics Tracked:**
  - Representation balance across sensitive attributes (gender, area, food preferences)
  - Ranking parity (ensuring equitable top-N results)
  - Statistical parity difference
  - Missing-embedding detection
- **Mitigation:** The system can resample or reweight data slices to reduce bias before generating recommendations.

### Hyperparameter Tuning & Sensitivity Analysis

* Grid search, random search, Bayesian optimization are used to tune model hyperparameters.
* Sensitivity analysis tracks how feature changes or hyperparameter adjustments affect model performance.
* SHAP or LIME is used to determine feature importance and explain model predictions.
* Results are logged in MLflow and visualized for comparison between model versions.

### Experiment Tracking
- **Objective:** Monitor model performance and experiment reproducibility.
- **Tools:** : GitHub Actions
- **Tracked Metrics:**
  - Model evaluation metrics (accuracy, f1-score, precision, recall)
  - Slice-level performance metrics across sensitive features
  - Experiment configurations (hyperparameters, embeddings used, feature weights)

![MLflow Experiments](assets/6-mlflow-logs.png)

- **Benefits:** Enables comparison of model variants, reproducible experiments, and fair model selection.
* Dockerized training environments ensure reproducibility.
* Developers can compare multiple versions using MLflow UI dashboards.

![MLflow Experiments](assets/7-artifacts.png)


### Integration with Pipeline
1. When user/room data is updated, the system logs experiment metrics.
2. Recommendations are evaluated for fairness across demographic slices.
3. Bias metrics and model evaluation results are stored in MLflow dashboards.
4. Developers can visualize and compare experiments and fairness metrics to make informed decisions.

## **11. CI/CD Pipeline for Model Training**

* GitHub Actions triggers:
    - Model training on new commits affecting the pipeline
    - Automated validation on hold-out datasets
    - Bias checks across slices
* If a model fails validation or bias thresholds, deployment is blocked
* Successful models are automatically pushed to MLflow and GCP Artifact Registry
* Rollback mechanism ensures previous stable model remains in production

![](assets/9-notify-llm.png)

## **12. ML Code Implementation**

* Loading data from Firestore pipeline
* Training multiple model architectures / hyperparameter tuning
* Validating model performance (accuracy, F1, slice-level fairness)
* Bias checking and mitigation
* Pushing selected model to GCP Artifact Registry
* Dockerized environment ensures reproducibility


## **13. Conclusion**

The HomieHub Model Pipeline provides a robust, scalable, and fairness-aware architecture for intelligent housing recommendations.
Built with cloud-first principles and modern MLOps, it ensures reliability, explainability, and real-time performance across all services.

---