import React, { useEffect, useState } from 'react';
import { BrainCircuit, Search, Cpu, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getDetectionDetail, getDetections } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import FeatureImportanceChart from '../components/FeatureImportanceChart';

const ExplainabilityPage = () => {
  const [detectionIdInput, setDetectionIdInput] = useState('');
  const [activeDetectionId, setActiveDetectionId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load latest detection by default if none specified
  useEffect(() => {
    getDetections({ page: 1, page_size: 1 })
      .then((res) => {
        if (res.detections && res.detections.length > 0) {
          const latestId = res.detections[0].id;
          setActiveDetectionId(latestId);
          setDetectionIdInput(latestId.toString());
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!activeDetectionId) return;
    setLoading(true);
    setError(null);

    getDetectionDetail(activeDetectionId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to load explanation for Detection #${activeDetectionId}.`);
        setLoading(false);
      });
  }, [activeDetectionId]);

  const handleSearch = (e) => {
    e.preventDefault();
    const parsed = parseInt(detectionIdInput.trim());
    if (parsed) {
      setActiveDetectionId(parsed);
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-full">
      {/* Search Header */}
      <div className="glass-card p-4 sm:p-5 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span>Explainable AI (XAI) Security Analysis Dashboard</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
            Transparent SHAP feature attribution & automated zero-day security narrative generation.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <input
            type="number"
            placeholder="Enter Detection ID (e.g. 1)..."
            value={detectionIdInput}
            onChange={(e) => setDetectionIdInput(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono w-full sm:w-52"
          />
          <button
            type="submit"
            className="w-full sm:w-auto justify-center px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold font-mono flex items-center space-x-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Inspect XAI</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400 font-mono text-sm">
          Calculating SHAP TreeExplainer Feature Vectors...
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center text-rose-400 font-mono text-xs">
          {error}
        </div>
      ) : !data ? (
        <div className="glass-card p-12 text-center text-slate-500 font-mono text-xs">
          No detection record selected. Analyze traffic or search a valid Detection ID.
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Threat Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left 8 Cols: Threat Card */}
            <div className="lg:col-span-8 glass-card p-4 sm:p-6 border-slate-800 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Detection #{data.id} Evaluation</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1 flex flex-wrap items-center gap-2">
                    <span>{data.prediction}</span>
                    {data.is_zero_day && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 glow-purple">
                        Potential Zero-Day Attack
                      </span>
                    )}
                  </h3>
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-slate-400">
                  <div>{new Date(data.timestamp).toLocaleString()}</div>
                  <div className="mt-1 text-slate-300">Flow: {data.source} → {data.destination}</div>
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs font-mono">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Category Label:</span>
                  <span className="text-slate-100 font-bold text-sm">{data.attack_category}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Model Confidence:</span>
                  <span className="text-emerald-400 font-bold text-sm">{(data.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Isolation Anomaly Index:</span>
                  <span className="text-amber-400 font-bold text-sm">{data.anomaly_score.toFixed(2)}</span>
                </div>
              </div>

              {/* SHAP Feature Importance Chart */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-3">
                  SHAP Additive Feature Contribution Plot
                </h4>
                <FeatureImportanceChart features={data.top_features} />
              </div>
            </div>

            {/* Right 4 Cols: Risk Gauge & Methodology */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card p-6 border-slate-800 flex flex-col items-center justify-center">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-2">
                  Threat Risk Severity
                </h4>
                <RiskGauge
                  score={data.risk_score}
                  level={data.risk_level}
                  isZeroDay={data.is_zero_day}
                />
              </div>

              <div className="glass-card p-5 border-slate-800 text-xs text-slate-400 space-y-2 font-mono">
                <h4 className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  XAI Methodology Overview
                </h4>
                <p>
                  This system combines <strong>Isolation Forest</strong> (unsupervised outlier distance) with <strong>Random Forest</strong> (supervised tree ensemble) and applies <strong>SHAP (SHapley Additive exPlanations)</strong>.
                </p>
                <p>
                  SHAP calculates the exact marginal contribution of each network feature towards classifying the traffic as normal or anomalous.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Security Analyst Narrative */}
          <div className="glass-card p-6 border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Automated Human-Readable Security Report</span>
            </h3>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed">
              {data.explanation?.summary}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Positive Risk Contributors */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-rose-400 font-mono uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Anomalous / Threat Drivers</span>
                </h4>
                <ul className="space-y-2 text-slate-300">
                  {data.explanation?.positive_contributors?.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{item.impact_description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Negative Baseline Indicators */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 font-mono uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Normal Baseline Indicators</span>
                </h4>
                <ul className="space-y-2 text-slate-300">
                  {data.explanation?.negative_contributors?.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item.impact_description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable SOC recommendation */}
            <div className="p-4 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-xs text-indigo-200 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                <strong className="text-indigo-100 font-bold text-sm block">SOC Action Advisory:</strong>
                {data.explanation?.risk_assessment}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainabilityPage;
