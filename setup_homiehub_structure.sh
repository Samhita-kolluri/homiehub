#!/bin/bash

# ================================
# HomieHub Project Setup
# ================================

PROJECT_ROOT="homiehub"
mkdir -p $PROJECT_ROOT

# -------------------------------
# Data directories
# -------------------------------
mkdir -p $PROJECT_ROOT/data/{raw/{whatsapp_exports,public_datasets,synthetic_data},processed,version_control}

# -------------------------------
# Source code directories
# -------------------------------
mkdir -p $PROJECT_ROOT/src/{ingestion/{bot,data_handlers},preprocessing/{text_processing,feature_extraction},matching/{algorithm,recommendation},web/{frontend,auth},utils}

# -------------------------------
# Deployment & infra
# -------------------------------
mkdir -p $PROJECT_ROOT/deployment/{deployment_configs,workflows,container_configs}

# -------------------------------
# Notebooks
# -------------------------------
mkdir -p $PROJECT_ROOT/notebooks/{exploration,modeling,evaluation}

# -------------------------------
# Docs
# -------------------------------
mkdir -p $PROJECT_ROOT/docs

# -------------------------------
# Tests
# -------------------------------
mkdir -p $PROJECT_ROOT/tests/{unit_tests,integration_tests,performance_tests}

# -------------------------------
# Root files
# -------------------------------
touch $PROJECT_ROOT/{requirements.txt,.gitignore,LICENSE,README.md}
touch $PROJECT_ROOT/docs/{api_specs.md,architecture.md,usage_guide.md}

echo "✅ HomieHub structure created successfully!"
echo "📁 Directory: $(pwd)/$PROJECT_ROOT"