import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.io as pio
import json
import io
import os
import logging
from datetime import datetime
from google.cloud import storage

class BiasAnalyzer:
    def __init__(self, data_path, bucket_name=None, service_account_key=None):
        """Initialize BiasAnalyzer with local file or GCS path."""
        self.setup_logging()
        self.use_cloud = bucket_name is not None

        if self.use_cloud:
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = service_account_key
            self.storage_client = storage.Client()
            self.bucket = self.storage_client.bucket(bucket_name)
            self.bucket_name = bucket_name
            self.data = self._load_data_from_gcs(data_path)
        else:
            self.data = self._load_data(data_path)

        self._preprocess_data()

    def setup_logging(self):
        logging.basicConfig(
            filename=f'bias_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def _load_data(self, data_path):
        try:
            return pd.read_csv(data_path)
        except Exception as e:
            logging.error(f"Error loading data from file: {str(e)}")
            raise

    def _load_data_from_gcs(self, data_path):
        try:
            logging.info(f"Loading data from gs://{self.bucket_name}/{data_path}")
            blob = self.bucket.blob(data_path)
            content = blob.download_as_text()
            return pd.read_csv(io.StringIO(content))
        except Exception as e:
            logging.error(f"Error loading data from GCS: {str(e)}")
            raise

    def _save_file(self, content, filename, file_type='csv'):
        if self.use_cloud:
            today = datetime.now().strftime('%Y-%m-%d')
            if file_type == 'png':
                blob_path = f'bias_analysis/{today}/figures/{filename}'
                blob = self.bucket.blob(blob_path)
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                buffer.seek(0)
                blob.upload_from_string(buffer.getvalue(), content_type='image/png')
                logging.info(f"Saved to gs://{self.bucket_name}/{blob_path}")
            elif file_type == 'csv':
                blob_path = f'bias_analysis/{today}/data/{filename}'
                blob = self.bucket.blob(blob_path)
                csv_buffer = io.StringIO()
                content.to_csv(csv_buffer, index=False)
                blob.upload_from_string(csv_buffer.getvalue(), content_type='text/csv')
                logging.info(f"Saved to gs://{self.bucket_name}/{blob_path}")
        else:
            if file_type == 'png':
                plt.savefig(filename)
            elif file_type == 'csv':
                content.to_csv(filename, index=False)
            logging.info(f"Saved locally: {filename}")

    def _preprocess_data(self):
        # Clean numeric rent_amount
        if 'rent_amount_num' in self.data.columns:
            self.data['rent_amount_num'] = pd.to_numeric(self.data['rent_amount_num'], errors='coerce')

        # Fill missing sensitive features
        for feature in ['gender_norm', 'area_norm', 'food_pref_norm']:
            if feature in self.data.columns:
                self.data[feature] = self.data[feature].fillna('not_specified')

        logging.info("Data preprocessing completed successfully")

    def analyze_data_distribution(self, sensitive_features):
        logging.info("Starting data distribution analysis")
        distribution_stats = {}
        for feature in sensitive_features:
            if feature in self.data.columns:
                distribution = self.data[feature].value_counts(normalize=True)
                distribution_stats[feature] = distribution
        return distribution_stats

    def slice_performance_analysis(self, feature, target_col):
        slice_metrics = {}
        if feature not in self.data.columns or target_col not in self.data.columns:
            return slice_metrics

        for value in self.data[feature].unique():
            slice_data = self.data[self.data[feature] == value]
            metrics = {
                'size': len(slice_data),
                'mean_target': slice_data[target_col].mean(),
                'std_target': slice_data[target_col].std()
            }
            slice_metrics[value] = metrics
        return slice_metrics

    def detect_bias(self, sensitive_features, target_col):
        bias_metrics = {}
        if target_col not in self.data.columns:
            return bias_metrics

        for feature in sensitive_features:
            if feature not in self.data.columns:
                continue
            feature_values = self.data[feature].unique()
            base_rate = self.data[target_col].mean()
            feature_rates = {}
            for value in feature_values:
                slice_rate = self.data[self.data[feature] == value][target_col].mean()
                disparity = abs(slice_rate - base_rate)
                feature_rates[value] = {'rate': slice_rate, 'disparity': disparity}
            bias_metrics[feature] = feature_rates
        return bias_metrics

    def mitigate_bias(self, sensitive_features, target_col):
        for feature in sensitive_features:
            if feature not in self.data.columns:
                continue
            feature_dist = self.data[feature].value_counts()
            max_size = feature_dist.max()
            balanced_data = pd.DataFrame()
            for value in feature_dist.index:
                slice_data = self.data[self.data[feature] == value]
                if len(slice_data) < max_size:
                    resampled = slice_data.sample(n=max_size, replace=True)
                    balanced_data = pd.concat([balanced_data, resampled])
                else:
                    balanced_data = pd.concat([balanced_data, slice_data])
            self.data = balanced_data
        timestamp = datetime.now().strftime('%H%M%S')
        self._save_file(self.data, f'mitigated_data_{timestamp}.csv', 'csv')
        return self.data

    def generate_dashboard(self, sensitive_features, target_col, output_file="bias_dashboard.html"):
        """Generate a self-contained HTML dashboard using Plotly."""
        html_parts = []

        # Data distributions
        for feature in sensitive_features:
            if feature not in self.data.columns:
                continue
            fig = px.bar(
                self.data[feature].value_counts().reset_index(),
                x='index', y=feature,
                title=f"Distribution of {feature}"
            )
            html_parts.append(pio.to_html(fig, full_html=False, include_plotlyjs='cdn'))

        # Slice metrics
        for feature in sensitive_features:
            slice_metrics = self.slice_performance_analysis(feature, target_col)
            if not slice_metrics:
                continue
            df_metrics = pd.DataFrame.from_dict(slice_metrics, orient='index')
            fig = px.bar(
                df_metrics,
                x=df_metrics.index, y='mean_target',
                error_y='std_target',
                title=f"Slice Metrics for {feature} (mean ± std)"
            )
            html_parts.append(pio.to_html(fig, full_html=False, include_plotlyjs='cdn'))

        # Bias disparities
        bias_metrics = self.detect_bias(sensitive_features, target_col)
        for feature, metrics in bias_metrics.items():
            df_disparity = pd.DataFrame(metrics).T
            fig = px.bar(
                df_disparity,
                x=df_disparity.index, y='disparity',
                title=f"Bias Disparity for {feature}"
            )
            html_parts.append(pio.to_html(fig, full_html=False, include_plotlyjs='cdn'))

        html_content = f"""
        <html>
        <head><title>Bias Analysis Dashboard</title></head>
        <body>
        <h1>Bias Analysis Dashboard - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</h1>
        {''.join(html_parts)}
        </body>
        </html>
        """

        with open(output_file, "w") as f:
            f.write(html_content)
        logging.info(f"Dashboard saved to {output_file}")
        return output_file


# ----------------------------
# Main
# ----------------------------
def main():
    USE_CLOUD = False  # Set True for GCS

    if USE_CLOUD:
        BUCKET_NAME = "homiehubbucket"
        SERVICE_ACCOUNT_KEY = "./GCP_Account_Key.json"
        DATA_PATH = "cleaned/2024-11-03/homiehub_listings.csv"
        analyzer = BiasAnalyzer(
            data_path=DATA_PATH,
            bucket_name=BUCKET_NAME,
            service_account_key=SERVICE_ACCOUNT_KEY
        )
    else:
        DATA_PATH = "../../data-pipeline/data/processed/homiehub_listings_processed.csv"
        analyzer = BiasAnalyzer(data_path=DATA_PATH)

    sensitive_features = ['gender_norm', 'area_norm', 'food_pref_norm']
    target_col = 'rent_amount_num'

    # Run analysis
    analyzer.analyze_data_distribution(sensitive_features)
    for f in sensitive_features:
        analyzer.slice_performance_analysis(f, target_col)
    analyzer.detect_bias(sensitive_features, target_col)
    analyzer.mitigate_bias(sensitive_features, target_col)

    # Generate dashboard
    dashboard_file = analyzer.generate_dashboard(sensitive_features, target_col)
    print(f"Dashboard ready: {dashboard_file}")


if __name__ == "__main__":
    main()
