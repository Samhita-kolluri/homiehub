# HomieHub Scripts Usage Documentation

This guide provides detailed instructions for using the automation scripts included with the HomieHub data pipeline.

## Available Scripts

1. [**`airflow_setup.sh`**](../airflow_setup.sh) - Environment setup and Airflow initialization
2. [**`ETL_SCRIPT.sh`**](../ETL_SCRIPT.sh) - Execute the ETL pipeline manually

## Script Details

### 1. airflow_setup.sh

#### Purpose
Prepares the Airflow environment for the GCP-based ETL pipeline by cleaning previous installations, creating required directories, and configuring Docker containers.

#### Usage
```bash
# Navigate to data-pipeline directory
cd data-pipeline

# Make executable (first time only)
chmod +x airflow_setup.sh

# Run the script
./airflow_setup.sh
```

#### What It Does

1. **Environment Cleanup**
   - Removes existing `.env` file
   - Deletes old logs, plugins, and config directories
   - Stops and removes Docker containers
   - Cleans up Docker volumes

2. **Directory Creation**
   ```bash
   mkdir -p ./logs ./plugins ./config
   ```

3. **User Configuration**
   - Sets Airflow UID based on current user
   - Writes configuration to `.env` file

#### Expected Output
```
HomieHub Data Pipeline Setup
================================
✅ Setup complete!

Next steps:
1. Ensure your GCP credentials are available at ./GCP_Account_Key.json
2. Initialize Airflow: docker-compose up airflow-init
3. Start Airflow: docker-compose up -d
4. Access the Airflow UI at http://localhost:8080
5. Your ETL DAG (homiehub_data_pipeline) should appear in the DAGs list
```

#### Prerequisites
- Docker and Docker Compose installed
- Unix-like environment (macOS, Linux, or WSL)
- Sufficient permissions to create directories and run Docker

#### Post-Setup Actions

After running the setup script, you need to:

1. **Add GCP Credentials**
   ```bash
   cp /path/to/your/credentials.json ./GCP_Account_Key.json
   ```

2. **Initialize Airflow Database**
   ```bash
   docker-compose up airflow-init
   ```

3. **Start Airflow Services**
   ```bash
   docker-compose up -d
   ```

#### Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission denied | Run with `sudo` or check Docker permissions |
| Docker not found | Install Docker Desktop or Docker Engine |
| Port already in use | Stop conflicting services or modify `docker-compose.yml` |
| Script not executable | Run `chmod +x airflow_setup.sh` |

### 2. ETL_SCRIPT.sh

#### Purpose
Executes the ETL pipeline manually outside of Airflow scheduling, useful for testing and development.

#### Usage
```bash
# Navigate to data-pipeline directory
cd data-pipeline

# Make executable (first time only)
chmod +x ETL_SCRIPT.sh

# Run the pipeline
./ETL_SCRIPT.sh
```

#### What It Does

1. **Environment Validation**
   - Checks if project directory exists
   - Verifies virtual environment presence
   - Validates GCP credentials availability

2. **Virtual Environment Activation**
   ```bash
   source venv/bin/activate
   ```

3. **Pipeline Execution**
   ```bash
   python -m pipelines.etl
   ```

4. **Status Reporting**
   - Success: Green confirmation message
   - Failure: Red error message with exit code

#### Expected Output

**Successful Execution:**
```
----------------------------------------------------------------------
✓ ETL pipeline completed successfully!
======================================================================
```

**Failed Execution:**
```
----------------------------------------------------------------------
✗ ETL pipeline failed!
======================================================================
```

#### Prerequisites

1. **Virtual Environment**
   ```bash
   # Create if not exists
   python3 -m venv venv
   
   # Install dependencies
   source venv/bin/activate
   pip install -r requirement.txt
   ```

2. **GCP Credentials**
   - File must exist at `./GCP_Account_Key.json`
   - Valid service account with appropriate permissions

3. **Python Dependencies**
   - All requirement.txt packages installed
   - spaCy language model downloaded

#### Environment Variables

The script respects environment variables from multiple sources:

**From `.env` (non-sensitive configuration):**
```bash
# Airflow settings
export AIRFLOW_UID="501"
export AIRFLOW_HOME="./airflow"

# GCP settings
export GCP_PROJECT_ID="your-project-id"
export GCP_BUCKET_NAME="your-bucket-name"
export GOOGLE_APPLICATION_CREDENTIALS="./GCP_Account_Key.json"
```

