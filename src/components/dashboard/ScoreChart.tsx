"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899'];

export function ScoreChart({ data }: { data: { name: string; average: number }[] }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return (
      <div className="h-[350px] w-full bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-32 bg-slate-800 rounded"></div>
          <div className="h-5 w-20 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900 text-slate-400 font-medium">
        (No scoring data available yet)
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">Average Scores</h3>
        <div className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded">By Test Type</div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
          />
          <Bar dataKey="average" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

