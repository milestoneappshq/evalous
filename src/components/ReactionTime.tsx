"use client";

import { useState, useRef, useEffect } from 'react';
import { saveTestResult } from '@/actions/saveTest';

type GameState = 'waiting_to_start' | 'waiting_for_green' | 'click_now' | 'result' | 'too_soon' | 'finished';

export default function ReactionTime({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<GameState>('waiting_to_start');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Array to maintain average
  const [history, setHistory] = useState<number[]>([]);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_ATTEMPTS = 5;

  const startTest = () => {
    if (history.length >= MAX_ATTEMPTS) return;
    
    setGameState('waiting_for_green');
    setReactionTime(null);
    
    // Choose a random delay between 2 and 5 seconds
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('click_now');
      setStartTime(Date.now());
    }, randomDelay);
  };

  const finishTest = async (finalHistory: number[]) => {
    setGameState('finished');
    setIsSaving(true);
    
    const avgScore = Math.round(finalHistory.reduce((a, b) => a + b, 0) / finalHistory.length);
    
    // 1. Attempt Cloud Sync if orgId (and effectively session) is passed
    if (orgId) {
      await saveTestResult('reaction-time', avgScore, { attempts: finalHistory }, orgId);
    }
    
    // 2. Always store in Local History for the session/homepage view
    try {
      const existing = localStorage.getItem('evalous_local_scores');
      const parsed = existing ? JSON.parse(existing) : [];
      const newResult = {
        testId: 'reaction-time',
        testName: 'Reaction Speed',
        score: avgScore,
        date: new Date().toISOString()
      };
      localStorage.setItem('evalous_local_scores', JSON.stringify([newResult, ...parsed].slice(0, 10)));
    } catch (e) {
      console.warn("Could not save to local history", e);
    }
    
    setIsSaving(false);
  };

  const handleInteraction = () => {
    switch (gameState) {
      case 'waiting_to_start':
        startTest();
        break;
        
      case 'waiting_for_green':
        // User clicked too early
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setGameState('too_soon');
        break;
        
      case 'click_now':
        // Successful click
        const endTime = Date.now();
        const timeTaken = endTime - startTime;
        setReactionTime(timeTaken);
        
        const newHistory = [...history, timeTaken];
        setHistory(newHistory);
        
        if (newHistory.length >= MAX_ATTEMPTS) {
          finishTest(newHistory);
        } else {
          setGameState('result');
        }
        break;
        
      case 'result':
      case 'too_soon':
        startTest();
        break;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting_to_start': return 'bg-slate-800';
      case 'waiting_for_green': return 'bg-red-600';
      case 'click_now': return 'bg-emerald-500';
      case 'result': return 'bg-slate-800';
      case 'too_soon': return 'bg-slate-800';
      case 'finished': return 'bg-indigo-600';
      default: return 'bg-slate-800';
    }
  };

  const avgTime = history.length > 0 
    ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) 
    : null;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-700/50">
      
      {/* Interactive Testing Area */}
      <div 
        className={`flex-1 flex flex-col items-center justify-center p-8 cursor-pointer select-none transition-colors duration-200 min-h-[400px] text-center ${getBackgroundColor()}`}
        onPointerDown={gameState !== 'finished' ? handleInteraction : undefined}
      >
        {gameState === 'waiting_to_start' && (
          <div className="space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <h2 className="text-4xl font-bold text-white tracking-tight">Reaction Time Test</h2>
            <p className="text-xl text-slate-300">Click anywhere to start.</p>
          </div>
        )}

        {gameState === 'waiting_for_green' && (
          <div className="space-y-4 text-white">
            <h2 className="text-5xl font-bold tracking-tight">Wait for green...</h2>
          </div>
        )}

        {gameState === 'click_now' && (
          <div className="space-y-4 text-white">
            <h2 className="text-6xl font-extrabold tracking-tight">CLICK!</h2>
          </div>
        )}

        {gameState === 'too_soon' && (
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">Too soon!</h2>
            <p className="text-xl text-slate-300">Click to try again.</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="space-y-4">
            <h2 className="text-6xl font-bold text-white tracking-tight">{reactionTime} ms</h2>
            <p className="text-xl text-slate-300">Click to keep going.</p>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-white tracking-tight">Test Complete!</h2>
            <p className="text-2xl text-indigo-200">Average: {avgTime} ms</p>
            {isSaving ? (
              <p className="text-indigo-300 mt-4 animate-pulse">Saving results...</p>
            ) : (
              <p className="text-emerald-400 mt-4 font-medium">Scores saved successfully.</p>
            )}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-900 border-t border-slate-700/50 p-4 flex justify-between items-center px-8">
        <div className="text-slate-400 font-medium">
          Attempts: <span className="text-white ml-2">{history.length} / {MAX_ATTEMPTS}</span>
        </div>
        <div className="text-slate-400 font-medium">
           Average: <span className="text-emerald-400 ml-2 text-lg font-bold">{avgTime ? `${avgTime} ms` : '--'}</span>
        </div>
      </div>
    </div>
  );
}
