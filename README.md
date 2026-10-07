# Explainable AI-Based Framework for Detecting Zero-Day Cyber Attacks

[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B-cyan.svg)](https://react.dev/)
[![ML](https://img.shields.io/badge/Machine%20Learning-IsolationForest%20%2B%20RandomForest-purple.svg)](https://scikit-learn.org/)
[![XAI](https://img.shields.io/badge/XAI-SHAP%20TreeExplainer-magenta.svg)](https://shap.readthedocs.io/)

A complete, end-to-end cybersecurity machine learning web application designed for B.Tech Computer Science final/mini project demonstration. The framework detects known network attacks and previously unseen **Zero-Day anomalies**, providing human-understandable **Explainable AI (XAI)** reports for every prediction using **SHAP**.

---

## 1. Problem Statement & Motivation

Traditional Intrusion Detection Systems (IDS) rely heavily on signature-based detection. While effective for known threat patterns (such as standard DoS/DDoS or brute force dictionary attacks), signature-based systems completely fail when faced with **Zero-Day cyber attacks**—exploits targeting unpatched vulnerabilities before signatures are developed.

Furthermore, traditional black-box machine learning models fail to build trust among Security Operations Center (SOC) analysts because they output risk predictions without explaining *why* traffic was classified as malicious or anomalous. 

This framework solves both challenges by combining **unsupervised anomaly detection** (Isolation Forest), **supervised classification** (Random Forest), and **Explainable AI** (SHAP) into a unified SOC dashboard.

---

## 2. Project Objectives

- **Detect Known Network Attacks**: Classify traffic flows into standard categories (DoS/DDoS, Probe/Port Scanning, Brute Force).
- **Identify Potential Zero-Day Attacks**: Detect statistical traffic anomalies that differ from baseline normal behavior and lack known signature matches.
- **Explainable AI Integration**: Compute exact SHAP (SHapley Additive exPlanations) values for every prediction to visualize top feature drivers.
- **Transparent Risk Scoring**: Calculate objective, non-random risk scores (0–100%) categorized into Low, Medium, High, and Critical risk levels.
- **Interactive SOC Web Interface**: Provide a real-time SOC dashboard, single-flow traffic analyzer, CSV bulk dataset analyzer, detection forensics table, and XAI inspection pages.
- **Persistent Database Logging**: Store full prediction histories and feature contribution vectors in an SQLite database using SQLAlchemy ORM.

---

## 3. Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS + Custom Dark SOC Glassmorphism CSS
- **Visualizations**: Recharts (Pie/Donut Charts, Bar Charts, Area Charts)
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python)
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy
- **Data Validation**: Pydantic v2
- **Database**: SQLite (`detections.db`)

### Machine Learning & XAI
- **Anomaly Detection**: Scikit-Learn `IsolationForest`
- **Supervised Classifier**: Scikit-Learn `RandomForestClassifier`
- **Explainable AI**: SHAP `TreeExplainer`
- **Data Processing**: Pandas, NumPy, StandardScaler
- **Model Persistence**: Joblib

---

## 4. System Architecture & Flow

```
User Input / CSV Upload
         │
         ▼
 React Frontend (Vite)
         │  (HTTP / REST API)
         ▼
 FastAPI Backend (Python)
         │
         ▼
 Preprocessing Pipeline (StandardScaler & Imputer)
         │
 ┌───────┴────────────────────────┐
 │                                │
 ▼                                ▼
Isolation Forest               Random Forest
(Anomaly Score A)              (Class Probabilities P)
 │                                │
 └───────┬────────────────────────┘
         │
         ▼
 Zero-Day Risk Matrix & Risk Score Calculation
         │
         ▼
 SHAP TreeExplainer Engine (Feature Attribution)
         │
 ┌───────┴────────────────────────┐
 │                                │
 ▼                                ▼
SQLite Database               Frontend Dashboard & XAI View
```

---

## 5. Zero-Day Detection & Risk Scoring Methodology

### Zero-Day Logic Matrix

1. **Isolation Forest** calculates decision function value converted to normalized anomaly score $A \in [0.0, 1.0]$.
2. **Random Forest** calculates supervised class probabilities $\vec{P} = [P_{normal}, P_{DoS}, P_{Probe}, P_{Brute}]$.
3. **Decision Logic**:
   - **Potential Zero-Day Attack**: If anomaly score $A \ge 0.65$ AND ($P_{normal} > 0.35$ OR max attack probability $< 0.65$).
   - **Known Attack**: If $P_{attack} \ge 0.60$ and anomaly score matches known threat cluster.
   - **Suspicious Traffic**: If $0.45 \le A < 0.65$ and $P_{normal} > 0.50$.
   - **Normal Traffic**: If $P_{normal} \ge 0.55$ and $A < 0.45$.

### Objective Risk Score Formula (0 – 100%)

$$\text{Risk Score} = \text{clip}\left(0, 100, \text{round}\left( (0.40 \times P_{\text{malicious}} + 0.60 \times A) \times 100 \right)\right)$$

*Note: If classified as Potential Zero-Day, Risk Score is floored to at least 78.0%.*

- **0–30%**: Low Risk (Green)
- **31–60%**: Medium Risk (Yellow)
- **61–80%**: High Risk (Orange)
- **81–100%**: Critical Risk (Red)

---

## 6. Dataset & Feature Engineering

The pipeline supports **CIC-IDS2017** and **UNSW-NB15** feature schemas:

| Feature Name | Description |
| :--- | :--- |
| `flow_duration` | Duration of network flow in microseconds |
| `total_fwd_packets` | Total forward directional packets |
| `total_bwd_packets` | Total backward directional packets |
| `total_length_fwd_packets` | Accumulated forward payload length |
| `total_length_bwd_packets` | Accumulated backward payload length |
| `fwd_packet_length_mean` | Mean length of forward packets |
| `bwd_packet_length_mean` | Mean length of backward packets |
| `flow_bytes_s` | Throughput rate in Bytes/second |
| `flow_packets_s` | Packet throughput rate in Packets/second |
| `packet_length_mean` | Average packet length across flow |
| `packet_length_variance` | Packet length variance (high in zero-day outliers) |
| `syn_flag_count` | Count of TCP SYN control flags |
| `ack_flag_count` | Count of TCP ACK control flags |
| `fin_flag_count` | Count of TCP FIN control flags |
| `destination_port` | Target network port (e.g. 80, 443, 31337) |
| `source_port` | Originating client port |

---

## 7. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root API status endpoint |
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/predict` | Analyze single network flow instance |
| `POST` | `/api/analyze-csv` | Upload and evaluate CSV dataset |
| `GET` | `/api/detections` | Paginated and filtered detection logs |
| `GET` | `/api/detections/{id}` | Detailed detection record with SHAP features |
| `GET` | `/api/explanation/{id}` | Dedicated XAI explanation report |
| `GET` | `/api/statistics` | Real-time SOC dashboard analytics |
| `GET` | `/api/model-info` | Trained model performance metrics |
| `POST` | `/api/train` | Trigger model retraining pipeline |

---

## 8. Installation & Setup Guide (Windows)

### Prerequisites
- Python 3.10 or higher
- Node.js v18 or higher

### Step-by-Step Instructions

1. **Open PowerShell / Command Prompt** in the project directory:
   ```cmd
   cd "c:\Users\aadar\Explainable AI-Based"
   ```

2. **Create and Activate Python Virtual Environment**:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Backend Dependencies**:
   ```cmd
   pip install -r backend\requirements.txt
   ```

4. **Generate Synthetic CIC-IDS2017 Dataset & Train ML Models**:
   ```cmd
   python train.py
   ```

5. **Start FastAPI Backend Server**:
   ```cmd
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend
   ```

6. **Start React Frontend (in a new terminal window)**:
   ```cmd
   cd frontend
   npm install
   npm run dev
   ```

7. **Launch Project in Browser**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

8. **Alternative One-Click Launch**:
   Double click `run_project.bat`.

---

## 9. Running Tests

To run the automated backend test suite:
```cmd
venv\Scripts\activate
python -m pytest backend/tests/
```

---

## 10. Project Structure

```
Explainable AI-Based/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routes/
│   │   │   ├── prediction.py
│   │   │   ├── detections.py
│   │   │   └── statistics.py
│   │   ├── ml/
│   │   │   ├── preprocessing.py
│   │   │   ├── train.py
│   │   │   ├── predict.py
│   │   │   └── explain.py
│   ├── models/            # Joblib models & metrics.json
│   ├── data/              # CSV dataset & SQLite DB
│   ├── tests/
│   │   └── test_api.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── generate_sample_data.py
├── train.py
├── run_project.bat
├── DOCUMENTATION.md
└── README.md
```

---

## 11. Limitations & Future Scope

### Limitations
- **Synthetic Demonstration Dataset**: Uses synthetic CIC-IDS2017 feature distributions for reproducible local testing.
- **Offline Packet Feature Extraction**: Expects structured network flow metrics; real-time PCAP parsing requires raw socket integration.

### Future Scope
- **Live PCAP Network Sniffing**: Integrate PyShark / Scapy for live network interface monitoring.
- **SIEM & Firewall Integration**: Auto-generate iptables or Snort / Suricata rules for critical zero-day anomalies.
- **Autoencoder Deep Learning**: Incorporate LSTM Autoencoders for temporal anomaly detection.

---

## 12. Academic Citation & License

Developed for B.Tech Computer Science Final/Mini Project Academic Viva Demonstration.

MIT License. Defensive Cybersecurity Research Purpose Only.
#   P r o j e c t - 2  
 