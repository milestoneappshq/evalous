"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTestResult } from '@/actions/saveTest';

const PRO_TEXTS = [
  "Quantum entanglement is a physical phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle cannot be described independently of the state of the others, even when the particles are separated by a large distance. The topic of quantum entanglement is at the heart of the disparity between classical and quantum physics.",
  "Efficiency is the peak of professional performance. By optimizing the neural pathways responsible for linguistic processing and motor unit recruitment, individuals can significantly increase their throughput while maintaining a high level of accuracy. This cognitive dexterity is a hallmark of success in high-pressure technical environments where milliseconds matter in the pursuit of excellence.",
  "The pursuit of knowledge is a lifelong journey. In the digital age, the ability to process vast amounts of information quickly and accurately is more critical than ever before. Those who master the art of rapid data ingestion and synthesis will find themselves at the forefront of the next global technological revolution, leading the way for future generations to follow."
];

type GameState = 'start' | 'playing' | 'finished' | 'saving';

export default function TypingTest({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('start');
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number>(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleStart = () => {
    const randomText = PRO_TEXTS[Math.floor(Math.random() * PRO_TEXTS.length)];
    setText(randomText);
    setUserInput("");
    setWpm(0);
    setAccuracy(100);
    setGameState('playing');
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const calculateStats = (input: string) => {
    const timeInMinutes = (Date.now() - startTime) / 60000;
    const words = input.length / 5;
    const currentWpm = Math.round(words / timeInMinutes);
    
    let errors = 0;
    for (let i = 0; i < input.length; i++) {
        if (input[i] !== text[i]) errors++;
    }
    const currentAccuracy = Math.round(((input.length - errors) / input.length) * 100) || 100;
    
    setWpm(currentWpm);
    setAccuracy(currentAccuracy);
    
    if (input.length === text.length) {
        finishTest(currentWpm, currentAccuracy);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (gameState !== 'playing') return;
    const val = e.target.value;
    setUserInput(val);
    calculateStats(val);
  };

  const finishTest = async (finalWpm: number, finalAccuracy: number) => {
    setGameState('finished');
    if (orgId) {
      setIsSaving(true);
      await saveTestResult('typing-test', finalWpm, { accuracy: finalAccuracy }, orgId || "demo-org");
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Typing Assessment</h2>
        <p className="text-slate-400">Measure your linguistic throughput and neurological coordination.</p>
      </div>

      <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <div className="text-6xl mb-6">⌨️</div>
              <h3 className="text-2xl font-bold text-white mb-2">Linguistic Speed Benchmark</h3>
              <p className="text-slate-400 mb-8 max-w-xs">Type the text accurately and quickly to optimize your WPM score.</p>
              <button onClick={handleStart} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-xl transition-all">Begin Assessment</button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="text-xl text-slate-400 leading-relaxed font-mono relative">
                {text.split('').map((char, i) => {
                   let color = "text-slate-600";
                   if (i < userInput.length) {
                       color = userInput[i] === char ? "text-emerald-400" : "text-red-500 bg-red-500/10";
                   }
                   return <span key={i} className={color}>{char}</span>;
                })}
              </div>

              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                className="w-full h-32 bg-slate-800/40 border border-white/5 rounded-2xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                placeholder="Begin typing here..."
                spellCheck="false"
              />

              <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-slate-500">
                <div>WPM: <span className="text-white text-xl">{wpm}</span></div>
                <div>Accuracy: <span className="text-white text-xl">{accuracy}%</span></div>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-indigo-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <h3 className="text-3xl font-black text-white mb-2">Throughput Finalized</h3>
              <div className="flex gap-12 mt-8 mb-12 border-y border-white/5 py-8 w-full justify-center">
                <div className="text-center">
                   <div className="text-5xl font-black text-white">{wpm}</div>
                   <div className="text-xs font-bold text-indigo-300 tracking-widest mt-2 uppercase">WPM</div>
                </div>
                <div className="text-center">
                   <div className="text-5xl font-black text-white">{accuracy}%</div>
                   <div className="text-xs font-bold text-indigo-300 tracking-widest mt-2 uppercase">Accuracy</div>
                </div>
              </div>
              <button onClick={handleStart} className="px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold shadow-xl transition-all">Retry Calibration</button>
              {isSaving && <p className="mt-4 text-white/50 animate-pulse text-xs">Synchronizing with Evalous Dashboard...</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-2xl text-center space-y-4 opacity-40">
        <h4 className="text-sm font-bold uppercase tracking-tighter text-slate-500">Benchmark Details</h4>
        <p className="text-xs leading-relaxed text-slate-400">
           The Typing Test is a core metric for clerical, technical, and administrative competencies.
           It measures the neurological efficiency of the motor cortex combined with linguistic pattern recognition.
        </p>
      </div>
    </div>
  );
}
