import React, { useState } from 'react';
import { Play, ShieldAlert, Cpu, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import { predictTraffic } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import FeatureImportanceChart from '../components/FeatureImportanceChart';

const TrafficAnalysis = () => {
  const defaultForm = {
    flow_duration: 12500,
    total_fwd_packets: 10,
    total_bwd_packets: 12,
    total_length_fwd_packets: 1200,
    total_length_bwd_packets: 4500,
    fwd_packet_length_mean: 120,
    bwd_packet_length_mean: 375,
    flow_bytes_s: 15000,
    flow_packets_s: 250,
    packet_length_mean: 240,
    packet_length_variance: 1200,
    syn_flag_count: 0,
    ack_flag_count: 1,
    fin_flag_count: 0,
    destination_port: 443,
    source_port: 54321,
    source_ip: "192.168.1.105",
    destination_ip: "10.0.0.1"
  };

  const [formData, setFormData] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presets = {
    normal: {
      flow_duration: 25000,
      total_fwd_packets: 12,
      total_bwd_packets: 14,
      total_length_fwd_packets: 1500,
      total_length_bwd_packets: 8000,
      fwd_packet_length_mean: 125,
      bwd_packet_length_mean: 570,
      flow_bytes_s: 18000,
      flow_packets_s: 150,
      packet_length_mean: 350,
      packet_length_variance: 2200,
      syn_flag_count: 0,
      ack_flag_count: 1,
      fin_flag_count: 0,
      destination_port: 443,
      source_port: 52104,
      source_ip: "192.168.1.105",
      destination_ip: "10.0.0.1"
    },
    dos: {
      flow_duration: 1200,
      total_fwd_packets: 2500,
      total_bwd_packets: 2,
      total_length_fwd_packets: 250000,
      total_length_bwd_packets: 100,
      fwd_packet_length_mean: 100,
      bwd_packet_length_mean: 50,
      flow_bytes_s: 2500000,
      flow_packets_s: 35000,
      packet_length_mean: 95,
      packet_length_variance: 8500,
      syn_flag_count: 45,
      ack_flag_count: 0,
      fin_flag_count: 0,
      destination_port: 80,
      source_port: 41230,
      source_ip: "172.16.0.44",
      destination_ip: "10.0.0.1"
    },
    probe: {
      flow_duration: 50,
      total_fwd_packets: 2,
      total_bwd_packets: 0,
      total_length_fwd_packets: 40,
      total_length_bwd_packets: 0,
      fwd_packet_length_mean: 20,
      bwd_packet_length_mean: 0,
      flow_bytes_s: 800,
      flow_packets_s: 1200,
      packet_length_mean: 20,
      packet_length_variance: 50,
      syn_flag_count: 1,
      ack_flag_count: 0,
      fin_flag_count: 0,
      destination_port: 3389,
      source_port: 59102,
      source_ip: "192.168.1.200",
      destination_ip: "10.0.0.1"
    },
    zeroday: {
      flow_duration: 1500000,
      total_fwd_packets: 450,
      total_bwd_packets: 450,
      total_length_fwd_packets: 180000,
      total_length_bwd_packets: 350000,
      fwd_packet_length_mean: 850,
      bwd_packet_length_mean: 1200,
      flow_bytes_s: 850000,
      flow_packets_s: 8500,
      packet_length_mean: 1100,
      packet_length_variance: 185000,
      syn_flag_count: 15,
      ack_flag_count: 15,
      fin_flag_count: 15,
      destination_port: 31337,
      source_port: 60100,
      source_ip: "192.168.1.240",
      destination_ip: "10.0.0.1"
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('ip') ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    predictTraffic(formData)
      .then((res) => {
        setResult(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Inference error:', err);
        setError(err.response?.data?.detail || err.message || 'Inference call failed.');
        setLoading(false);
      });
  };

  const applyPreset = (presetKey) => {
    setFormData(presets[presetKey]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Presets */}
      <div className="glass-card p-5 border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Interactive Network Flow Analyzer</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Manually enter traffic parameters or select a test scenario preset below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono font-semibold mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('normal')}
            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono font-medium transition-colors"
          >
            Normal Flow
          </button>
          <button
            onClick={() => applyPreset('dos')}
            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-mono font-medium transition-colors"
          >
            DoS Attack
          </button>
          <button
            onClick={() => applyPreset('probe')}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-mono font-medium transition-colors"
          >
            Port Scan Probe
          </button>
          <button
            onClick={() => applyPreset('zeroday')}
            className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded text-xs font-mono font-bold transition-colors glow-purple"
          >
            Zero-Day Anomaly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (Left 5 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 glass-card p-5 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            Network Feature Inputs
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Flow Duration (us)</label>
              <input
                type="number"
                name="flow_duration"
                value={formData.flow_duration}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Destination Port</label>
              <input
                type="number"
                name="destination_port"
                value={formData.destination_port}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Total Fwd Packets</label>
              <input
                type="number"
                name="total_fwd_packets"
                value={formData.total_fwd_packets}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Total Bwd Packets</label>
              <input
                type="number"
                name="total_bwd_packets"
                value={formData.total_bwd_packets}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Flow Bytes/s</label>
              <input
                type="number"
                name="flow_bytes_s"
                value={formData.flow_bytes_s}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Flow Packets/s</label>
              <input
                type="number"
                name="flow_packets_s"
                value={formData.flow_packets_s}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Packet Length Mean</label>
              <input
                type="number"
                name="packet_length_mean"
                value={formData.packet_length_mean}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Packet Length Var</label>
              <input
                type="number"
                name="packet_length_variance"
                value={formData.packet_length_variance}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">SYN Flag Count</label>
              <input
                type="number"
                name="syn_flag_count"
                value={formData.syn_flag_count}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">ACK Flag Count</label>
              <input
                type="number"
                name="ack_flag_count"
                value={formData.ack_flag_count}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Running ML Inference & SHAP...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Analyze Traffic Flow</span>
              </>
            )}
          </button>
        </form>

        {/* Inference Results & SHAP XAI (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="glass-card p-4 border-rose-500/40 text-rose-400 font-mono text-xs">
              Error: {error}
            </div>
          )}

          {!result && !error && !loading && (
            <div className="glass-card p-12 text-center text-slate-500 font-mono text-xs border-dashed border-slate-800">
              Submit network features or choose a preset to generate Explainable AI results.
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Classification Summary Card */}
              <div className="glass-card p-5 border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">ML Classification</span>
                    <h3 className="text-2xl font-extrabold text-slate-100 mt-1 flex items-center space-x-2">
                      <span>{result.prediction}</span>
                      {result.is_zero_day && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 glow-purple">
                          Zero-Day Threat
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-4">
                    <RiskGauge
                      score={result.risk_score}
                      level={result.risk_level}
                      isZeroDay={result.is_zero_day}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 text-xs font-mono">
                  <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block">Category:</span>
                    <span className="text-slate-200 font-bold">{result.attack_category}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block">Confidence:</span>
                    <span className="text-slate-200 font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block">Anomaly Score:</span>
                    <span className="text-amber-400 font-bold">{result.anomaly_score.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* SHAP Feature Importance */}
              <div className="glass-card p-5 border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-3">
                  SHAP Explainability (Top Feature Drivers)
                </h4>
                <FeatureImportanceChart features={result.top_features} />
              </div>

              {/* Human Readable Report */}
              <div className="glass-card p-5 border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                  Automated Security Analyst Summary
                </h4>
                <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {result.explanation?.summary}
                </div>
                <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded text-xs text-indigo-200 flex items-start space-x-2 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Action Recommendation:</strong> {result.explanation?.risk_assessment}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalysis;
