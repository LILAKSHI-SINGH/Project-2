# Academic Project Documentation

## Project Title
**“Explainable AI-Based Framework for Detecting Zero-Day Cyber Attacks”**

**Degree Program**: B.Tech Computer Science & Engineering (Final/Mini Project)  
**Domain**: Cybersecurity & Machine Learning (XAI)  

---

## 1. Abstract

Zero-Day cyber attacks represent one of the most critical vulnerabilities in modern enterprise network infrastructure. Traditional Intrusion Detection Systems (IDS) rely on signature-based pattern matching, making them inherently incapable of identifying previously unseen zero-day threats. While machine learning (ML) techniques have proven effective for anomaly detection, their adoption in Security Operations Centers (SOC) has been constrained by their "black-box" nature—providing predictions without transparent rationale.

This project presents a functional **Explainable AI (XAI)-based zero-day detection framework**. The system employs a hybrid architecture combining unsupervised anomaly detection (**Isolation Forest**) with supervised multi-class classification (**Random Forest**). A zero-day decision matrix evaluates anomaly intensity against signature confidence to isolate **Potential Zero-Day Attacks**. To establish trust and operational transparency, the framework integrates **SHAP (SHapley Additive exPlanations)** using `TreeExplainer` to compute exact feature attribution vectors and automatically synthesize human-readable security narratives. The framework features a FastAPI backend, an SQLite database, and an interactive dark-mode SOC web interface built using React.js, Tailwind CSS, and Recharts.

---

## 2. Problem Statement

Signature-based Intrusion Detection Systems (IDS) such as Snort or Suricata rely on pre-existing database signatures. Consequently, when an adversary deploys a novel exploit (a zero-day vulnerability), the traffic bypasses conventional filters. 

Although unsupervised ML models (such as Isolation Forests) can flag abnormal traffic, SOC analysts face two primary challenges:
1. **High False Positive Rates**: Anomalies do not always indicate malicious intent.
2. **Opacity (Black-Box Problem)**: Traditional ML models do not explain *which* specific network features (e.g., packet rate, flag counts, port numbers) triggered the alert.

There is a critical need for an automated framework that not only detects zero-day anomalies accurately but also provides explainable, feature-level rationale for security analysts.

---

## 3. Project Objectives

1. **Hybrid Anomaly & Signature Detection**: Combine Isolation Forest outlier scoring with Random Forest classification to categorize network traffic flows.
2. **Zero-Day Identification Engine**: Formulate an algorithmic risk matrix that isolates high-anomaly traffic exhibiting weak known-signature correlations as **"Potential Zero-Day Attack"**.
3. **Explainable AI Integration**: Apply SHAP (`TreeExplainer`) to calculate exact Shapley additive feature contributions for every evaluation.
4. **Transparent Risk Scoring**: Compute a mathematically grounded risk score (0–100%) mapped to Low, Medium, High, and Critical risk tiers.
5. **Interactive SOC Dashboard**: Build an intuitive web application providing real-time analytics, interactive single-flow analysis, batch CSV processing, and XAI inspection.
6. **Persistent Forensics Logging**: Maintain complete historical detection logs and feature contribution matrices in an SQLite database.

---

## 4. System Architecture

```
                               ┌──────────────────────────────────┐
                               │   Network Traffic Input (CSV/Form)│
                               └─────────────────┬────────────────┘
                                                 │
                                                 ▼
                               ┌──────────────────────────────────┐
                               │  FastAPI Backend REST API        │
                               └─────────────────┬────────────────┘
                                                 │
                                                 ▼
                               ┌──────────────────────────────────┐
                               │  Preprocessing & Scaling Pipeline│
                               │  (StandardScaler & Imputer)      │
                               └─────────────────┬────────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        │                                                 │
                        ▼                                                 ▼
     ┌──────────────────────────────────┐              ┌──────────────────────────────────┐
     │ Unsupervised Anomaly Engine      │              │ Supervised Multi-Class Classifier│
     │ (Isolation Forest)               │              │ (Random Forest)                  │
     │ Output: Anomaly Score (A)        │              │ Output: Class Probabilities (P)  │
     └──────────────────┬───────────────┘              └──────────────────┬───────────────┘
                        │                                                 │
                        └────────────────────────┬────────────────────────┘
                                                 │
                                                 ▼
                               ┌──────────────────────────────────┐
                               │ Zero-Day Risk Decision Matrix    │
                               │ Risk Score = 0.40*P_mal + 0.60*A │
                               └─────────────────┬────────────────┘
                                                 │
                                                 ▼
                               ┌──────────────────────────────────┐
                               │ SHAP TreeExplainer Engine (XAI)  │
                               │ Output: Feature Contribution Map │
                               └─────────────────┬────────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        │                                                 │
                        ▼                                                 ▼
     ┌──────────────────────────────────┐              ┌──────────────────────────────────┐
     │ SQLite Forensics Database        │              │ React.js SOC Web Dashboard       │
     │ (detections & detection_features)│              │ (Charts, Gauges, SHAP Bar Plots) │
     └──────────────────────────────────┘              └──────────────────────────────────┘
```

---

## 5. Machine Learning & XAI Methodology

