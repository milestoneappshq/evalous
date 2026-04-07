"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTestResult } from '@/actions/saveTest';

type GameState = 'start' | 'showing' | 'input' | 'failed' | 'success' | 'saving';

export default function NumberMemory({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('start');
  const [number, setNumber] = useState("");
  const [userInput, setUserInput] = useState("");
  const [level, setLevel] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateNumber = (l: number) => {
    let num = "";
    for (let i = 0; i < l; i++) {
        num += Math.floor(Math.random() * 10).toString();
    }
    setNumber(num);
    setUserInput("");
    setGameState('showing');
    
    // Duration increases with level (minimum 2s)
    const duration = Math.max(2000, l * 1000);
    setTimeout(() => {
        setGameState('input');
        setTimeout(() => inputRef.current?.focus(), 100);
    }, duration);
  };

  const handleStart = () => {
    setLevel(1);
    generateNumber(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState !== 'input') return;

    if (userInput === number) {
        setGameState('success');
        setLevel(prev => prev + 1);
        setTimeout(() => generateNumber(level + 1), 1000);
    } else {
        setGameState('failed');
        if (orgId) saveResults(level);
    }
  };

  const saveResults = async (finalScore: number) => {
    setIsSaving(true);
    await saveTestResult('number-memory', finalScore, { digits: finalScore }, orgId || "demo-org");
    setIsSaving(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Number Memory</h2>
        <p className="text-slate-400">Remember an increasingly long number sequence.</p>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative min-h-[400px] flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-xl">
        
        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <div className="text-6xl mb-6">🔢</div>
              <h3 className="text-2xl font-bold text-white mb-2">Numeric Precision Benchmark</h3>
              <p className="text-slate-400 mb-8 max-w-xs">A measure of digit span and working memory capacity.</p>
              <button onClick={handleStart} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl">Begin Assessment</button>
            </motion.div>
          )}

          {gameState === 'showing' && (
            <motion.div key={number} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-5xl md:text-7xl font-black text-white tracking-[0.5em]">
               {number}
            </motion.div>
          )}

          {gameState === 'input' && (
            <motion.form key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="flex flex-col items-center space-y-8">
               <input
                 ref={inputRef}
                 type="text"
                 value={userInput}
                 onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                 className="w-full bg-slate-800/40 border-b-4 border-indigo-500 py-4 text-center text-4xl md:text-6xl font-black text-white focus:outline-none focus:border-white transition-all tracking-[0.3em]"
                 placeholder="..."
               />
               <button type="submit" className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-bold shadow-xl">SUBMIT</button>
            </motion.form>
          )}

          {gameState === 'failed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <h3 className="text-3xl font-black text-white mb-2">Memory Capacity Hit</h3>
              <div className="flex gap-12 mt-8 mb-12 border-y border-white/5 py-8 w-full justify-center">
                 <div className="text-center">
                    <div className="text-xs font-bold text-indigo-300 tracking-widest uppercase mb-2">Sequence</div>
                    <div className="text-2xl font-bold text-slate-400">{number}</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs font-bold text-indigo-300 tracking-widest uppercase mb-2">Your Input</div>
                    <div className="text-2xl font-bold text-white">{userInput}</div>
                 </div>
              </div>
              <p className="text-red-200/60 mb-6 tracking-widest uppercase text-xs font-bold">Max digits encoded: {level-1}</p>
              <button onClick={handleStart} className="px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold shadow-xl transition-all">Retry Calibration</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-2xl text-center space-y-4 opacity-40">
        <h4 className="text-sm font-bold uppercase tracking-tighter text-slate-500">Neuroscience Profile</h4>
        <p className="text-xs leading-relaxed text-slate-400">
           The Number Memory test evaluates the capacity of the central executive and the phonological loop. 
           In high-speed trading and technical troubleshooting, a high digit span allows for superior data correlation and error detection.
        </p>
      </div>
    </div>
  );
}
