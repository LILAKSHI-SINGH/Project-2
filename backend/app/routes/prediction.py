import io
import json
import logging
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Detection, DetectionFeature
from app.schemas import TrafficFeatureInput, PredictResponse, CSVAnalysisSummary, FeatureContributionSchema, DynamicExplanationSchema
from app.ml.predict import DetectionEngine
from app.ml.preprocessing import FEATURE_NAMES

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Prediction"])
engine_instance = DetectionEngine()

def save_detection_to_db(db: Session, res: dict) -> Detection:
    """Helper to store prediction result in SQLite DB."""
    detection = Detection(
        prediction=res["prediction"],
        attack_category=res["attack_category"],
        confidence=res["confidence"],
        anomaly_score=res["anomaly_score"],
        risk_score=res["risk_score"],
        risk_level=res["risk_level"],
        is_zero_day=res["is_zero_day"],
        source=res["source"],
        destination=res["destination"],
        explanation_summary=res["explanation"]["summary"]
    )
    db.add(detection)
    db.flush()  # Populates detection.id

    # Store individual feature contributions
    for feat in res["top_features"]:
        feat_record = DetectionFeature(
            detection_id=detection.id,
            feature_name=feat["feature_name"],
            feature_value=feat["feature_value"],
            contribution=feat["contribution"],
            importance=feat["importance"]
        )
        db.add(feat_record)

    db.commit()
    db.refresh(detection)
    return detection

@router.post("/predict", response_model=PredictResponse)
def predict_traffic(input_data: TrafficFeatureInput, db: Session = Depends(get_db)):
    """Analyze single network traffic flow instance."""
    if not engine_instance.is_loaded:
        # Try reloading once in case trained recently
        engine_instance.load_models()
        if not engine_instance.is_loaded:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ML model not found. Please run the training pipeline first."
            )

    raw_dict = input_data.model_dump()
    try:
        result = engine_instance.predict_sample(raw_dict)
        db_detection = save_detection_to_db(db, result)
        result["id"] = db_detection.id
        result["timestamp"] = db_detection.timestamp
        return result
    except Exception as e:
        logger.exception("Error analyzing network traffic")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.post("/analyze-csv", response_model=CSVAnalysisSummary)
async def analyze_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Process uploaded CSV of network traffic flows."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    if not engine_instance.is_loaded:
        engine_instance.load_models()
        if not engine_instance.is_loaded:
            raise HTTPException(status_code=503, detail="ML model not found. Please run the training pipeline first.")

    try:
        contents = await file.read()
        if len(contents) > 15 * 1024 * 1024:  # 15 MB limit
            raise HTTPException(status_code=400, detail="File too large. Maximum CSV size is 15MB.")

        df = pd.read_csv(io.BytesIO(contents))
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty.")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    processed_list = []
    normal_count = 0
    known_attack_count = 0
    suspicious_count = 0
    potential_zero_day_count = 0
    total_risk = 0.0

    # Process up to 500 rows for bulk analysis performance
    sample_df = df.head(500)

    for index, row in sample_df.iterrows():
        row_dict = row.to_dict()
        # Ensure default ports and IPs if missing
        if "source_ip" not in row_dict or pd.isna(row_dict.get("source_ip")):
            row_dict["source_ip"] = f"192.168.1.{100 + (index % 150)}"
        if "destination_ip" not in row_dict or pd.isna(row_dict.get("destination_ip")):
            row_dict["destination_ip"] = f"10.0.0.{1 + (index % 50)}"

        try:
            res = engine_instance.predict_sample(row_dict)
            db_det = save_detection_to_db(db, res)
            res["id"] = db_det.id
            res["timestamp"] = db_det.timestamp

            pred = res["prediction"]
            risk = res["risk_score"]
            total_risk += risk

            if "Zero-Day" in pred:
                potential_zero_day_count += 1
            elif "Attack" in pred or res["attack_category"] != "Normal":
                known_attack_count += 1
            elif "Suspicious" in pred:
                suspicious_count += 1
            else:
                normal_count += 1

            processed_list.append(res)
        except Exception as err:
            logger.warning(f"Error processing row {index}: {err}")
            continue

    total_records = len(processed_list)
    avg_risk = round(total_risk / total_records, 1) if total_records > 0 else 0.0

    return {
        "total_records": total_records,
        "normal_count": normal_count,
        "known_attack_count": known_attack_count,
        "suspicious_count": suspicious_count,
        "potential_zero_day_count": potential_zero_day_count,
        "avg_risk_score": avg_risk,
        "processed_detections": processed_list
    }
