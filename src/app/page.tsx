"use client";

import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import LocalHistory from '@/components/LocalHistory';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 lg:p-24 flex flex-col items-center">
      <LocalHistory />
      
      {/* Search Engine Brand Marker */}
      <h1 className="sr-only">Evalous | Professional Cognitive & Skill Assessment</h1>
      
      {/* Header */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-24">
        <Logo />
        <div className="flex gap-4 md:gap-8">
          <a href="/login" className="px-4 py-2 text-xs md:text-sm font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
            Identity Portal
          </a>
          <a href="/login" className="px-6 py-2.5 text-xs md:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest">
            Dashboard
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl space-y-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            Institutional Benchmark Series v2.5
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
            High-Integrity <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400">Cognitive Profiling</span>
          </h2>
          <p className="text-lg md:text-2xl text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto">
             Evalous delivers military-grade psychometric assessments and neural benchmarks with microsecond precision. 
          </p>
        </div>

        {/* Categories Section */}
        <div className="space-y-16">
          
          {/* 1. Cognitive Benchmarks */}
          <div className="space-y-8">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-white/5 pb-6">
               01. Cognitive Benchmarks (Institutional)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <TestCard 
                title="Reaction Time" 
                desc="Motor response latency to visual trigger."
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
          <div className="space-y-8">
             <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-white/5 pb-6">
                02. Psychometric Series (Evaluation Grade)
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TestCard 
                  title="GCAT (Basic)" 
                  desc="Matrix logic, spatial, and numeric suite."
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
      className={`group p-8 rounded-3xl border bg-slate-900/40 backdrop-blur-sm transition-all duration-300 ${isPremium ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-white/5'}`}
    >
      <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
        {title}
        {isPremium && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">PRO</span>}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">{desc}</p>
    </motion.a>
  );
}
