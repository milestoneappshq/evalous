"use client";

import { motion } from 'framer-motion';
import ReactionTime from '@/components/ReactionTime';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 lg:p-24 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-12">
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-400 to-emerald-400 tracking-tighter">
          Evalous
        </h1>
        <div className="flex gap-4">
          <a href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Candidate Login
          </a>
          <a href="/login" className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors shadow-lg shadow-emerald-500/20">
            Org Dashboard
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl space-y-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4"
          >
            Neural Efficiency Protocol v2.5
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            High-Integrity <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">Cognitive Profiling</span>
          </h2>
          <p className="text-xl text-slate-400 leading-relaxed font-medium">
             Evalous delivers institutional-grade psychometric assessments and cognitive benchmarks with zero latency and absolute precision. 
          </p>
        </div>

        {/* Categories Section */}
        <div className="space-y-12">
          
          {/* 1. Cognitive Benchmarks */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">
               01. Cognitive Benchmarks (Institutional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TestCard 
                title="Reaction Time" 
                desc="Instantaneous response time to visual stimuli."
                icon="⚡"
                href="/test/reaction-time"
              />
              <TestCard 
                title="Sequence Memory" 
                desc="Temporal-spatial working memory capacity."
                icon="🔢"
                href="/test/sequence-memory"
              />
              <TestCard 
                title="Aim Trainer" 
                desc="Saccadic eye movement and precision unit."
                icon="🎯"
                href="/test/aim-trainer"
              />
              <TestCard 
                title="Chimp Test" 
                desc="High-fidelity visual persistence benchmark."
                icon="🍌"
                href="/test/chimp-test"
              />
              <TestCard 
                title="Visual Memory" 
                desc="3D spatial encoding and pattern recall."
                icon="👁️"
                href="/test/visual-memory"
              />
              <TestCard 
                title="Typing" 
                desc="Linguistic throughput and motor dexterity."
                icon="⌨️"
                href="/test/typing-test"
              />
              <TestCard 
                title="Verbal Memory" 
                desc="Lexical encoding and phonological loop."
                icon="📚"
                href="/test/verbal-memory"
              />
              <TestCard 
                title="Number Memory" 
                desc="Numeric digit span and executive focus."
                icon="📱"
                href="/test/number-memory"
              />
            </div>
          </div>

          {/* 2. Professional Psychometrics */}
          <div className="space-y-6">
             <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">
                02. Psychometric Series (Evaluation Grade)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TestCard 
                  title="GCAT (Basic)" 
                  desc="Foundational logic, spatial, and math suite."
                  icon="🛡️"
                  href="/gcat"
                  isPremium
                />
                <TestCard 
                  title="Mensa-Level IQ" 
                  desc="High-range non-verbal matrix reasoning."
                  icon="🧠"
                  href="/test/mensa-iq"
                  isPremium
                />
                <TestCard 
                  title="EQ Assessment" 
                  desc="Scenario-based social intelligence profiling."
                  icon="❤️"
                  href="/test/eq-assessment"
                  isPremium
                />
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function TestCard({ title, desc, icon, href, isPremium = false }: { title: string, desc: string, icon: string, href: string, isPremium?: boolean }) {
  return (
    <motion.a 
      href={href}
      whileHover={{ y: -5, borderColor: isPremium ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.2)' }}
      className={`group p-6 rounded-2xl border bg-slate-900/50 backdrop-blur-sm transition-all duration-300 ${isPremium ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-white/5'}`}
    >
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h4 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
        {title}
        {isPremium && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">PRO</span>}
      </h4>
      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{desc}</p>
    </motion.a>
  );
}