**From `.env.local` (sensitive credentials):**
```bash
# Email credentials (DO NOT COMMIT)
export SMTP_USER="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"
export ALERT_EMAIL="recipient@example.com"
```

**For debugging:**
```bash
export LOG_LEVEL="DEBUG"

cd data-pipeline
./ETL_SCRIPT.sh
```

**Security Note:** Always keep `.env.local` in `.gitignore` to prevent credential exposure.

#### Monitoring Execution

1. **Log Files**
   ```bash
   cd data-pipeline
   tail -f logs/homiehub.log
   ```

2. **Process Monitoring**
   ```bash
   ps aux | grep "pipelines.etl"
   ```

3. **Resource Usage**
   ```bash
   # Monitor memory and CPU
   htop
   ```

#### Error Handling

The script includes comprehensive error checking:

| Check | Error Message | Solution |
|-------|--------------|----------|
| Directory not found | "homiehub directory not found" | Ensure you're in the correct directory |
| No virtual environment | "Virtual environment not found" | Create venv with `python3 -m venv venv` |
| Missing GCP key | "GCP key not found" | Add credentials file |
| Pipeline failure | "ETL pipeline failed" | Check logs for detailed error |

#### Integration with Airflow

While this script runs the pipeline manually, it's designed to complement Airflow:

```python
# Airflow task definition 
run_etl_task = BashOperator(
    task_id='run_etl_pipeline',
    bash_command='/path/to/data-pipeline/ETL_SCRIPT.sh',
    dag=dag
)
```

## Best Practices

### Running Scripts

1. **Always Check Prerequisites**
   ```bash
   # Verify environment
   which python
   docker --version
   ls -la GCP_Account_Key.json
   ```

2. **Use Proper Paths**
   ```bash
   # Run from project root
   cd ~/projects/homiehub/data-pipeline
   ./airflow_setup.sh
   ```

3. **Check Logs for Issues**
   ```bash
   cd data-pipeline
   # View recent logs
   tail -n 50 logs/homiehub.log
   
   # Search for errors
   grep ERROR logs/homiehub.log
   ```

### Development Workflow

1. **Initial Setup**
   ```bash
   cd data-pipeline
   ./airflow_setup.sh
   docker-compose up airflow-init
   docker-compose up -d
   ```

2. **Development Testing**
   ```bash
   # Make changes to pipeline
   vim src/preprocessing/transform.py
   
   # Test changes
   ./ETL_SCRIPT.sh
   
   # Check output
   gsutil ls gs://homiehub-data-bucket/processed/
   ```

3. **Production Deployment**
   - Use Airflow scheduler for automated runs
   - Monitor through Airflow UI
   - Set up alerts for failures

### Maintenance

#### Regular Tasks

1. **Clean Up Logs**
   ```bash
   # Archive old logs
   tar -czf logs_$(date +%Y%m%d).tar.gz logs/
   rm logs/*.log
   ```

2. **Update Dependencies**
   ```bash
   source venv/bin/activate
   pip install --upgrade -r requirement.txt
   ```

3. **Docker Maintenance**
   ```bash
   # Clean up Docker
   docker system prune -a
   
   # Restart services
   docker-compose down
   docker-compose up -d
   ```

## Advanced Usage

### Custom Configurations

1. **Create Custom Config**
   ```yaml
   # config/dev_config.yaml
   pipeline:
     batch_size: 50
     test_mode: true
   ```

2. **Modify Script**
   ```bash
   # Add to run_etl.sh
   python -m pipelines.etl --config config/dev_config.yaml
   ```

### Performance Profiling

```bash
# Add profiling to run_etl.sh
time python -m cProfile -o profile.stats pipelines.etl_pipeline
python -m pstats profile.stats
```

## Support

### Getting Help

1. Check script output for error messages
2. Review log files in `data-pipeline/logs/` directory
3. Consult main [README](../README.md)
4. Review [Setup Documentation](./setup_guide.md)
5. Check [Data Pipeline Documentation](../README.md)

### Repository Information
- **GitHub**: https://github.com/homiehub/homiehub
- **Module**: data-pipeline
- **Python Required**: 3.11 (for Apache Airflow 3.1.1 compatibility)

---

For more information about the overall project, see the [main README](../README.md) or [Data Pipeline Documentation](../README.md).