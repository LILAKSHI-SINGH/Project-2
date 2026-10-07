from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class TrafficFeatureInput(BaseModel):
    flow_duration: float = Field(..., description="Flow Duration (us)", ge=0)
    total_fwd_packets: float = Field(..., description="Total Forward Packets", ge=0)
    total_bwd_packets: float = Field(..., description="Total Backward Packets", ge=0)
    total_length_fwd_packets: float = Field(..., description="Total Length of Fwd Packets", ge=0)
    total_length_bwd_packets: float = Field(..., description="Total Length of Bwd Packets", ge=0)
    fwd_packet_length_mean: float = Field(..., description="Fwd Packet Length Mean", ge=0)
    bwd_packet_length_mean: float = Field(..., description="Bwd Packet Length Mean", ge=0)
    flow_bytes_s: float = Field(..., description="Flow Bytes/s", ge=0)
    flow_packets_s: float = Field(..., description="Flow Packets/s", ge=0)
    packet_length_mean: float = Field(..., description="Packet Length Mean", ge=0)
    packet_length_variance: float = Field(..., description="Packet Length Variance", ge=0)
    syn_flag_count: float = Field(..., description="SYN Flag Count", ge=0, le=100)
    ack_flag_count: float = Field(..., description="ACK Flag Count", ge=0, le=100)
    fin_flag_count: float = Field(..., description="FIN Flag Count", ge=0, le=100)
    destination_port: float = Field(..., description="Destination Port", ge=0, le=65535)
    source_port: Optional[float] = Field(54321, description="Source Port", ge=0, le=65535)
    source_ip: Optional[str] = "192.168.1.105"
    destination_ip: Optional[str] = "10.0.0.1"

class FeatureContributionSchema(BaseModel):
    feature_name: str
    feature_value: float
    contribution: float  # SHAP value
    importance: float
    impact_description: Optional[str] = ""

class DynamicExplanationSchema(BaseModel):
    summary: str
    key_factors: List[str]
    positive_contributors: List[FeatureContributionSchema]
    negative_contributors: List[FeatureContributionSchema]
    risk_assessment: str

class PredictResponse(BaseModel):
    id: Optional[int] = None
    prediction: str
    attack_category: str
    confidence: float
    anomaly_score: float
    risk_score: float
    risk_level: str
    is_zero_day: bool
    source: str
    destination: str
    timestamp: datetime
    top_features: List[FeatureContributionSchema]
    explanation: DynamicExplanationSchema

class DetectionListItem(BaseModel):
    id: int
    timestamp: datetime
    source: str
    destination: str
    prediction: str
    attack_category: str
    confidence: float
    anomaly_score: float
    risk_score: float
    risk_level: str
    is_zero_day: bool

class DetectionsListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    detections: List[DetectionListItem]

class StatisticsResponse(BaseModel):
    total_analyzed: int
    normal_count: int
    known_attacks_count: int
    suspicious_count: int
    potential_zero_days_count: int
    average_risk_score: float
    detection_accuracy: float
    attack_distribution: Dict[str, int]
    risk_distribution: Dict[str, int]
    timeline_data: List[Dict[str, Any]]

class ModelInfoResponse(BaseModel):
    is_trained: bool
    model_name: str
    algorithms: List[str]
    training_dataset: str
    training_samples: int
    num_features: int
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    feature_list: List[str]
    xai_method: str
    last_trained: Optional[str] = None
    message: Optional[str] = None

class CSVAnalysisSummary(BaseModel):
    total_records: int
    normal_count: int
    known_attack_count: int
    suspicious_count: int
    potential_zero_day_count: int
    avg_risk_score: float
    processed_detections: List[PredictResponse]
