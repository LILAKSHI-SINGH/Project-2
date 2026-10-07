import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.database import get_db
from app.models import Detection, DetectionFeature
from app.schemas import DetectionsListResponse, PredictResponse, FeatureContributionSchema, DynamicExplanationSchema
from app.ml.preprocessing import FEATURE_LABELS

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Detections"])

@router.get("/detections", response_model=DetectionsListResponse)
def get_detections(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    search: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    prediction: Optional[str] = Query(None),
    is_zero_day: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve paginated and filtered history of network traffic detections."""
    query = db.query(Detection)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Detection.source.like(search_term),
                Detection.destination.like(search_term),
                Detection.prediction.like(search_term),
                Detection.attack_category.like(search_term)
            )
        )

    if risk_level:
        query = query.filter(Detection.risk_level == risk_level)

    if prediction:
        query = query.filter(Detection.prediction.like(f"%{prediction}%"))

    if is_zero_day is not None:
        query = query.filter(Detection.is_zero_day == is_zero_day)

    total = query.count()
    offset = (page - 1) * page_size
    detections = query.order_by(desc(Detection.timestamp)).offset(offset).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "detections": [
            {
                "id": d.id,
                "timestamp": d.timestamp,
                "source": d.source,
                "destination": d.destination,
                "prediction": d.prediction,
                "attack_category": d.attack_category,
                "confidence": d.confidence,
                "anomaly_score": d.anomaly_score,
                "risk_score": d.risk_score,
                "risk_level": d.risk_level,
                "is_zero_day": d.is_zero_day
            }
            for d in detections
        ]
    }

@router.get("/detections/{detection_id}", response_model=PredictResponse)
def get_detection_detail(detection_id: int, db: Session = Depends(get_db)):
    """Fetch complete details and XAI feature breakdown for a specific detection."""
    det = db.query(Detection).filter(Detection.id == detection_id).first()
    if not det:
        raise HTTPException(status_code=404, detail=f"Detection with ID {detection_id} not found.")

    features = db.query(DetectionFeature).filter(DetectionFeature.detection_id == detection_id).all()

    top_features = [
        {
            "feature_name": f.feature_name,
            "label": FEATURE_LABELS.get(f.feature_name, f.feature_name),
            "feature_value": f.feature_value,
            "contribution": f.contribution,
            "importance": f.importance,
            "impact_description": (
                f"{FEATURE_LABELS.get(f.feature_name, f.feature_name)} (val: {f.feature_value:,.2f}) "
                f"contributed {f.contribution:+.4f} towards prediction."
            )
        }
        for f in features
    ]
    top_features = sorted(top_features, key=lambda x: abs(x["contribution"]), reverse=True)

    pos_contributors = [f for f in top_features if f["contribution"] > 0]
    neg_contributors = [f for f in top_features if f["contribution"] < 0]

    explanation = {
        "summary": det.explanation_summary or f"Traffic evaluated as {det.prediction} with {det.risk_score}% risk.",
        "key_factors": [f["impact_description"] for f in pos_contributors[:4]] or ["All features within expected variance."],
        "positive_contributors": pos_contributors[:6],
        "negative_contributors": neg_contributors[:6],
        "risk_assessment": f"Risk Level: {det.risk_level}. Anomaly score: {det.anomaly_score:.2f}.",
        "used_method": "SHAP (TreeExplainer)"
    }

    return {
        "id": det.id,
        "prediction": det.prediction,
        "attack_category": det.attack_category,
        "confidence": det.confidence,
        "anomaly_score": det.anomaly_score,
        "risk_score": det.risk_score,
        "risk_level": det.risk_level,
        "is_zero_day": det.is_zero_day,
        "source": det.source,
        "destination": det.destination,
        "timestamp": det.timestamp,
        "top_features": top_features,
        "explanation": explanation
    }

@router.get("/explanation/{detection_id}")
def get_detection_explanation(detection_id: int, db: Session = Depends(get_db)):
    """Fetch structured XAI explanation for detection ID."""
    return get_detection_detail(detection_id, db)
