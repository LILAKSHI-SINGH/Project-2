import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

const FeatureImportanceChart = ({ features = [] }) => {
  if (!features || features.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 font-mono text-xs">
        No feature contribution data available.
      </div>
    );
  }

  // Pick top 8 features by absolute SHAP contribution
  const chartData = features
    .slice(0, 8)
    .map((f) => ({
      name: f.label || f.feature_name,
      contribution: parseFloat(f.contribution || 0),
      featureValue: f.feature_value,
      impact: f.impact_description
    }))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return (
    <div className="w-full">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              width={95}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isPos = data.contribution > 0;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs max-w-xs">
                      <p className="font-bold text-slate-200">{data.name}</p>
                      <p className="text-slate-400 font-mono mt-1">Value: {data.featureValue?.toLocaleString()}</p>
                      <p className={`font-mono font-semibold mt-1 ${isPos ? 'text-rose-400' : 'text-emerald-400'}`}>
                        SHAP Contribution: {data.contribution > 0 ? '+' : ''}{data.contribution.toFixed(4)}
                      </p>
                      <p className="text-slate-300 text-[11px] mt-2 border-t border-slate-800 pt-1">
                        {isPos ? 'Pushes prediction toward Threat/Anomaly' : 'Pushes prediction toward Normal Baseline'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
            <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.contribution > 0 ? '#ef4444' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center space-x-6 text-xs text-slate-400 mt-2 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
          <span>Normal Indicator (Negative SHAP)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-rose-500 rounded-sm"></span>
          <span>Malicious / Anomaly Risk (Positive SHAP)</span>
        </div>
      </div>
    </div>
  );
};

export default FeatureImportanceChart;
