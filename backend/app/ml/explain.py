import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from app.ml.preprocessing import FEATURE_NAMES, FEATURE_LABELS

logger = logging.getLogger(__name__)

class XAIExplainer:
    def __init__(self, model_dir: str = None):
        self.model_dir = model_dir
        self.rf_model = None
        self.iso_forest = None
        self.background_data = None
        self.shap_explainer = None
        self.is_shap_ready = False

    def initialize(self, rf_model, iso_forest, background_scaled: np.ndarray = None):
        """Initialize models and attempt SHAP TreeExplainer setup."""
        self.rf_model = rf_model
        self.iso_forest = iso_forest

        try:
            import shap
            if rf_model is not None and hasattr(rf_model, "estimators_"):
                # Use TreeExplainer for Random Forest
                self.shap_explainer = shap.TreeExplainer(rf_model)
                self.is_shap_ready = True
                logger.info("SHAP TreeExplainer successfully initialized.")
            else:
                self.is_shap_ready = False
        except Exception as e:
            logger.warning(f"Could not initialize SHAP explainer: {e}. Fallback XAI will be used.")
            self.is_shap_ready = False

    def explain_instance(
        self,
        raw_df: pd.DataFrame,
        scaled_features: np.ndarray,
        prediction: str,
        attack_category: str,
        risk_score: float,
        anomaly_score: float
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Generate feature contributions and human-readable explanation.
        Returns:
            - top_features: list of feature contribution dicts sorted by impact magnitude
            - explanation_dict: structured explanation with summary, positive/negative contributors, etc.
        """
        x_vec = scaled_features[0] if scaled_features.ndim == 2 else scaled_features
        raw_values = raw_df[FEATURE_NAMES].iloc[0].to_dict()

        shap_values_dict = {}
        used_method = "SHAP (TreeExplainer)"

        if self.is_shap_ready and self.shap_explainer is not None:
            try:
                # Compute SHAP values for the single sample
                raw_shap = self.shap_explainer.shap_values(scaled_features)
                
                # Handle multiclass vs binary output format in SHAP
                if isinstance(raw_shap, list):
                    # Multi-class output: pick index of predicted class or malicious class
                    classes = list(self.rf_model.classes_) if hasattr(self.rf_model, "classes_") else []
                    class_idx = classes.index(attack_category) if attack_category in classes else 0
                    if len(raw_shap) > class_idx:
                        vals = raw_shap[class_idx][0]
                    else:
                        vals = raw_shap[0][0]
                elif isinstance(raw_shap, np.ndarray):
                    if raw_shap.ndim == 3:
                        vals = raw_shap[0, :, 0]
                    elif raw_shap.ndim == 2:
                        vals = raw_shap[0]
                    else:
                        vals = raw_shap
                else:
                    vals = np.zeros(len(FEATURE_NAMES))

                for i, name in enumerate(FEATURE_NAMES):
                    shap_values_dict[name] = float(vals[i])

            except Exception as e:
                logger.error(f"Error computing SHAP values: {e}. Falling back to Feature Importance.")
                used_method = "Permutation Feature Importance & Z-Score Deviation (Fallback)"
                shap_values_dict = self._compute_fallback_contributions(x_vec, raw_df)
        else:
            used_method = "Model Feature Importance & Z-Score Deviation (Fallback)"
            shap_values_dict = self._compute_fallback_contributions(x_vec, raw_df)

        # Get Random Forest feature importances for weight scaling
        importances = {}
        if self.rf_model is not None and hasattr(self.rf_model, "feature_importances_"):
            for i, name in enumerate(FEATURE_NAMES):
                importances[name] = float(self.rf_model.feature_importances_[i])
        else:
            for name in FEATURE_NAMES:
                importances[name] = 1.0 / len(FEATURE_NAMES)

        # Build feature details list
        feature_contributions = []
        for name in FEATURE_NAMES:
            val = float(raw_values.get(name, 0.0))
            contrib = float(shap_values_dict.get(name, 0.0))
            imp = float(importances.get(name, 0.0))
            impact_desc = self._get_feature_impact_text(name, val, contrib)

            feature_contributions.append({
                "feature_name": name,
                "label": FEATURE_LABELS.get(name, name),
                "feature_value": val,
                "contribution": round(contrib, 4),
                "importance": round(imp, 4),
                "impact_description": impact_desc
            })

        # Sort features by absolute contribution descending
        sorted_features = sorted(feature_contributions, key=lambda x: abs(x["contribution"]), reverse=True)

        # Separate positive (malicious/anomalous push) vs negative (normal push)
        pos_contributors = [f for f in sorted_features if f["contribution"] > 0]
        neg_contributors = [f for f in sorted_features if f["contribution"] < 0]

        # Generate human-readable narrative
        explanation = self._generate_human_explanation(
            prediction=prediction,
            attack_category=attack_category,
            risk_score=risk_score,
            anomaly_score=anomaly_score,
            pos_contributors=pos_contributors,
            neg_contributors=neg_contributors,
            used_method=used_method
        )

        return sorted_features, explanation

    def _compute_fallback_contributions(self, x_vec: np.ndarray, raw_df: pd.DataFrame) -> Dict[str, float]:
        """Fallback feature contribution using standard deviation scaled by Gini importances."""
        contributions = {}
        importances = getattr(self.rf_model, "feature_importances_", np.ones(len(FEATURE_NAMES)) / len(FEATURE_NAMES))

        for i, name in enumerate(FEATURE_NAMES):
            z_score = float(x_vec[i]) if i < len(x_vec) else 0.0
            weight = float(importances[i]) if i < len(importances) else 0.05
            # Positive z-score in key metrics pushes malicious risk
            contributions[name] = round(z_score * weight, 4)

        return contributions

    def _get_feature_impact_text(self, name: str, value: float, contribution: float) -> str:
        """Create sentence for individual feature impact."""
        label = FEATURE_LABELS.get(name, name)
        if contribution > 0.05:
            return f"{label} (value: {value:,.2f}) significantly elevates the malicious risk profile."
        elif contribution > 0.001:
            return f"{label} (value: {value:,.2f}) shows slight deviation favoring anomalous classification."
        elif contribution < -0.05:
            return f"{label} (value: {value:,.2f}) strongly aligns with expected normal baseline traffic."
        elif contribution < -0.001:
            return f"{label} (value: {value:,.2f}) provides evidence of normal network behavior."
        else:
            return f"{label} (value: {value:,.2f}) remains within standard operational thresholds."

    def _generate_human_explanation(
        self,
        prediction: str,
        attack_category: str,
        risk_score: float,
        anomaly_score: float,
        pos_contributors: List[Dict[str, Any]],
        neg_contributors: List[Dict[str, Any]],
        used_method: str
    ) -> Dict[str, Any]:
        """Synthesize natural language security narrative."""
        key_factors = []
        for f in pos_contributors[:4]:
            key_factors.append(f["impact_description"])

        if "Zero-Day" in prediction:
            summary = (
                f"TRAFFIC WARNING: Traffic classified as '{prediction}' with a Risk Score of {risk_score:.1f}% "
                f"and an Anomaly Intensity of {anomaly_score:.2f}. "
                f"The traffic exhibits statistical anomaly patterns that deviate significantly from baseline normal traffic, "
                f"yet lacks strong signature correlation with known attack classes."
            )
            risk_assessment = (
                f"High-severity zero-day-like anomaly detected. Recommended Action: Isolate flow, capture full packet PCAP, "
                f"and inspect destination service endpoints."
            )
        elif "Attack" in prediction or attack_category != "Normal":
            summary = (
                f"THREAT DETECTED: Network flow identified as '{attack_category}' attack pattern with "
                f"a Risk Score of {risk_score:.1f}% and confidence level of {risk_score:.1f}%."
            )
            risk_assessment = (
                f"Known malicious pattern recognized. Recommended Action: Block source IP address and apply intrusion protection rule."
            )
        elif "Suspicious" in prediction:
            summary = (
                f"SUSPICIOUS ACTIVITY: Traffic exhibits mild network anomalies (Anomaly Score: {anomaly_score:.2f}) "
                f"with a Risk Score of {risk_score:.1f}%. Traffic should be monitored for potential escalation."
            )
            risk_assessment = f"Moderate concern. Monitor source host for repeated burst patterns."
        else:
            summary = (
                f"NORMAL TRAFFIC: Flow matches expected baseline network behavioral profiles with low Risk Score ({risk_score:.1f}%). "
                f"No suspicious anomalies or known threat signatures were detected."
            )
            risk_assessment = f"Low risk. No administrative action required."

        return {
            "summary": summary,
            "key_factors": key_factors if key_factors else ["All features align with baseline behavior."],
            "positive_contributors": pos_contributors[:6],
            "negative_contributors": neg_contributors[:6],
            "risk_assessment": risk_assessment,
            "used_method": used_method
        }
