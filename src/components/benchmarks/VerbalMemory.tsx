"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveTestResult } from '@/actions/saveTest';

const WORD_BANK = [
  "Entropy", "Synergy", "Quantum", "Nexus", "Paradigm", "Linguistic", "Cognitive", "Neural", "Cyber", "Data",
  "Cloud", "API", "Schema", "Prisma", "NextJS", "React", "State", "Hook", "Effect", "Component",
  "Vivid", "Obscure", "Arcane", "Esoteric", "Ethereal", "Pristine", "Modular", "Dynamic", "Static", "Async",
  "Vector", "Matrix", "Logic", "Math", "Verbal", "Spatial", "Aptitude", "Mental", "Cortex", "Synapse"
];

const NOVEL_WORDS = [
  "Ephemeral", "Ineffable", "Quixotic", "Halcyon", "Luminous", "Melancholy", "Nebulous", "Obstinate", "Pensive", "Reverie",
  "Serendipity", "Transient", "Ubiquitous", "Voracious", "Wanderlust", "Zephyr", "Apex", "Catalyst", "Facet", "Genesis"
];

type GameState = 'start' | 'playing' | 'failed' | 'saving';

export default function VerbalMemory({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentWord, setCurrentWord] = useState("");
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  const generateWord = useCallback(() => {
    // 50% chance of a seen word if there are at least 3 seen words
    const shouldShowSeen = seenWords.size > 2 && Math.random() < 0.5;
    
    if (shouldShowSeen) {
       const seenArr = Array.from(seenWords);
       setCurrentWord(seenArr[Math.floor(Math.random() * seenArr.length)]);
    } else {
       const allCombined = [...WORD_BANK, ...NOVEL_WORDS];
       let newWord = allCombined[Math.floor(Math.random() * allCombined.length)];
       // Ensure it's not currently in seenWords for first display
       while (seenWords.has(newWord)) {
           newWord = allCombined[Math.floor(Math.random() * allCombined.length)];
       }
       setCurrentWord(newWord);
    }
  }, [seenWords]);

  const handleStart = () => {
    setScore(0);
    setLives(3);
    setSeenWords(new Set());
    setGameState('playing');
    generateWord();
  };

  const handleChoice = (isSeenChoice: boolean) => {
    if (gameState !== 'playing') return;

    const isActuallySeen = seenWords.has(currentWord);
    
    if (isSeenChoice === isActuallySeen) {
        // Correct
        setScore(prev => prev + 1);
        if (!isActuallySeen) {
            setSeenWords(prev => new Set(prev).add(currentWord));
        }
        generateWord();
    } else {
        // Wrong
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
            setGameState('failed');
            if (orgId) saveResults(score);
        } else {
            generateWord();
        }
    }
  };

  const saveResults = async (finalScore: number) => {
    setIsSaving(true);
    await saveTestResult('verbal-memory', finalScore, { words: finalScore }, orgId || "demo-org");
    setIsSaving(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">Verbal Memory</h2>
        <p className="text-slate-400">Keep track of which words have appeared before.</p>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative min-h-[400px] flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-xl">
        
        <AnimatePresence mode="wait">
          {gameState === 'start' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-white mb-2">Lexical Precision Benchmark</h3>
              <p className="text-slate-400 mb-8 max-w-xs">A measure of verbal encoding and long-term memory retrieval.</p>
              <button onClick={handleStart} className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-bold shadow-xl">Initiate Protocol</button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div key={currentWord} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center space-y-12">
              <h3 className="text-5xl font-black text-white tracking-widest">{currentWord}</h3>
              <div className="flex gap-4">
                <button onClick={() => handleChoice(true)} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-[0_10px_30px_rgba(79,70,229,0.2)]">SEEN</button>
                <button onClick={() => handleChoice(false)} className="px-12 py-5 bg-slate-800 hover:bg-slate-700 text-white border border-white/5 rounded-2xl font-bold transition-all">NEW</button>
              </div>
            </motion.div>
          )}

          {gameState === 'failed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl z-10">
              <h3 className="text-3xl font-black text-white mb-2">Recall Limit Reached</h3>
              <p className="text-red-200/60 mb-6 tracking-widest uppercase text-xs font-bold">Linguistic encoding failure after {score} units.</p>
              <div className="text-6xl font-black text-white mb-8 border-b-4 border-white/10 pb-4 w-full">{score}</div>
              <button onClick={handleStart} className="px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold shadow-xl transition-all">Recalibrate Memory</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD */}
        {gameState === 'playing' && (
          <div className="absolute top-4 w-full px-8 flex justify-between items-center text-sm font-bold uppercase tracking-widest text-slate-500">
             <div>Score: <span className="text-white text-xl ml-2">{score}</span></div>
             <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-800'}`} />
                ))}
             </div>
          </div>
        )}
      </div>

      <div className="max-w-2xl text-center space-y-4 opacity-40">
        <h4 className="text-sm font-bold uppercase tracking-tighter text-slate-500">Neuroscience of Verbal Memory</h4>
        <p className="text-xs leading-relaxed text-slate-400">
           Measures the effectiveness of the phonological loop and long-term encoding pathways.
           Highly correlated with linguistic performance, high-level negotiation skills, and information retention.
        </p>
      </div>
    </div>
  );
}
