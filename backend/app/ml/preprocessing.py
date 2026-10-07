import os
import json
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from joblib import dump, load

FEATURE_NAMES = [
    "flow_duration",
    "total_fwd_packets",
    "total_bwd_packets",
    "total_length_fwd_packets",
    "total_length_bwd_packets",
    "fwd_packet_length_mean",
    "bwd_packet_length_mean",
    "flow_bytes_s",
    "flow_packets_s",
    "packet_length_mean",
    "packet_length_variance",
    "syn_flag_count",
    "ack_flag_count",
    "fin_flag_count",
    "destination_port",
    "source_port",
]

FEATURE_LABELS = {
    "flow_duration": "Flow Duration (us)",
    "total_fwd_packets": "Total Fwd Packets",
    "total_bwd_packets": "Total Bwd Packets",
    "total_length_fwd_packets": "Total Fwd Packet Length",
    "total_length_bwd_packets": "Total Bwd Packet Length",
    "fwd_packet_length_mean": "Fwd Packet Length Mean",
    "bwd_packet_length_mean": "Bwd Packet Length Mean",
    "flow_bytes_s": "Flow Bytes/s",
    "flow_packets_s": "Flow Packets/s",
    "packet_length_mean": "Packet Length Mean",
    "packet_length_variance": "Packet Length Variance",
    "syn_flag_count": "SYN Flag Count",
    "ack_flag_count": "ACK Flag Count",
    "fin_flag_count": "FIN Flag Count",
    "destination_port": "Destination Port",
    "source_port": "Source Port",
}

# Column aliases for dataset compatibility (CIC-IDS2017 & UNSW-NB15 variations)
COLUMN_ALIASES = {
    "flow duration": "flow_duration",
    "total fwd packets": "total_fwd_packets",
    "total backward packets": "total_bwd_packets",
    "total length of fwd packets": "total_length_fwd_packets",
    "total length of bwd packets": "total_length_bwd_packets",
    "fwd packet length mean": "fwd_packet_length_mean",
    "bwd packet length mean": "bwd_packet_length_mean",
    "flow bytes/s": "flow_bytes_s",
    "flow packets/s": "flow_packets_s",
    "packet length mean": "packet_length_mean",
    "packet length std": "packet_length_variance",
    "syn flag count": "syn_flag_count",
    "ack flag count": "ack_flag_count",
    "fin flag count": "fin_flag_count",
    "destination port": "destination_port",
    "dst_port": "destination_port",
    "source port": "source_port",
    "src_port": "source_port",
}

class PreprocessingPipeline:
    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_means = {}
        self.feature_stds = {}

    def normalize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize column names using string cleaning and alias dictionary."""
        cleaned_df = df.copy()
        new_cols = {}
        for col in cleaned_df.columns:
            clean_name = str(col).strip().lower().replace(".", "_").replace(" ", "_")
            if clean_name in COLUMN_ALIASES:
                new_cols[col] = COLUMN_ALIASES[clean_name]
            elif clean_name in FEATURE_NAMES:
                new_cols[col] = clean_name
            else:
                new_cols[col] = clean_name
        cleaned_df.rename(columns=new_cols, inplace=True)
        return cleaned_df

    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing, null, infinite values, and missing expected features."""
        df = self.normalize_columns(df)

        # Replace infinite values with NaN then fill
        df = df.replace([np.inf, -np.inf], np.nan)

        # Ensure all required features exist
        for feature in FEATURE_NAMES:
            if feature not in df.columns:
                # Default sensible fallback if column missing
                df[feature] = 0.0

        # Select only required numerical features
        df_num = df[FEATURE_NAMES].copy()

        # Convert to float64
        for feature in FEATURE_NAMES:
            df_num[feature] = pd.to_numeric(df_num[feature], errors="coerce")

        # Fill NaNs with median or 0
        df_num = df_num.fillna(df_num.median()).fillna(0.0)
        return df_num

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        """Fit scaler and transform numerical features."""
        cleaned_df = self.clean_data(df)
        scaled_array = self.scaler.fit_transform(cleaned_df)
        self.is_fitted = True

        for i, feature in enumerate(FEATURE_NAMES):
            self.feature_means[feature] = float(self.scaler.mean_[i])
            self.feature_stds[feature] = float(np.sqrt(self.scaler.var_[i]))

        return scaled_array, cleaned_df

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform numerical features using fitted scaler."""
        if not self.is_fitted:
            raise ValueError("PreprocessingPipeline is not fitted yet. Run fit_transform first.")
        cleaned_df = self.clean_data(df)
        scaled_array = self.scaler.transform(cleaned_df)
        return scaled_array, cleaned_df

    def save(self, model_dir: str):
        """Save fitted scaler and metadata."""
        os.makedirs(model_dir, exist_ok=True)
        dump(self.scaler, os.path.join(model_dir, "scaler.joblib"))
        meta = {
            "feature_names": FEATURE_NAMES,
            "feature_means": self.feature_means,
            "feature_stds": self.feature_stds,
            "is_fitted": self.is_fitted
        }
        with open(os.path.join(model_dir, "pipeline_meta.json"), "w") as f:
            json.dump(meta, f, indent=2)

    def load(self, model_dir: str):
        """Load fitted scaler and metadata."""
        scaler_path = os.path.join(model_dir, "scaler.joblib")
        meta_path = os.path.join(model_dir, "pipeline_meta.json")

        if os.path.exists(scaler_path) and os.path.exists(meta_path):
            self.scaler = load(scaler_path)
            with open(meta_path, "r") as f:
                meta = json.load(f)
            self.feature_means = meta.get("feature_means", {})
            self.feature_stds = meta.get("feature_stds", {})
            self.is_fitted = True
            return True
        return False
