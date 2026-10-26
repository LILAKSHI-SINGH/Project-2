import sys
import os
import pytest

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_root():
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "Explainable AI-Based Framework" in response.json()["title"]

def test_model_info():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "is_trained" in data
    assert "accuracy" in data

def test_predict_endpoint():
    payload = {
        "flow_duration": 12000,
        "total_fwd_packets": 10,
        "total_bwd_packets": 12,
        "total_length_fwd_packets": 1200,
        "total_length_bwd_packets": 4500,
        "fwd_packet_length_mean": 120.0,
        "bwd_packet_length_mean": 375.0,
        "flow_bytes_s": 15000.0,
        "flow_packets_s": 250.0,
        "packet_length_mean": 240.0,
        "packet_length_variance": 1200.0,
        "syn_flag_count": 0,
        "ack_flag_count": 1,
        "fin_flag_count": 0,
        "destination_port": 443,
        "source_port": 54321
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "risk_score" in data
    assert "explanation" in data
    assert "top_features" in data

def test_statistics():
    response = client.get("/api/statistics")
    assert response.status_code == 200
    data = response.json()
    assert "total_analyzed" in data
    assert "risk_distribution" in data

def test_detections_list():
    response = client.get("/api/detections")
    assert response.status_code == 200
    data = response.json()
    assert "detections" in data
    assert "total" in data
