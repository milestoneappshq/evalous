"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitCustomTest } from '@/actions/submitCustomTest';
import { ConsentGate } from './proctoring/ConsentGate';
import { ProctorCamera } from './proctoring/ProctorCamera';
import { useTabTracking } from '@/hooks/useTabTracking';

type SafeQuestion = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
};

export default function DynamicRunner({ 
  testId, 
  slug, 
  name, 
  description, 
  orgId, 
  questions 
}: { 
  testId: string; slug: string; name: string; description: string; orgId: string | null; questions: SafeQuestion[] 
}) {
  const [hasConsented, setHasConsented] = useState(false);
  const [gameState, setGameState] = useState<'intro' | 'active' | 'completed'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [autoSubmitMessage, setAutoSubmitMessage] = useState<string | null>(null);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // --- PROCTORING STATE ---
  const { blurCount, warnings: tabWarnings, isViolated: tabViolated } = useTabTracking(3);
  const [proctoringFlags, setProctoringFlags] = useState<{ reason: string; base64Snapshot: string; timestamp: Date }[]>([]);
  
  // Track if we've auto-submitted to prevent loops
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    // Auto-submit if tab tracking hits the limit (3 strikes)
    if (tabViolated && gameState === 'active' && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      const reason = "Auto-submitted due to focus violation limit (3 strikes).";
      setAutoSubmitMessage(reason);
      finishTest(reason);
    }
  }, [tabViolated, gameState]);

  const handleCameraFlag = (reason: string, base64Snapshot: string) => {
    setProctoringFlags(prev => [...prev, { reason, base64Snapshot, timestamp: new Date() }]);
  };

  const handleStart = () => {
    setGameState('active');
  };

  const handleAnswerSelect = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: optionId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async (autoSubmitReason?: string) => {
    setGameState('completed');
    setIsSaving(true);
    
    // Merge Tab warnings into the generic proctoring flags payload
    const allFlags = [...proctoringFlags];
    tabWarnings.forEach(w => {
      allFlags.push({ reason: `Tab Focus Lost: ${w.reason}`, base64Snapshot: "", timestamp: w.timestamp });
    });
    
    if (autoSubmitReason) {
       allFlags.push({ reason: autoSubmitReason, base64Snapshot: "", timestamp: new Date() });
    }

    const result = await submitCustomTest(slug, testId, orgId, answers, allFlags);
    if (result.success) {
      setFinalScore(result.score ?? null);
    }
    
    setIsSaving(false);
  };

  if (!hasConsented) {
    return <ConsentGate onAccept={() => setHasConsented(true)} orgName="The Hiring Organization" />;
  }

  return (
    <>
      <AnimatePresence>
        {gameState === 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="proctor-cam"
          >
            <ProctorCamera 
              isActive={true} 
              onFlag={handleCameraFlag} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Overlay Layer */}
      <AnimatePresence>
        {tabWarnings.length > 0 && gameState === 'active' && (
           <motion.div 
             initial={{ y: -50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: -50, opacity: 0 }}
             key="warning-overlay"
             className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
             Warning: {tabWarnings.length}/3 Focus Violations. Test will auto-submit.
           </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout
        className="w-full max-w-4xl mx-auto min-h-[500px] flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden mt-8 relative"
      >
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center text-slate-200">
          <h2 className="font-bold text-lg">{name}</h2>
        </div>

        <div className="flex-1 p-8 text-slate-300 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {gameState === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex flex-col justify-center items-center text-center space-y-6 max-w-2xl mx-auto py-12"
              >
                <h1 className="text-3xl items-center font-bold text-white">{name}</h1>
                <p className="text-lg">{description || 'Complete all questions to the best of your ability.'}</p>
                <div className="bg-slate-800 p-4 rounded-xl w-full flex justify-around border border-slate-700">
                  <div className="text-center">
                    <div className="text-2xl font-black text-indigo-400">{questions.length}</div>
                    <div className="text-xs uppercase tracking-widest text-slate-500">Questions</div>
                  </div>
                </div>
                <button 
                  onClick={handleStart}
                  className="mt-6 px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-colors shadow-[0_0_20px_rgba(79,70,229,0.2)] border border-indigo-500/50"
                >
                  Start Assessment
                </button>
              </motion.div>
            )}

            {gameState === 'active' && (
              <motion.div 
                key="active-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="h-2 w-48 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex-1 relative min-h-[250px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0"
                    >
                      <h2 className="text-2xl text-white mb-8 leading-relaxed">
                        {questions[currentQuestionIndex].text}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {questions[currentQuestionIndex].options.map((option: any, idx: number) => {
                          const isSelected = answers[questions[currentQuestionIndex].id] === option.id;
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleAnswerSelect(option.id)}
                              className={`p-4 text-left border rounded-lg transition-all duration-200 ${
                                isSelected 
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_15px_rgba(79,70,229,0.15)] z-10'
                                : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-slate-500 text-slate-300'
                              }`}
                            >
                              <span className="inline-block w-8 font-bold opacity-50">{String.fromCharCode(65 + idx)}.</span>
                              {option.text}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-800 flex justify-end items-center">
                  <button 
                    onClick={handleNext}
                    disabled={!answers[questions[currentQuestionIndex].id]}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next Question'}
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'completed' && (
              <motion.div 
                key="completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col justify-center items-center text-center space-y-6 py-12"
              >
                {isSaving ? (
                  <div className="space-y-4">
                     <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                     <h1 className="text-2xl font-bold text-white">Grading Submissions...</h1>
                     <p className="text-slate-400">Securely analyzing your answers.</p>
                  </div>
                ) : (
                  <>
                    <div className={`w-24 h-24 ${autoSubmitMessage ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'} border rounded-full flex items-center justify-center mb-2`}>
                       {autoSubmitMessage ? (
                         <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                       ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                       )}
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                      {autoSubmitMessage ? "Evaluation Terminated" : "Test Completed!"}
                    </h1>

                    {autoSubmitMessage && (
                       <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl max-w-md mx-auto">
                          <p className="text-red-400 font-bold text-sm tracking-wide leading-relaxed">{autoSubmitMessage}</p>
                       </div>
                    )}
                    
                    {finalScore !== null && !autoSubmitMessage && (
                      <>
                        <p className="text-xl text-slate-300">Your final score is:</p>
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-indigo-600">
                           {finalScore} / {questions.length}
                        </div>
                      </>
                    )}
                    
                    <a href="/dashboard" className="pt-8 text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30">
                      Return to Dashboard
                    </a>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
