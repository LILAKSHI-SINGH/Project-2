from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    prediction = Column(String(100), nullable=False)
    attack_category = Column(String(100), default="Normal")
    confidence = Column(Float, nullable=False)
    anomaly_score = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    is_zero_day = Column(Boolean, default=False)
    source = Column(String(100), default="192.168.1.100")
    destination = Column(String(100), default="10.0.0.1")
    explanation_summary = Column(Text, nullable=True)

    # Relationship to feature contributions
    features = relationship("DetectionFeature", back_populates="detection", cascade="all, delete-orphan")

class DetectionFeature(Base):
    __tablename__ = "detection_features"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    detection_id = Column(Integer, ForeignKey("detections.id"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    feature_value = Column(Float, nullable=False)
    contribution = Column(Float, nullable=False)  # Positive pushes malicious/zero-day, negative pushes normal
    importance = Column(Float, default=0.0)

    detection = relationship("Detection", back_populates="features")
