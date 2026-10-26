import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, RefreshCw, BarChart2, Layers } from 'lucide-react';
import { getModelInfo, triggerTraining } from '../services/api';

const ModelInfo = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainMessage, setTrainMessage] = useState(null);

  const fetchInfo = () => {
    setLoading(true);
    getModelInfo()
      .then((res) => {
        setInfo(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching model info:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleRetrain = () => {
    setTraining(true);
    setTrainMessage(null);

    triggerTraining()
      .then((res) => {
        setTrainMessage('Model training pipeline executed successfully!');
        setTraining(false);
        fetchInfo();
      })
      .catch((err) => {
        setTrainMessage(`Retraining failed: ${err.message}`);
        setTraining(false);
      });
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-full">
      {/* Header & Retrain Action */}
      <div className="glass-card p-4 sm:p-5 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <span>Machine Learning Architecture & Metrics</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
            Hybrid Isolation Forest (Anomaly) + Random Forest (Multiclass) + SHAP XAI Engine.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={training}
          className="w-full sm:w-auto justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${training ? 'animate-spin' : ''}`} />
          <span>{training ? 'Retraining Models...' : 'Retrain ML Pipeline'}</span>
        </button>
      </div>

      {trainMessage && (
        <div className="p-3 bg-indigo-950/60 border border-indigo-800 rounded-lg text-xs font-mono text-indigo-200">
          {trainMessage}
        </div>
      )}

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400 font-mono text-sm">
          Loading ML Model Metadata...
        </div>
      ) : !info?.is_trained ? (
        <div className="glass-card p-6 sm:p-8 border-amber-500/40 text-center space-y-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 font-mono">Model Not Trained</h3>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
            {info?.message || "ML model not found. Please run the training pipeline first."}
          </p>
          <button
            onClick={handleRetrain}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow"
          >
            Run Training Pipeline Now
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Performance Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 font-mono">
            <div className="glass-card p-3 sm:p-4 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase block">Accuracy</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">{info.accuracy}%</span>
            </div>
            <div className="glass-card p-3 sm:p-4 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase block">Precision</span>
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-400">{info.precision}%</span>
            </div>
            <div className="glass-card p-3 sm:p-4 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase block">Recall</span>
              <span className="text-xl sm:text-2xl font-extrabold text-purple-400">{info.recall}%</span>
            </div>
            <div className="glass-card p-3 sm:p-4 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase block">F1-Score</span>
              <span className="text-xl sm:text-2xl font-extrabold text-cyan-400">{info.f1_score}%</span>
            </div>
            <div className="glass-card p-3 sm:p-4 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase block">ROC-AUC</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-400">{info.roc_auc}%</span>
            </div>
          </div>

          {/* Architecture Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* Algorithm Info */}
            <div className="glass-card p-5 border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Detection Framework Architecture</span>
              </h3>

              <div className="space-y-3">
                <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
                  <strong className="text-slate-200 block text-xs mb-1">1. Anomaly Detection Engine</strong>
                  <span className="text-indigo-300">Isolation Forest (Unsupervised)</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    Isolates network flow outliers in tree parameter space without depending on signature databases.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
                  <strong className="text-slate-200 block text-xs mb-1">2. Supervised Threat Classifier</strong>
                  <span className="text-purple-300">Random Forest Classifier (100 Trees)</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    Classifies traffic flows into known attack categories (DoS/DDoS, Probe, Brute Force).
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
                  <strong className="text-slate-200 block text-xs mb-1">3. Zero-Day Risk Scoring Matrix</strong>
                  <span className="text-amber-300">Hybrid Risk Function</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    Triggers <strong>"Potential Zero-Day"</strong> when Isolation Forest anomaly score &ge; 0.65 while supervised signature match remains low.
                  </p>
                </div>
              </div>
            </div>

            {/* Dataset & Training Specs */}
            <div className="glass-card p-5 border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                <span>Training Pipeline Specifications</span>
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Model Name:</span>
                  <span className="text-slate-200">{info.model_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Dataset File:</span>
                  <span className="text-slate-200">{info.training_dataset}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Training Samples:</span>
                  <span className="text-slate-200">{info.training_samples?.toLocaleString()} flows</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Features:</span>
                  <span className="text-slate-200">{info.num_features} numerical metrics</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Explainable AI Method:</span>
                  <span className="text-purple-400 font-bold">{info.xai_method}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Last Trained Timestamp:</span>
                  <span className="text-slate-300">{info.last_trained ? new Date(info.last_trained).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature List Table */}
          <div className="glass-card border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                Configured Network Traffic Feature Set ({info.feature_list?.length || 16})
              </h4>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
              {info.feature_list?.map((feat, idx) => (
                <div key={idx} className="p-2 bg-slate-950/60 rounded border border-slate-800 text-slate-300 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelInfo;
