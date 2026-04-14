"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LocalResult = {
  testId: string;
  testName: string;
  score: number;
  date: string;
};

export default function LocalHistory() {
  const [history, setHistory] = useState<LocalResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load local history from localStorage
    const saved = localStorage.getItem('evalous_local_scores');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.slice(0, 5)); // Keep last 5
        setIsVisible(true);
      } catch (e) {
        console.error("Local history error", e);
      }
    }
  }, []);

  if (!isVisible || history.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-8 right-8 w-80 z-40 hidden lg:block"
    >
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Local Session Data</h3>
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {history.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{item.testName}</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">{new Date(item.date).toISOString().split('T')[0]}</div>
              </div>
              <div className="text-sm font-black text-emerald-400 font-mono">
                {item.score}ms
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5">
           <p className="text-[10px] text-slate-400 leading-relaxed font-medium mb-3">
             These scores are currently **volatile** (stored only in this browser).
           </p>
           <a href="/login" className="block w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/10">
             Cloud Sync Results
           </a>
        </div>
      </div>
    </motion.div>
  );
}

