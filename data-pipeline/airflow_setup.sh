#!/bin/bash
# HomieHub Data Pipeline Setup Script
# Prepares Airflow environment for GCP-based ETL pipeline
# pip install "apache-airflow[gcp]==3.1.1" --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-3.1.1/constraints-3.11.txt"

set -e

# ================== Colors ==================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ================== Setup ==================
echo -e "${NC}HomieHub Data Pipeline Setup${NC}"
echo "================================"

# Remove old environment/config if exists
rm -f .env
rm -rf ./logs ./plugins ./config

# Stop and remove containers, networks, and volumes
docker compose down -v || true

# Create required Airflow directories
mkdir -p ./logs ./plugins ./config

# Write the current user's UID into .env
echo "AIRFLOW_UID=$(id -u)" > .env

echo -e "${GREEN} Setup complete!${NC}"
echo ""

# ================== Next Steps ==================
echo -e "${BLUE}Next steps:${NC}"
echo -e "${BLUE}1.${NC} Ensure your GCP credentials are available at ./GCP_Account_Key.json"
echo -e "${BLUE}2.${NC} Initialize Airflow: docker-compose up airflow-init"
echo -e "${BLUE}3.${NC} Start Airflow: docker-compose up -d"
echo -e "${BLUE}4.${NC} Access the Airflow UI at http://localhost:8080"
echo -e "${BLUE}5.${NC} Your ETL DAG (homiehub_data_pipeline) should appear in the DAGs list"
