import React, { useEffect, useState } from 'react';
import { X, ShieldAlert, Cpu, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import RiskGauge from './RiskGauge';
import FeatureImportanceChart from './FeatureImportanceChart';
import { getDetectionDetail } from '../services/api';

const DetectionModal = ({ detectionId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!detectionId) return;
    setLoading(true);
    getDetectionDetail(detectionId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed loading detection detail');
        setLoading(false);
      });
  }, [detectionId]);

  if (!detectionId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${data?.is_zero_day ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>Detection #{detectionId}</span>
                {data?.is_zero_day && (
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 glow-purple">
                    Zero-Day Threat
                  </span>
                )}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono">
                {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="p-8 sm:p-12 text-center text-slate-400 font-mono text-sm">
            Fetching Explainable AI Breakdown...
          </div>
        ) : error ? (
          <div className="p-6 sm:p-8 text-center text-rose-400 font-mono text-sm">
            {error}
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
            {/* Top Grid: Classification & Risk Gauge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Prediction Summary */}
              <div className="md:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-mono uppercase tracking-wider font-semibold mb-1">
                    Classification Result
                  </div>
                  <div className="text-2xl font-extrabold text-slate-100 mb-2">
                    {data.prediction}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono mb-4">
                    <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                      Category: <strong className="text-indigo-400">{data.attack_category}</strong>
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                      Confidence: <strong>{(data.confidence * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                      Anomaly Score: <strong className="text-amber-400">{data.anomaly_score.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">Source Host:</span>
                    <span className="text-slate-200 font-semibold">{data.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Destination Endpoint:</span>
                    <span className="text-slate-200 font-semibold">{data.destination}</span>
                  </div>
                </div>
              </div>

              {/* Risk Gauge */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-center">
                <RiskGauge
                  score={data.risk_score}
                  level={data.risk_level}
                  isZeroDay={data.is_zero_day}
                />
              </div>
            </div>

            {/* SHAP Feature Contribution Chart */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Explainable AI (SHAP) Feature Contributions</span>
              </h4>
              <FeatureImportanceChart features={data.top_features} />
            </div>

            {/* Human Readable Explanation */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Executive Security Explanation & Recommendation</span>
              </h4>
              <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/90 p-4 rounded-lg border border-slate-800">
                {data.explanation?.summary}
              </div>

              {/* Key Factors Bullet points */}
              <div>
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Key Contributing Factors:
                </h5>
                <ul className="space-y-2 text-xs text-slate-300">
                  {data.explanation?.key_factors?.map((factor, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-400 mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Action */}
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-lg text-xs text-indigo-200 flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <strong className="font-semibold block text-indigo-100">Recommended SOC Action:</strong>
                  {data.explanation?.risk_assessment}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionModal;
