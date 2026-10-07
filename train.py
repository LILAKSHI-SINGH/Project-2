import os
import sys

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from app.ml.train import train_pipeline
from generate_sample_data import generate_synthetic_dataset

def main():
    print("=" * 65)
    print("      EXPLAINABLE AI ZERO-DAY CYBER ATTACK DETECTION PIPELINE     ")
    print("=" * 65)

    data_path = os.path.join(BASE_DIR, "backend", "data", "sample_traffic.csv")
    if not os.path.exists(data_path):
        print("[!] Synthetic dataset not found. Generating synthetic dataset...")
        generate_synthetic_dataset(num_samples=1200, output_path=data_path)

    print("[*] Launching Model Training & Evaluation Pipeline...")
    metrics = train_pipeline(csv_file_path=data_path)

    print("\n" + "=" * 65)
    print("                      TRAINING RESULTS                          ")
    print("=" * 65)
    print(f" Model Name        : {metrics['model_name']}")
    print(f" Dataset           : {metrics['training_dataset']}")
    print(f" Training Samples  : {metrics['training_samples']}")
    print(f" Accuracy          : {metrics['accuracy'] * 100:.2f}%")
    print(f" Precision         : {metrics['precision'] * 100:.2f}%")
    print(f" Recall            : {metrics['recall'] * 100:.2f}%")
    print(f" F1-Score          : {metrics['f1_score'] * 100:.2f}%")
    print(f" ROC-AUC           : {metrics['roc_auc'] * 100:.2f}%")
    print(f" Features Used     : {metrics['num_features']}")
    print(f" XAI Method        : {metrics['xai_method']}")
    print("=" * 65)
    print("[+] Models saved in 'backend/models/' directory successfully.")

if __name__ == "__main__":
    main()
