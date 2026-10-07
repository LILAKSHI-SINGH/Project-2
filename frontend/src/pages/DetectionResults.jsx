import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getDetections } from '../services/api';
import DetectionModal from '../components/DetectionModal';

const DetectionResults = () => {
  const [detections, setDetections] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [zeroDayOnly, setZeroDayOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDetectionId, setSelectedDetectionId] = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    const params = {
      page,
      page_size: pageSize,
      search: search || undefined,
      risk_level: riskFilter || undefined,
      is_zero_day: zeroDayOnly ? true : undefined
    };

    getDetections(params)
      .then((res) => {
        setDetections(res.detections || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching detections:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, [page, riskFilter, zeroDayOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Search & Filter Header */}
      <div className="glass-card p-5 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">Detection History & Forensics</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Query stored detection logs from SQLite backend database.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search IP or Prediction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none w-56 font-mono"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none font-mono"
          >
            <option value="">All Risk Levels</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="High Risk">High Risk</option>
            <option value="Critical Risk">Critical Risk</option>
          </select>

          <label className="flex items-center space-x-1.5 text-xs font-mono text-purple-300 cursor-pointer bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg">
            <input
              type="checkbox"
              checked={zeroDayOnly}
              onChange={(e) => { setZeroDayOnly(e.target.checked); setPage(1); }}
              className="rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-800"
            />
            <span>Zero-Day Only</span>
          </label>

          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold font-mono"
          >
            Search
          </button>
        </form>
      </div>

      {/* Detections Data Table */}
      <div className="glass-card border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Destination IP</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Anomaly Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500 font-mono">
                    Loading detection logs...
                  </td>
                </tr>
              ) : detections.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500 font-mono">
                    No matching detection logs found.
                  </td>
                </tr>
              ) : (
                detections.map((det) => (
                  <tr key={det.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400">#{det.id}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(det.timestamp).toLocaleString()}
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
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          {det.prediction}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{det.attack_category}</td>
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

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total} records
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200 border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200 border border-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedDetectionId && (
        <DetectionModal
          detectionId={selectedDetectionId}
          onClose={() => setSelectedDetectionId(null)}
        />
      )}
    </div>
  );
};

export default DetectionResults;
