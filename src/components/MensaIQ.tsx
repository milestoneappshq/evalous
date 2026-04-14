"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTestResult } from '@/actions/saveTest';

type Question = {
  id: number;
  matrixRule: string;
  options: string[];
  correctAnswer: number;
};

const IQ_QUESTIONS: Question[] = [
  {
    id: 1,
    matrixRule: "Simple Rotation: Square rotates 90 degrees clockwise.",
    options: ["Option A", "Option B", "Option C", "Option D", "Option E", "Option F"],
    correctAnswer: 2
  },
  {
    id: 2,
    matrixRule: "Binary Addition: Column 1 + Column 2 = Column 3.",
    options: ["Option A", "Option B", "Option C", "Option D", "Option E", "Option F"],
    correctAnswer: 4
  },
  {
    id: 3,
    matrixRule: "Color Progression: Shading moves from top-left to bottom-right.",
    options: ["Option A", "Option B", "Option C", "Option D", "Option E", "Option F"],
    correctAnswer: 1
  }
];

type GameState = 'intro' | 'playing' | 'finished' | 'saving';

export default function MensaIQ({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);
    
    if (currentIdx < IQ_QUESTIONS.length - 1) {
        setCurrentIdx(currentIdx + 1);
    } else {
        finishTest(newAnswers);
    }
  };

  const finishTest = async (finalAnswers: number[]) => {
    setGameState('finished');
    let correctCount = 0;
    finalAnswers.forEach((ans, i) => {
        if (ans === IQ_QUESTIONS[i].correctAnswer) correctCount++;
    });
    
    const iqScore = Math.min(160, 100 + (correctCount * 15)); // Mock scoring logic
    
    if (orgId) {
      setIsSaving(true);
      await saveTestResult('mensa-iq', iqScore, { answers: finalAnswers }, orgId || "demo-org");
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Mensa-Level IQ Assessment</h2>
        <p className="text-slate-400">Advanced Matrix Reasoning Protocol for Fluid Intelligence.</p>
      </div>

      <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative min-h-[600px] flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <div className="text-6xl mb-6">📉</div>
              <h3 className="text-3xl font-black text-white mb-2">High-Range Intelligence Testing</h3>
              <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
                 Matrix reasoning evaluations are non-verbal tests of fluid intelligence. 
                 Identify the logical rule governing each 3x3 pattern to find the missing piece.
              </p>
              <button onClick={() => setGameState('playing')} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl">Inaugurate Assessment</button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full h-full flex flex-col items-center">
               
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                  Matrix Problem {currentIdx + 1} of {IQ_QUESTIONS.length}
               </div>

               {/* Matrix Display (Mock for now, would typically use images) */}
               <div className="grid grid-cols-3 gap-2 bg-slate-800 p-4 rounded-xl mb-12 shadow-inner border border-white/5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-24 h-24 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 border border-white/5">
                       Rule {i+1}
                    </div>
                  ))}
                  <div className="w-24 h-24 border-2 border-dashed border-indigo-500 rounded-lg flex items-center justify-center text-indigo-400 font-bold text-2xl animate-pulse">
                     ?
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                  {IQ_QUESTIONS[currentIdx].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className="p-6 bg-slate-800/40 hover:bg-slate-700 border border-white/5 hover:border-indigo-500/50 rounded-xl transition-all text-slate-300 font-medium text-center"
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-indigo-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
               <h3 className="text-3xl font-black text-white mb-2">Archetype Identified</h3>
               <p className="text-indigo-200/60 mb-6 tracking-widest uppercase text-xs font-bold">Standardized Gaussian Score</p>
               <div className="text-8xl font-black text-white mb-4">
                  {Math.min(160, 100 + (answers.filter((ans, i) => ans === IQ_QUESTIONS[i].correctAnswer).length * 15))}
               </div>
               <p className="text-indigo-300 text-sm font-medium mb-12 italic opacity-60">
                 "Intelligence is the ability to adapt to change." — Stephen Hawking
               </p>
               <button onClick={() => { setGameState('intro'); setCurrentIdx(0); setAnswers([]); }} className="px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold shadow-xl transition-all">Recalibrate Quotient</button>
               {isSaving && <p className="mt-4 text-white/50 animate-pulse text-xs">Storing neural pattern in Evalous Index...</p>}
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-2xl text-center space-y-4 opacity-40">
        <h4 className="text-sm font-bold uppercase tracking-tighter text-slate-400">Methodology: Matrix Reasoning</h4>
        <p className="text-xs leading-relaxed text-slate-400">
           Evalous IQ tests are modeled after Raven's Progressive Matrices. These assessments measure fluid intelligence (Gf), 
           which is the capacity to think logically and solve problems in novel situations, independent of acquired knowledge.
        </p>
      </div>
    </div>
  );
}

