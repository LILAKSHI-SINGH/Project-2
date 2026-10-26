import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle, ShieldAlert, BrainCircuit, Eye } from 'lucide-react';
import { analyzeCSV } from '../services/api';
import DetectionModal from '../components/DetectionModal';

const CsvUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    analyzeCSV(file)
      .then((res) => {
        setSummary(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('CSV error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed processing CSV file.');
        setLoading(false);
      });
  };

  const downloadCSV = () => {
    if (!summary || !summary.processed_detections) return;

    const headers = ["ID", "Timestamp", "Source", "Destination", "Prediction", "Category", "Confidence", "AnomalyScore", "RiskScore", "RiskLevel", "IsZeroDay"];
    const rows = summary.processed_detections.map(d => [
      d.id,
      d.timestamp,
      d.source,
      d.destination,
      `"${d.prediction}"`,
      `"${d.attack_category}"`,
      d.confidence,
      d.anomaly_score,
      d.risk_score,
      `"${d.risk_level}"`,
      d.is_zero_day
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analyzed_traffic_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      {/* File Upload Box */}
      <div className="glass-card p-6 border-slate-800">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-2">
          <UploadCloud className="w-5 h-5 text-indigo-400" />
          <span>Batch Network Traffic Analysis (CSV Upload)</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-4">
          Upload a network traffic dataset CSV (compatible with CIC-IDS2017 feature schemas).
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-8 text-center transition-colors bg-slate-950/40">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center justify-center">
              <FileSpreadsheet className="w-10 h-10 text-indigo-400 mb-2" />
              {file ? (
                <span className="text-sm font-semibold text-slate-200 font-mono">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              ) : (
                <>
                  <span className="text-sm font-semibold text-slate-300">Click to select CSV dataset</span>
                  <span className="text-xs text-slate-500 font-mono mt-1">Supports Flow Duration, SYN/ACK Flags, Flow Bytes/s, Ports...</span>
                </>
              )}
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="submit"
              disabled={!file || loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2"
            >
              {loading ? (
                <span>Batch ML Evaluation in Progress...</span>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Process CSV File</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-400 font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Summary Analytics Cards */}
      {summary && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Bulk Analysis Results Overview</h3>
            <button
              onClick={downloadCSV}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Analyzed CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-card p-4 text-center">
              <span className="text-[11px] text-slate-400 font-mono block">Total Rows</span>
              <span className="text-2xl font-extrabold text-slate-100 font-mono">{summary.total_records}</span>
            </div>
            <div className="glass-card p-4 text-center">
              <span className="text-[11px] text-slate-400 font-mono block">Normal</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">{summary.normal_count}</span>
            </div>
            <div className="glass-card p-4 text-center">
              <span className="text-[11px] text-slate-400 font-mono block">Known Attacks</span>
              <span className="text-2xl font-extrabold text-rose-400 font-mono">{summary.known_attack_count}</span>
            </div>
            <div className="glass-card p-4 text-center">
              <span className="text-[11px] text-slate-400 font-mono block">Suspicious</span>
              <span className="text-2xl font-extrabold text-amber-400 font-mono">{summary.suspicious_count}</span>
            </div>
            <div className="glass-card p-4 text-center border-purple-500/30">
              <span className="text-[11px] text-purple-300 font-mono block">Zero-Days</span>
              <span className="text-2xl font-extrabold text-purple-400 font-mono">{summary.potential_zero_day_count}</span>
            </div>
            <div className="glass-card p-4 text-center">
              <span className="text-[11px] text-slate-400 font-mono block">Avg Risk</span>
              <span className="text-2xl font-extrabold text-indigo-400 font-mono">{summary.avg_risk_score}%</span>
            </div>
          </div>

          {/* Processed Detections Table */}
          <div className="glass-card border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                Extracted CSV Flow Predictions
              </h4>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 sticky top-0">
                    <th className="py-2.5 px-4">Flow ID</th>
                    <th className="py-2.5 px-4">Prediction</th>
                    <th className="py-2.5 px-4">Risk Score</th>
                    <th className="py-2.5 px-4">Anomaly Score</th>
                    <th className="py-2.5 px-4">Risk Level</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {summary.processed_detections.map((det) => (
                    <tr key={det.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-4 text-slate-400">#{det.id}</td>
                      <td className="py-2 px-4 font-bold">
                        {det.is_zero_day ? (
                          <span className="text-purple-400">Potential Zero-Day</span>
                        ) : (
                          <span>{det.prediction}</span>
                        )}
                      </td>
                      <td className="py-2 px-4">{det.risk_score}%</td>
                      <td className="py-2 px-4 text-slate-400">{det.anomaly_score.toFixed(2)}</td>
                      <td className="py-2 px-4">{det.risk_level}</td>
                      <td className="py-2 px-4 text-right">
                        <button
                          onClick={() => setSelectedDetectionId(det.id)}
                          className="px-2 py-0.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-[10px] font-semibold"
                        >
                          XAI Breakdown
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedDetectionId && (
        <DetectionModal
          detectionId={selectedDetectionId}
          onClose={() => setSelectedDetectionId(null)}
        />
      )}
    </div>
  );
};

export default CsvUpload;
