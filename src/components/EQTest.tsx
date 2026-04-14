"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTestResult } from '@/actions/saveTest';

type EQQuestion = {
  id: number;
  scenario: string;
  options: { text: string; value: number }[];
};

const EQ_QUESTIONS: EQQuestion[] = [
  {
    id: 1,
    scenario: "A colleague is visibly upset after a meeting where their idea was rejected. How do you respond?",
    options: [
      { text: "Ignore them to give them space to process their emotions.", value: 1 },
      { text: "Tell them to 'look on the bright side' and offer a distraction.", value: 2 },
      { text: "Acknowledge their frustration and offer to listen if they want to talk.", value: 4 },
      { text: "Explain why the rejection was logical to help them understand.", value: 2 }
    ]
  },
  {
    id: 2,
    scenario: "You are leading a project and a major deadline is missed due to a teammate's mistake. Your first action is:",
    options: [
      { text: "Privately discuss the error with the teammate to understand the cause and find a solution.", value: 4 },
      { text: "Call a team meeting to address the mistake and prevent it from happening again.", value: 3 },
      { text: "Report the error to your supervisor immediately to maintain transparency.", value: 2 },
      { text: "Take responsibility for the missed deadline yourself to protect the teammate.", value: 3 }
    ]
  },
  {
      id: 3,
      scenario: "In a heated debate with a friend, they say something that deeply offends you. You:",
      options: [
        { text: "Retort with an equally sharp comment to defend your position.", value: 1 },
        { text: "Take a deep breath, acknowledge your hurt, and explain why the comment was offensive.", value: 4 },
        { text: "Walk away immediately to avoid escalating the conflict further.", value: 2 },
        { text: "Pretend it didn't bother you and continue the conversation as usual.", value: 2 }
      ]
  }
];

type GameState = 'intro' | 'playing' | 'finished' | 'saving';

export default function EQTest({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleChoice = (val: number) => {
    const nextScore = totalScore + val;
    setTotalScore(nextScore);
    
    if (currentIdx < EQ_QUESTIONS.length - 1) {
        setCurrentIdx(currentIdx + 1);
    } else {
        finishTest(nextScore);
    }
  };

  const finishTest = async (finalScore: number) => {
    setGameState('finished');
    const normalized = Math.min(100, Math.round((finalScore / (EQ_QUESTIONS.length * 4)) * 100));
    
    if (orgId) {
      setIsSaving(true);
      await saveTestResult('eq-test', normalized, { raw: finalScore }, orgId || "demo-org");
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Professional Emotional Quotient (EQ) Test</h2>
        <p className="text-slate-400">Scenario-based assessment of social intelligence and self-regulation.</p>
      </div>

      <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative min-h-[500px] flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <div className="text-6xl mb-6">❤️</div>
              <h3 className="text-3xl font-black text-white mb-2">Interpersonal Maturity Profile</h3>
              <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
                 Emotional Intelligence is the capability of individuals to recognize their own emotions and those of others, 
                 discourse between different feelings, and use emotional information to guide thinking and behavior.
              </p>
              <button onClick={() => setGameState('playing')} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-xl transition-all">Begin Profiling</button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div key={currentIdx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full h-full flex flex-col items-center max-w-3xl">
               
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-12">
                  Social Scenario {currentIdx + 1} of {EQ_QUESTIONS.length}
               </div>

               <p className="text-2xl md:text-3xl font-bold text-white text-center leading-snug mb-16 px-4">
                  "{EQ_QUESTIONS[currentIdx].scenario}"
               </p>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {EQ_QUESTIONS[currentIdx].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleChoice(opt.value)}
                      className="p-6 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] rounded-2xl transition-all text-slate-300 font-medium text-left leading-relaxed flex items-center gap-4 group"
                    >
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs text-slate-400 group-hover:border-emerald-500 group-hover:text-emerald-400 font-black">
                         {String.fromCharCode(65 + i)}
                      </div>
                      {opt.text}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
               <h3 className="text-3xl font-black text-white mb-2">Social IQ Benchmark Met</h3>
               <p className="text-emerald-200/60 mb-6 tracking-widest uppercase text-xs font-bold">Resilience & Empathy Quotient</p>
               <div className="text-8xl font-black text-white mb-8">
                  {Math.min(100, Math.round((totalScore / (EQ_QUESTIONS.length * 4)) * 100))}<span className="text-3xl opacity-40 font-normal">%</span>
               </div>
               <p className="text-emerald-100 text-sm font-medium mb-12 max-w-md italic opacity-60">
                 "Emotional intelligence is a way of recognizing, understanding, and choosing how we think, feel, and act."
               </p>
               <button onClick={() => { setGameState('intro'); setCurrentIdx(0); setTotalScore(0); }} className="px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold shadow-xl transition-all">Recalibrate EQ</button>
               {isSaving && <p className="mt-4 text-white/50 animate-pulse text-xs">Storing empathy metrics in Evalous Cloud...</p>}
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-2xl text-center space-y-4 opacity-40">
        <h4 className="text-sm font-bold uppercase tracking-tighter text-slate-400">Methodology: EQ Profiling</h4>
        <p className="text-xs leading-relaxed text-slate-400">
           The Evalous EQ assessment is grounded in the Goleman framework of emotional intelligence, prioritizing five key skills: self-awareness, self-regulation, motivation, empathy, and social skills.
        </p>
      </div>
    </div>
  );
}

