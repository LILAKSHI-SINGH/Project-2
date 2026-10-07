import os
import numpy as np
import pandas as pd

def generate_synthetic_dataset(num_samples: int = 1200, output_path: str = None):
    """Generate realistic synthetic CIC-IDS2017 style dataset for demonstration and training."""
    np.random.seed(42)

    if output_path is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(base_dir, "backend", "data", "sample_traffic.csv")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    records = []

    # Distribution ratios
    num_normal = int(num_samples * 0.55)
    num_dos = int(num_samples * 0.15)
    num_probe = int(num_samples * 0.12)
    num_brute = int(num_samples * 0.08)
    num_zeroday = num_samples - (num_normal + num_dos + num_probe + num_brute)

    # 1. Normal Traffic
    for _ in range(num_normal):
        records.append({
            "flow_duration": np.random.uniform(500, 150000),
            "total_fwd_packets": np.random.randint(2, 25),
            "total_bwd_packets": np.random.randint(2, 25),
            "total_length_fwd_packets": np.random.uniform(100, 3000),
            "total_length_bwd_packets": np.random.uniform(200, 15000),
            "fwd_packet_length_mean": np.random.uniform(40, 250),
            "bwd_packet_length_mean": np.random.uniform(60, 600),
            "flow_bytes_s": np.random.uniform(500, 50000),
            "flow_packets_s": np.random.uniform(10, 500),
            "packet_length_mean": np.random.uniform(50, 400),
            "packet_length_variance": np.random.uniform(100, 5000),
            "syn_flag_count": np.random.choice([0, 1], p=[0.9, 0.1]),
            "ack_flag_count": np.random.choice([0, 1], p=[0.1, 0.9]),
            "fin_flag_count": np.random.choice([0, 1], p=[0.92, 0.08]),
            "destination_port": np.random.choice([80, 443, 53, 8080], p=[0.4, 0.45, 0.1, 0.05]),
            "source_port": np.random.randint(49152, 65535),
            "Label": "Normal"
        })

    # 2. DoS/DDoS Attack
    for _ in range(num_dos):
        records.append({
            "flow_duration": np.random.uniform(100, 5000),
            "total_fwd_packets": np.random.randint(500, 5000),
            "total_bwd_packets": np.random.randint(0, 5),
            "total_length_fwd_packets": np.random.uniform(50000, 500000),
            "total_length_bwd_packets": np.random.uniform(0, 500),
            "fwd_packet_length_mean": np.random.uniform(100, 400),
            "bwd_packet_length_mean": np.random.uniform(0, 50),
            "flow_bytes_s": np.random.uniform(500000, 10000000),
            "flow_packets_s": np.random.uniform(5000, 80000),
            "packet_length_mean": np.random.uniform(100, 300),
            "packet_length_variance": np.random.uniform(1000, 15000),
            "syn_flag_count": np.random.randint(10, 100),
            "ack_flag_count": np.random.choice([0, 1], p=[0.8, 0.2]),
            "fin_flag_count": 0,
            "destination_port": np.random.choice([80, 443]),
            "source_port": np.random.randint(1024, 65535),
            "Label": "DoS/DDoS"
        })

    # 3. Probe / Port Scanning
    for _ in range(num_probe):
        records.append({
            "flow_duration": np.random.uniform(10, 500),
            "total_fwd_packets": np.random.randint(1, 3),
            "total_bwd_packets": np.random.randint(0, 2),
            "total_length_fwd_packets": np.random.uniform(0, 100),
            "total_length_bwd_packets": np.random.uniform(0, 50),
            "fwd_packet_length_mean": np.random.uniform(0, 60),
            "bwd_packet_length_mean": np.random.uniform(0, 30),
            "flow_bytes_s": np.random.uniform(100, 2000),
            "flow_packets_s": np.random.uniform(100, 3000),
            "packet_length_mean": np.random.uniform(10, 50),
            "packet_length_variance": np.random.uniform(0, 200),
            "syn_flag_count": 1,
            "ack_flag_count": 0,
            "fin_flag_count": 0,
            "destination_port": np.random.choice([21, 22, 23, 25, 53, 110, 135, 139, 445, 1433, 3306, 3389, 8080]),
            "source_port": np.random.randint(40000, 60000),
            "Label": "Probe/Scanning"
        })

    # 4. Brute Force
    for _ in range(num_brute):
        records.append({
            "flow_duration": np.random.uniform(20000, 300000),
            "total_fwd_packets": np.random.randint(30, 150),
            "total_bwd_packets": np.random.randint(30, 150),
            "total_length_fwd_packets": np.random.uniform(2000, 10000),
            "total_length_bwd_packets": np.random.uniform(3000, 15000),
            "fwd_packet_length_mean": np.random.uniform(60, 120),
            "bwd_packet_length_mean": np.random.uniform(80, 160),
            "flow_bytes_s": np.random.uniform(1000, 15000),
            "flow_packets_s": np.random.uniform(50, 400),
            "packet_length_mean": np.random.uniform(70, 140),
            "packet_length_variance": np.random.uniform(500, 3000),
            "syn_flag_count": np.random.randint(2, 10),
            "ack_flag_count": np.random.randint(20, 100),
            "fin_flag_count": np.random.randint(1, 5),
            "destination_port": np.random.choice([22, 3389, 21]),
            "source_port": np.random.randint(49152, 65535),
            "Label": "Brute Force"
        })

    # 5. Zero-Day-Like Anomalies
    for _ in range(num_zeroday):
        records.append({
            "flow_duration": np.random.uniform(800000, 5000000),  # Extreme duration
            "total_fwd_packets": np.random.randint(100, 800),
            "total_bwd_packets": np.random.randint(100, 800),
            "total_length_fwd_packets": np.random.uniform(50000, 300000),
            "total_length_bwd_packets": np.random.uniform(80000, 600000),
            "fwd_packet_length_mean": np.random.uniform(400, 1500),
            "bwd_packet_length_mean": np.random.uniform(500, 2000),
            "flow_bytes_s": np.random.uniform(150000, 1500000),
            "flow_packets_s": np.random.uniform(1000, 12000),
            "packet_length_mean": np.random.uniform(600, 1800),
            "packet_length_variance": np.random.uniform(40000, 250000),  # Massive variance outlier
            "syn_flag_count": np.random.randint(5, 30),
            "ack_flag_count": np.random.randint(5, 30),
            "fin_flag_count": np.random.randint(5, 30),  # Malformed flag combinations
            "destination_port": np.random.choice([31337, 4444, 9999, 6667, 12345]),  # Unusual Trojan/Backdoor ports
            "source_port": np.random.randint(1024, 65535),
            "Label": "Potential Zero-Day Attack"
        })

    df = pd.DataFrame(records)
    # Shuffle dataframe
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    df.to_csv(output_path, index=False)
    print(f"[+] Successfully generated synthetic CIC-IDS2017 dataset with {len(df)} records at: {output_path}")
    return output_path

if __name__ == "__main__":
    generate_synthetic_dataset()
