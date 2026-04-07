"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTestResult } from '@/actions/saveTest';

type GameState = 'start' | 'playing' | 'failed' | 'finished' | 'saving';

export default function AimTrainer({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('start');
  const [targetsHit, setTargetsHit] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [history, setHistory] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const totalTargets = 30;

  const generateTarget = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const x = Math.random() * (width - 60) + 30;
      const y = Math.random() * (height - 60) + 30;
      setTargetPos({ x: (x / width) * 100, y: (y / height) * 100 });
      setStartTime(Date.now());
    }
  };

  const handleStart = () => {
    setTargetsHit(0);
    setHistory([]);
    setGameState('playing');
    generateTarget();
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gameState !== 'playing') return;

    const hitTime = Date.now();
    const rt = hitTime - startTime;
    setHistory(prev => [...prev, rt]);
    
    const nextCount = targetsHit + 1;
    if (nextCount >= totalTargets) {
      const avg = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
      finishTest(avg);
    } else {
      setTargetsHit(nextCount);
      generateTarget();
    }
  };

  const finishTest = async (avg: number) => {
    setGameState('finished');
    if (orgId) {
      setIsSaving(true);
      await saveTestResult('aim-trainer', avg, { targets: totalTargets }, orgId || "demo-org");
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Aim Trainer</h2>
        <p className="text-slate-400">Click {totalTargets} targets as fast as you can.</p>
      </div>

      <div 
        ref={containerRef}
        className="w-full h-[500px] bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden cursor-crosshair shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 16-4-4"/><path d="m12 12-4 4"/><path d="m16 8-4 4"/><path d="m12 12-4-4"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Test Your Precision</h3>
              <p className="text-slate-400 mb-8 max-w-xs">Minimize latency between visual target appearance and motor response.</p>
              <button onClick={handleStart} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-xl transition-all">
                Initiate Sequence
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.button
              key={`${targetsHit}-${targetPos.x}-${targetPos.y}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              onClick={handleTargetClick}
              style={{ top: `${targetPos.y}%`, left: `${targetPos.x}%` }}
              className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-white/20 flex items-center justify-center"
            >
               <div className="w-2 h-2 bg-white rounded-full" />
            </motion.button>
          )}

          {gameState === 'finished' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-indigo-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10"
            >
              <h3 className="text-3xl font-black text-white mb-2">Assessment Optimized</h3>
              <p className="text-indigo-200/60 mb-6 tracking-widest uppercase text-xs font-bold">Average Latency per Target</p>
              <div className="text-6xl font-black text-white mb-8 border-b-4 border-white/10 pb-4 w-full">
                {Math.round(history.reduce((a,b)=>a+b,0)/history.length)} <span className="text-2xl font-normal text-indigo-300">ms</span>
              </div>
              <button onClick={handleStart} className="px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold shadow-xl transition-all">
                Recalibrate
              </button>
              {isSaving && <p className="mt-4 text-white/50 animate-pulse text-xs">Storing data in Evalous Cloud...</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Overlay */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
            Targets <span className="text-white ml-2 text-xl font-black">{targetsHit} / {totalTargets}</span>
          </div>
        )}
      </div>

      <div className="max-w-2xl text-center space-y-4 opacity-40">
        <h4 className="text-sm font-bold uppercase tracking-tighter text-slate-500">About the Aim Trainer</h4>
        <p className="text-xs leading-relaxed text-slate-400">
           Measures saccadic eye movement and motor unit recruitment speed. Used extensively in clinical contexts
           to detect minor motor impairments and as a benchmark for high-performance cognitive states.
        </p>
      </div>
    </div>
  );
}
