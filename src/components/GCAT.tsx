"use client";

import { useState, useEffect, useRef } from 'react';
import { saveTestResult } from '@/actions/saveTest';
import { useTabTracking } from '@/hooks/useTabTracking';
import { ProctorCamera } from './proctoring/ProctorCamera';
import { motion, AnimatePresence } from 'framer-motion';

type Question = {
  id: string;
  category: 'Math' | 'Verbal' | 'Spatial';
  text: string;
  options: string[];
  correctAnswer: number;
};

const questionBank: Question[] = [
  { id: '1', category: 'Math', text: 'If a machine produces 150 widgets in 3 hours, how many widgets can it produce in 8 hours?', options: ['300', '400', '450', '500'], correctAnswer: 1 },
  { id: '2', category: 'Verbal', text: 'Choose the word that is most nearly OPPOSITE in meaning to: OBSCURE', options: ['Hidden', 'Clear', 'Tense', 'Complex'], correctAnswer: 1 },
  { id: '3', category: 'Math', text: 'What is 30% of 250?', options: ['50', '65', '75', '85'], correctAnswer: 2 },
  { id: '4', category: 'Verbal', text: 'Select the pair that best expresses a relationship similar to: DOCTOR : HOSPITAL', options: ['Teacher : School', 'Chef : Waiter', 'Farmer : Market', 'Lawyer : Judge'], correctAnswer: 0 },
  { id: '5', category: 'Spatial', text: 'Which of the following does not belong?', options: ['Triangle', 'Square', 'Circle', 'Pentagon'], correctAnswer: 2 },
];

export default function GCAT({ orgId }: { orgId?: string }) {
  const [gameState, setGameState] = useState<'intro' | 'active' | 'completed'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSubmitMessage, setAutoSubmitMessage] = useState<string | null>(null);

  // --- PROCTORING ENGINE ---
  const { warnings: tabWarnings, isViolated: tabViolated } = useTabTracking(3);
  const [proctoringFlags, setProctoringFlags] = useState<{ reason: string; base64Snapshot: string; timestamp: Date }[]>([]);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (tabViolated && gameState === 'active' && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      const reason = "Auto-submitted due to focus violation limit (3 strikes).";
      setAutoSubmitMessage(reason);
      submitTest(reason);
    }
  }, [tabViolated, gameState]);

  const handleCameraFlag = (reason: string, base64Snapshot: string) => {
    setProctoringFlags(prev => [...prev, { reason, base64Snapshot, timestamp: new Date() }]);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'active') {
      submitTest();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleStart = () => setGameState('active');

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionBank[currentQuestionIndex].id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionBank.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questionBank.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const submitTest = async (autoSubmitReason?: string) => {
    setGameState('completed');
    setIsSaving(true);
    const rawScore = calculateScore();
    
    const allFlags = [...proctoringFlags];
    tabWarnings.forEach(w => {
      allFlags.push({ reason: `Tab Focus Lost: ${w.reason}`, base64Snapshot: "", timestamp: w.timestamp });
    });
    
    if (autoSubmitReason) {
       allFlags.push({ reason: autoSubmitReason, base64Snapshot: "", timestamp: new Date() });
    }
    
    const metadata = {
      timeTakenSeconds: (15 * 60) - timeLeft,
      answers: answers
    };
    await saveTestResult('gcat', rawScore, metadata, orgId || "demo-org", allFlags);
    setIsSaving(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <AnimatePresence>
        {gameState === 'active' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProctorCamera isActive={true} onFlag={handleCameraFlag} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tabWarnings.length > 0 && gameState === 'active' && (
           <motion.div 
             initial={{ y: -50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: -50, opacity: 0 }}
             className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3"
           >
             Warning: {tabWarnings.length}/3 Focus Violations. Test will auto-submit.
           </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl mx-auto min-h-[500px] flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden glass-card">
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center text-slate-200">
          <h2 className="font-bold text-lg">General Cognitive Aptitude Test</h2>
          {gameState === 'active' && (
            <div className="flex items-center space-x-2">
              <span className={`font-mono text-xl ${timeLeft < 60 ? 'text-red-400 font-bold' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-8 text-slate-300 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {gameState === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col justify-center items-center text-center space-y-6 max-w-2xl mx-auto py-12">
                <h1 className="text-3xl font-bold text-white">Welcome to the GCAT</h1>
                <p>Global Cognitive Aptitude Test Demo. Complete all questions.</p>
                <button onClick={handleStart} className="mt-6 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xl">
                  Start the Timer
                </button>
              </motion.div>
            )}

            {gameState === 'active' && (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-medium text-emerald-400 tracking-wider capitalize">{questionBank[currentQuestionIndex].category} Reasoning</span>
                  <span className="text-sm text-slate-500">Q{currentQuestionIndex + 1}/{questionBank.length}</span>
                </div>
                
                <h2 className="text-2xl text-white mb-8">{questionBank[currentQuestionIndex].text}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionBank[currentQuestionIndex].options.map((option, idx) => (
                    <button key={idx} onClick={() => handleAnswerSelect(idx)} className={`p-4 text-left border rounded-xl transition-all ${answers[questionBank[currentQuestionIndex].id] === idx ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 hover:border-slate-500'}`}>
                      {option}
                    </button>
                  ))}
                </div>

                <div className="mt-12 pt-6 border-t border-slate-800 flex justify-between items-center">
                   <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="px-6 py-2 border border-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-30">Previous</button>
                   <button onClick={handleNext} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">
                     {currentQuestionIndex === questionBank.length - 1 ? 'Submit Test' : 'Next'}
                   </button>
                </div>
              </motion.div>
            )}

            {gameState === 'completed' && (
              <motion.div key="completed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col justify-center items-center text-center space-y-6 py-12">
                <h1 className="text-3xl font-bold text-white">{autoSubmitMessage ? "Evaluation Terminated" : "Test Completed!"}</h1>
                {autoSubmitMessage && <p className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">{autoSubmitMessage}</p>}
                
                {!autoSubmitMessage && (
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-400">
                    {calculateScore()} / {questionBank.length}
                  </div>
                )}
                
                <a href="/dashboard" className="pt-8 text-emerald-400 underline underline-offset-8">Return to Dashboard</a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
