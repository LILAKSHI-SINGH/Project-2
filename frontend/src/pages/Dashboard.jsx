import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  TrendingUp,
  BrainCircuit,
  Eye,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  BarChart, 
  Bar 
} from 'recharts';
import { getStatistics, getDetections } from '../services/api';
import DetectionModal from '../components/DetectionModal';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetectionId, setSelectedDetectionId] = useState(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      getStatistics(),
      getDetections({ page: 1, page_size: 7 })
    ])
      .then(([statsRes, detRes]) => {
        setStats(statsRes);
        setRecentDetections(detRes.detections || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Pie chart colors
  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];

  const attackPieData = stats?.attack_distribution
    ? Object.entries(stats.attack_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const riskBarData = stats?.risk_distribution
    ? Object.entries(stats.risk_distribution).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner Alert if Zero-Day detected */}
      {stats?.potential_zero_days_count > 0 && (
        <div className="bg-gradient-to-r from-purple-900/60 via-slate-900 to-indigo-900/60 border border-purple-500/40 rounded-xl p-4 flex items-center justify-between shadow-xl glow-purple">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-lg pulse-alert border border-purple-500/40">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm tracking-wide">
                Zero-Day Anomaly Detection Triggered
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                The SHAP Framework has flagged {stats.potential_zero_days_count} potential zero-day network traffic flow(s).
              </p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh SOC</span>
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyzed */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono font-semibold uppercase">Total Traffic</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-100 mt-3 font-mono">
            {stats?.total_analyzed?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Flows Evaluated</p>
        </div>

        {/* Normal Traffic */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono font-semibold uppercase">Normal Traffic</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-3 font-mono">
            {stats?.normal_count?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Clean Packets</p>
        </div>

        {/* Known Attacks */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono font-semibold uppercase">Known Attacks</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-3 font-mono">
            {stats?.known_attacks_count?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">DoS / Probe / Brute Force</p>
        </div>

        {/* Potential Zero-Days */}
        <div className="glass-card p-5 border-slate-800 border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300 font-mono font-semibold uppercase">Potential Zero-Day</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg glow-purple">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-400 mt-3 font-mono">
            {stats?.potential_zero_days_count?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-purple-300/80 mt-1 font-mono">Zero-Day-Like Anomalies</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Category Distribution Pie */}
        <div className="glass-card p-5 border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Threat Classification Breakdown</span>
            <span className="text-xs text-slate-500 font-mono font-normal">Real-Time</span>
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {attackPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs font-mono text-slate-200">
                          <strong>{payload[0].name}</strong>: {payload[0].value} flows
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono justify-center mt-2">
            {attackPieData.map((item, idx) => (
              <span key={idx} className="flex items-center space-x-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span>{item.name} ({item.value})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Risk Distribution Bar Chart */}
        <div className="glass-card p-5 border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Risk Severity Matrix</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs font-mono text-slate-200">
                          {payload[0].payload.name}: {payload[0].value} flows
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskBarData.map((entry, index) => {
                    let color = '#10b981';
                    if (entry.name === 'Critical Risk') color = '#ef4444';
                    else if (entry.name === 'High Risk') color = '#f97316';
                    else if (entry.name === 'Medium Risk') color = '#f59e0b';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-slate-400 font-mono mt-2">
            Average Risk Index: <strong className="text-amber-400">{stats?.average_risk_score || 0}%</strong>
          </div>
        </div>

        {/* Detection Timeline Area Chart */}
        <div className="glass-card p-5 border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Traffic Stream Activity</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.timeline_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-slate-400 font-mono mt-2">
            Model Accuracy Rate: <strong className="text-emerald-400">{stats?.detection_accuracy || 98.5}%</strong>
          </div>
        </div>
      </div>

      {/* Recent Detections Table */}
      <div className="glass-card border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Recent Network Detections</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Live predictions processed by Isolation Forest + Random Forest</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Source IP</th>
                <th className="py-3 px-4 font-semibold">Destination IP</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Risk Score</th>
                <th className="py-3 px-4 font-semibold">Anomaly</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentDetections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-mono">
                    No detection records found. Analyze traffic or upload a CSV to populate.
                  </td>
                </tr>
              ) : (
                recentDetections.map((det) => (
                  <tr key={det.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400">#{det.id}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(det.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-slate-200">{det.source}</td>
                    <td className="py-3 px-4 text-slate-200">{det.destination}</td>
                    <td className="py-3 px-4">
                      {det.is_zero_day ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 glow-purple">
                          Potential Zero-Day
                        </span>
                      ) : det.prediction.includes('Normal') ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Normal Traffic
                        </span>
                      ) : det.prediction.includes('Suspicious') ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Suspicious
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          {det.attack_category}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${det.risk_score > 75 ? 'text-rose-400' : det.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {det.risk_score}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{det.anomaly_score.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedDetectionId(det.id)}
                        className="px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-[11px] font-semibold flex items-center space-x-1 float-right"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View XAI</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detection XAI Modal */}
      {selectedDetectionId && (
        <DetectionModal
          detectionId={selectedDetectionId}
          onClose={() => setSelectedDetectionId(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
