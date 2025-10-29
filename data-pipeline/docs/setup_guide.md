# HomieHub Setup Guide

This comprehensive guide will walk you through setting up the HomieHub data pipeline on your local machine or development environment.

## Table of Contents
- [System Requirements](#system-requirements)
- [Environment Setup](#environment-setup)
- [Google Cloud Platform Configuration](#google-cloud-platform-configuration)
- [Airflow Installation](#airflow-installation)
- [Dependencies Installation](#dependencies-installation)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **Operating System**: macOS, Linux, or Windows with WSL2
- **Python**: 3.11 or higher
- **Memory**: 8GB RAM minimum, 12GB recommended
- **Disk Space**: 10GB free space
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Apache Airflow**: 3.1.1 (requires Python 3.11)

### Software Prerequisites
```bash
# Check Python version
python --version  # Should be 3.11+

# Check Docker version
docker --version  # Should be 20.10+

# Check Docker Compose version
docker-compose --version  # Should be 2.0+
```
Important: Apache Airflow 3.1.1 specifically requires Python 3.11. Using other Python versions may cause compatibility issues.

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/homiehub/homiehub.git
cd data-pipeline
```

### 2. Create Python Virtual Environment
```bash
# Ensure you're using Python 3.11
python3.11 --version  # Verify Python 3.11 is installed

# Create virtual environment with Python 3.11
python3.11 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Verify Python version in venv
python3 --version  # Should show Python 3.11.x
```

### 3. Install Python Dependencies
```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements from data-pipeline directory
cd /path/to/homiehub/data-pipeline
pip install -r requirement.txt

# Install Apache Airflow 3.1.1 with GCP support and Python 3.11 constraints
pip install "apache-airflow[gcp]==3.1.1" --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-3.1.1/constraints-3.11.txt"
```

### 4. Create Project Structure
```bash
# From data-pipeline directory
cd /path/to/homiehub/data-pipeline

# Create necessary directories
mkdir -p data/{raw,processed}
mkdir -p logs
mkdir -p config
mkdir -p tests
```

## Google Cloud Platform Configuration

### 1. Create GCP Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Note your Project ID

### 2. Enable Required APIs
Enable the following APIs in your GCP project:
- Cloud Storage API
- Cloud Storage JSON API

```bash
# Using gcloud CLI
gcloud services enable storage-api.googleapis.com
gcloud services enable storage-component.googleapis.com
```

### 3. Create Storage Bucket
```bash
# Create bucket (replace with your bucket name)
gsutil mb gs://homiehub-data-bucket

# Set bucket permissions
gsutil iam ch allUsers:objectViewer gs://homiehub-data-bucket
```

### 4. Create Service Account
1. Navigate to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Name: `homiehub-service-account`
4. Grant roles:
   - Storage Admin
   - Storage Object Admin
5. Create and download JSON key
6. Save as `GCP_Account_Key.json` in project root

### 5. Set Environment Variables
HomieHub uses multiple configuration files for different purposes to maintain security:
GCP Configuration (in `GCP_Account_Key.json`)
Your Google Cloud service account key file should contain:
```bash
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  ...
}
```

**Email Configuration (in `.env.local` - SECRET)**

Create a .env.local file for sensitive email credentials:
```bash
cd /path/to/homiehub/data-pipeline
cat > .env.local << EOF
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_EMAIL=recipient@example.com
EOF

# Add .env.local to .gitignore to prevent accidental commits
echo ".env.local" >> .gitignore
```

## Airflow Installation

### 1. Run Setup Script
```bash
# Make script executable
cd /path/to/homiehub/data-pipeline

# Run setup
bash setup_airflow.sh
```

This script will:
- Clean previous installations
- Create required directories
- Set up Docker environment
- Configure Airflow user permissions

### 2. Initialize Airflow Database
```bash
docker-compose up airflow-init
```

### 3. Start Airflow Services
```bash
# Start in detached mode
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Configure Airflow Connections
1. Access Airflow UI: http://localhost:8080
2. Login (default: airflow/airflow)
3. Go to Admin > Connections
4. Add GCP connection:
   - Connection Id: `google_cloud_default`
   - Connection Type: `Google Cloud`
   - Keyfile Path: `/opt/airflow/GCP_Account_Key.json`

## Dependencies Installation
Python Version Requirement
Critical: HomieHub requires Python 3.11 specifically for Apache Airflow 3.1.1 compatibility.

### Core Dependencies
```bash
# Activate virtual environment with Python 3.11
cd /path/to/homiehub/data-pipeline
python3.11 -m venv venv
source venv/bin/activate

# Install Airflow 3.1.1 with GCP support and Python 3.11 constraints
pip install "apache-airflow[gcp]==3.1.1" \
    --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-3.1.1/constraints-3.11.txt"

# Note: The [gcp] extra includes Google Cloud providers automatically
# Additional dependencies as needed:
pip install \
    pandas==2.1.4 \
    numpy==1.24.3 \
    spacy==3.7.2 \
    great-expectations==0.18.7 \
    dvc==3.38.1 \
    fairlearn==0.10.0 \
    pytest==7.4.3
```

### NLP Model
```bash
# Download spaCy English model
python -m spacy download en_core_web_sm
```

### Additional Tools
```bash
# Install development tools
pip install \
    black==23.12.1 \
    flake8==7.0.0 \
    pre-commit==3.6.0

# Set up pre-commit hooks
pre-commit install
```

## Configuration

### 1. Pipeline Configuration
Create `config/pipeline_config.yaml`:
```yaml
pipeline:
  name: homiehub_data_pipeline
  schedule: "0 2 * * *"  # Daily at 2 AM
  
gcp:
  project_id: ${GCP_PROJECT_ID}
  bucket_name: ${GCP_BUCKET_NAME}
  
processing:
  batch_size: 100
  max_workers: 4
  
nlp:
  model: en_core_web_sm
  confidence_threshold: 0.8
  
validation:
  enable_schema_check: true
  enable_bias_detection: true
  
notifications:
  enable_email: true
  alert_on_failure: true
```

### 2. Logging Configuration
Create `config/logging_config.yaml`:
```yaml
version: 1
disable_existing_loggers: false

formatters:
  default:
    format: '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

handlers:
  console:
    class: logging.StreamHandler
    level: INFO
    formatter: default
    
  file:
    class: logging.handlers.RotatingFileHandler
    level: DEBUG
    formatter: default
    filename: logs/homiehub.log
    maxBytes: 10485760  # 10MB
    backupCount: 5

root:
  level: INFO
  handlers: [console, file]
```

## Verification

### 1. Test Installation
```bash
# Run test suite
python -m pytest tests/ -v

# Check Airflow
curl -X GET http://localhost:8080/api/v1/health

# Test GCP connection
python -c "from google.cloud import storage; print('GCP connection successful')"
```

### 2. Verify DAG Loading
1. Access Airflow UI
2. Check for `homiehub_data_pipeline` in DAGs list
3. Verify no import errors

### 3. Run Sample Pipeline
```bash
# Using the run script
./etl_script.sh

# Or manually
python -m pipelines.etl --test
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Docker Permission Errors
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Port Already in Use
```bash
# Check what's using port 8080
lsof -i :8080

# Stop conflicting service or change Airflow port
# Edit docker-compose.yml to use different port
```

#### 3. GCP Authentication Errors
```bash
# Verify credentials
gcloud auth application-default login

# Check service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

#### 4. Airflow DAG Import Errors
```bash
# Check DAG syntax
python dags/homiehub_data_pipeline.py

# View Airflow logs
docker-compose logs airflow-scheduler
```

#### 5. Memory Issues
```bash
# Increase Docker memory allocation
# Docker Desktop > Preferences > Resources
# Set Memory to at least 8GB
```

### Getting Help

If you encounter issues not covered here:

1. Check the [logs directory](../logs/) for detailed error messages
2. Review [Airflow documentation](https://airflow.apache.org/docs/)
3. Search existing [GitHub issues](https://github.com/homiehub/homiehub/issues)
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - System information
   - Relevant log files

## Next Steps

After successful setup:
1. Review the [Data Pipeline Documentation](../README.md)
2. Learn about [Script Usage](./scripts_usage.md)
3. Configure your data sources
4. Start processing housing listings!

---
**Note**: Keep your GCP credentials secure and never commit them to version control.