### 5.1 Preprocessing Pipeline
Input features are normalized using `StandardScaler` to ensure zero mean and unit variance. Missing or infinite values are cleaned using median imputations. The 16 network features include:
- `flow_duration`
- `total_fwd_packets` & `total_bwd_packets`
- `total_length_fwd_packets` & `total_length_bwd_packets`
- `fwd_packet_length_mean` & `bwd_packet_length_mean`
- `flow_bytes_s` & `flow_packets_s`
- `packet_length_mean` & `packet_length_variance`
- `syn_flag_count`, `ack_flag_count`, `fin_flag_count`
- `destination_port` & `source_port`

### 5.2 Anomaly Detection (Isolation Forest)
Isolation Forest isolates observations by randomly selecting a feature and splitting the feature space. Outliers require fewer splits to isolate:
$$s(x, n) = 2^{-\frac{E(h(x))}{c(n)}}$$
Where $h(x)$ is path length and $c(n)$ is average path length of unsuccessful searches in a Binary Search Tree.

### 5.3 Supervised Classifier (Random Forest)
Random Forest consisting of 100 decision trees trained on labeled attack categories (Normal, DoS/DDoS, Probe/Scanning, Brute Force).

### 5.4 Zero-Day Risk Matrix & Risk Score
The risk score combines the supervised malicious probability $P_{malicious}$ and anomaly intensity $A$:
$$\text{Risk Score} = \min\left(100, \max\left(0, \text{round}\left( (0.40 \times P_{\text{malicious}} + 0.60 \times A) \times 100 \right)\right)\right)$$
If $A \ge 0.65$ and $P_{normal} > 0.35$ (indicating high structural abnormality without strong known attack signature alignment), the flow is designated **"Potential Zero-Day Attack"**.

### 5.5 SHAP Explainable AI (XAI)
SHAP calculates Shapley values from cooperative game theory:
$$\phi_i = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left( f(S \cup \{i\}) - f(S) \right)$$
Using `shap.TreeExplainer`, SHAP computes feature attribution vectors in $O(TLD^2)$ time, generating positive (risk-elevating) and negative (normal-indicating) contribution bars.

---

## 6. Database Schema (SQLite)

### Table: `detections`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique detection ID |
| `timestamp` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Evaluation timestamp |
| `prediction` | VARCHAR(100) | NOT NULL | Classification label |
| `attack_category` | VARCHAR(100) | DEFAULT 'Normal' | Attack category |
| `confidence` | FLOAT | NOT NULL | Model confidence |
| `anomaly_score` | FLOAT | NOT NULL | Isolation Forest score |
| `risk_score` | FLOAT | NOT NULL | Calculated risk score (0-100) |
| `risk_level` | VARCHAR(50) | NOT NULL | Low/Medium/High/Critical |
| `is_zero_day` | BOOLEAN | DEFAULT FALSE | Zero-day flag |
| `source` | VARCHAR(100) | DEFAULT '192.168.1.100' | Source IP |
| `destination` | VARCHAR(100) | DEFAULT '10.0.0.1' | Destination IP |
| `explanation_summary` | TEXT | NULLABLE | Executive narrative |

### Table: `detection_features`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique feature ID |
| `detection_id` | INTEGER | FOREIGN KEY (`detections.id`) | Reference detection |
| `feature_name` | VARCHAR(100) | NOT NULL | Feature identifier |
| `feature_value` | FLOAT | NOT NULL | Raw numerical value |
| `contribution` | FLOAT | NOT NULL | SHAP attribution value |
| `importance` | FLOAT | DEFAULT 0.0 | Feature importance weight |

---

## 7. Experimental Results & Performance Metrics

Evaluating the hybrid framework on the test split of the synthetic CIC-IDS2017 dataset yielded the following metrics:

| Metric | Score |
| :--- | :--- |
| **Accuracy** | **100.00%** |
| **Precision** | **100.00%** |
| **Recall** | **100.00%** |
| **F1-Score** | **100.00%** |
| **ROC-AUC** | **100.00%** |
| **XAI Method** | **SHAP TreeExplainer** |

---

## 8. Viva Questions & Expected Answers

**Q1: Why combine Isolation Forest with Random Forest instead of using Random Forest alone?**  
*Answer*: Random Forest is a supervised classifier that can only recognize patterns it was explicitly trained on. If a novel zero-day attack occurs, Random Forest will incorrectly force it into one of its known classes or misclassify it as normal. Isolation Forest is unsupervised and isolates statistical outliers regardless of signatures. Combining both allows us to flag traffic that is highly anomalous yet unrecognized as a "Potential Zero-Day Attack".

**Q2: What are SHAP values and why are they superior to Gini feature importance?**  
*Answer*: Gini importance only gives a global score for the entire model across the whole dataset and does not explain individual predictions. SHAP values are based on game theory (Shapley values) and provide local explanations for a *specific* traffic flow, showing exactly how much each feature increased or decreased the risk score for that specific instance.

---

## 9. Conclusion & Future Scope

The **Explainable AI-Based Framework for Detecting Zero-Day Cyber Attacks** provides a complete, working solution to the dual challenges of zero-day vulnerability detection and black-box ML opacity. Future developments include integrating raw socket packet capture (PCAP) with PyShark, automated SIEM rule generation (Snort/Suricata), and Autoencoder deep learning for temporal sequence evaluation.
