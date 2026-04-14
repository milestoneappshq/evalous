"use client";

import { useState } from "react";
import { LucideIcon, ShieldAlert, ShieldCheck, X, Clock, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StatCard({ label, value, icon: Icon, colorClass, trend }: { 
  label: string; 
  value: string | number; 
  icon: LucideIcon; 
  colorClass: string; 
  trend?: string; 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-slate-900 border border-slate-800 p-6 rounded-xl border-l-4 ${colorClass} hover:border-slate-700 transition-all duration-300 group shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-400 text-sm font-medium tracking-wide uppercase">{label}</h3>
        <Icon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-black text-white">{value}</p>
        {trend && <span className="text-xs font-bold text-emerald-400">+{trend}%</span>}
      </div>
    </motion.div>
  );
}

export function ResultsTable({ results }: { results: any[] }) {
  const [selectedFlags, setSelectedFlags] = useState<any[] | null>(null);
  const [candidateName, setCandidateName] = useState("");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">Real-time Stream</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950/50 text-slate-300 font-semibold">
            <tr>
              <th className="p-4 border-b border-slate-800">Candidate</th>
              <th className="p-4 border-b border-slate-800">Test</th>
              <th className="p-4 border-b border-slate-800 text-center">Score</th>
              <th className="p-4 border-b border-slate-800">Integrity</th>
              <th className="p-4 border-b border-slate-800">Status</th>
              <th className="p-4 border-b border-slate-800">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {results.map((result, idx) => {
              const flags = (result.proctoringFlags as any[]) || [];
              const hasFlags = flags.length > 0;
              
              return (
              <motion.tr 
                key={result.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-slate-800/30 transition-colors group"
              >
                <td className="p-4">
                   <div className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">{result.user.name}</div>
                   <div className="text-xs text-slate-600">{result.user.email}</div>
                </td>
                <td className="p-4 text-slate-300">{result.test.name}</td>
                <td className="p-4 text-center font-mono font-bold text-emerald-400 text-lg">
                  {result.score !== null ? Math.round(result.score) : "--"}
                </td>
                <td className="p-4">
                  {hasFlags ? (
                    <button 
                      onClick={() => {
                        setSelectedFlags(flags);
                        setCandidateName(result.user.name);
                      }}
                      className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {flags.length} Flag{flags.length > 1 ? 's' : ''}
                    </button>
                  ) : (
                    <span className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    result.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {result.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-slate-400 font-mono">
                  {new Date(result.createdAt).toISOString().split('T')[0]}
                </td>
              </motion.tr>
            )})}
            {results.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-600 italic">No candidates have completed any assessments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Flag Details Modal */}
      <AnimatePresence>
        {selectedFlags && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFlags(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div>
                   <h3 className="text-xl font-bold text-white">Security Evidence: {candidateName}</h3>
                   <p className="text-sm text-slate-400">AI-captured snapshots during violations</p>
                </div>
                <button 
                  onClick={() => setSelectedFlags(null)}
                  className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                >
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {selectedFlags.map((flag, index) => (
                   <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start border-b border-slate-800/50 pb-8 last:border-0 last:pb-0">
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 text-red-400">
                           <ShieldAlert className="w-5 h-5" />
                           <span className="font-bold uppercase tracking-widest text-xs">AI Violation #{index + 1}</span>
                         </div>
                         <h4 className="text-2xl font-black text-white leading-tight">{flag.reason}</h4>
                         <div className="flex items-center gap-2 text-slate-400 text-sm font-mono">
                            <Clock className="w-4 h-4" />
                            {new Date(flag.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                         </div>
                         <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                            <p className="text-sm text-slate-400 italic font-medium leading-relaxed">
                               "This event was automatically flagged by the client-side TensorFlow.js analysis engine. No video was streamed to the server; only this evidence snapshot was persisted."
                            </p>
                         </div>
                      </div>
                      
                      <div className="relative group">
                         {flag.base64Snapshot ? (
                            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
                               <img 
                                 src={flag.base64Snapshot} 
                                 alt="Violation Snapshot" 
                                 className="w-full h-auto aspect-video object-cover"
                                 onError={(e) => {
                                   (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800'; // Fallback
                                 }}
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-bottom p-4">
                                  <span className="text-[10px] text-white/50 uppercase font-mono mt-auto">Hardware ID Snapshot: SEC-CONF-AI</span>
                               </div>
                            </div>
                         ) : (
                            <div className="aspect-video bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 gap-2">
                               <EyeOff className="w-8 h-8 opacity-20" />
                               <span className="text-xs uppercase font-bold tracking-widest opacity-30">No Image Evidence Available</span>
                            </div>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="p-6 border-t border-slate-800 bg-slate-950/30 flex justify-end">
                 <button 
                   onClick={() => setSelectedFlags(null)}
                   className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                 >
                   Close View
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


