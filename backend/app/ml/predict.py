import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from joblib import load

from app.ml.preprocessing import PreprocessingPipeline, FEATURE_NAMES
from app.ml.explain import XAIExplainer

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "models")

class DetectionEngine:
    def __init__(self, model_dir: str = MODEL_DIR):
        self.model_dir = model_dir
        self.pipeline = PreprocessingPipeline()
        self.iso_forest = None
        self.rf_classifier = None
        self.explainer = XAIExplainer(model_dir=model_dir)
        self.is_loaded = False
        self.load_models()

    def load_models(self) -> bool:
        """Load trained models and preprocessing scaler from disk."""
        iso_path = os.path.join(self.model_dir, "isolation_forest.joblib")
        rf_path = os.path.join(self.model_dir, "random_forest.joblib")

        if os.path.exists(iso_path) and os.path.exists(rf_path) and self.pipeline.load(self.model_dir):
            try:
                self.iso_forest = load(iso_path)
                self.rf_classifier = load(rf_path)
                self.is_loaded = True
                self.explainer.initialize(self.rf_classifier, self.iso_forest)
                logger.info("DetectionEngine models successfully loaded.")
                return True
            except Exception as e:
                logger.error(f"Failed loading model joblib files: {e}")
                self.is_loaded = False
                return False
        else:
            self.is_loaded = False
            return False

    def predict_sample(self, raw_input_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Predict classification, risk score, zero-day threat, and SHAP explanation for a single flow."""
        if not self.is_loaded:
            raise RuntimeError("ML model not found. Please run the training pipeline first.")

        df_input = pd.DataFrame([raw_input_dict])
        scaled_vector, cleaned_df = self.pipeline.transform(df_input)

        # 1. Anomaly score from Isolation Forest
        # decision_function: positive for inliers, negative for outliers
        decision_score = float(self.iso_forest.decision_function(scaled_vector)[0])
        # Convert decision function to 0..1 scale (lower decision_function -> higher anomaly)
        anomaly_score = float(np.clip((0.35 - decision_score) / 0.70, 0.0, 1.0))

        # 2. Supervised Classifier Probabilities
        classes = list(self.rf_classifier.classes_)
        probs = self.rf_classifier.predict_proba(scaled_vector)[0]
        max_class_idx = int(np.argmax(probs))
        predicted_class = str(classes[max_class_idx])
        max_prob = float(probs[max_class_idx])

        # Get normal class probability
        normal_idx = None
        for i, c in enumerate(classes):
            if c.lower() == "normal":
                normal_idx = i
                break
        normal_prob = float(probs[normal_idx]) if normal_idx is not None else (max_prob if predicted_class.lower() == "normal" else 1.0 - max_prob)
        malicious_prob = float(1.0 - normal_prob)

        # 3. Hybrid Zero-Day Risk Decision Matrix
        is_zero_day = False
        if anomaly_score >= 0.65 and (normal_prob > 0.35 or max_prob < 0.65 or predicted_class.lower() == "normal"):
            prediction = "Potential Zero-Day Attack"
            attack_category = "Zero-Day Anomaly"
            is_zero_day = True
            confidence = round(float(max(anomaly_score, 0.82)), 4)
        elif anomaly_score >= 0.72:
            prediction = "Potential Zero-Day Attack"
            attack_category = "Zero-Day Anomaly"
            is_zero_day = True
            confidence = round(float(anomaly_score), 4)
        elif anomaly_score >= 0.45 and normal_prob > 0.50:
            prediction = "Suspicious Traffic"
            attack_category = "Anomalous Traffic"
            confidence = round(float(0.5 + 0.5 * anomaly_score), 4)
        elif normal_prob >= 0.55 and anomaly_score < 0.45:
            prediction = "Normal Traffic"
            attack_category = "Normal"
            confidence = round(float(normal_prob), 4)
        else:
            prediction = f"Known Attack ({predicted_class})"
            attack_category = predicted_class
            confidence = round(float(max_prob), 4)

        # 4. Risk Score Calculation
        # Risk = 40% malicious classifier probability + 60% anomaly score
        raw_risk = (0.40 * malicious_prob + 0.60 * anomaly_score) * 100.0
        if is_zero_day:
            raw_risk = max(raw_risk, 78.0)

        risk_score = float(np.clip(round(raw_risk, 1), 0.0, 100.0))

        # Risk Level Category
        if risk_score <= 30.0:
            risk_level = "Low Risk"
        elif risk_score <= 60.0:
            risk_level = "Medium Risk"
        elif risk_score <= 80.0:
            risk_level = "High Risk"
        else:
            risk_level = "Critical Risk"

        # 5. Generate SHAP XAI Explanation
        top_features, explanation = self.explainer.explain_instance(
            raw_df=cleaned_df,
            scaled_features=scaled_vector,
            prediction=prediction,
            attack_category=attack_category,
            risk_score=risk_score,
            anomaly_score=anomaly_score
        )

        return {
            "prediction": prediction,
            "attack_category": attack_category,
            "confidence": confidence,
            "anomaly_score": round(anomaly_score, 4),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "is_zero_day": is_zero_day,
            "source": str(raw_input_dict.get("source_ip", "192.168.1.105")),
            "destination": str(raw_input_dict.get("destination_ip", "10.0.0.1")),
            "top_features": top_features,
            "explanation": explanation
        }
