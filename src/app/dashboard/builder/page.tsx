"use client";

import { useState } from 'react';
import { generateMockQuestions, GeneratedQuestions } from '@/actions/aiGenerator';
import { saveCustomAssessment } from '@/actions/saveCustomTest';

export default function AssessmentBuilder() {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  
  // AI Form State
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestions["questions"]>([]);
  const [successLink, setSuccessLink] = useState('');

  // Dummy Org ID for testing
  const ACTIVE_ORG_ID = "test-org-456"; 

  const handleGenerateAI = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const result = await generateMockQuestions(topic, questionCount, difficulty);
      setQuestions([...questions, ...result.questions]);
    } catch (e) {
      alert("Failed to generate questions. Ensure Zod is installed.");
    }
    setIsGenerating(false);
  };

  const handleSaveAssessment = async () => {
    if (!testName || questions.length === 0) return;
    setIsSaving(true);
    
    // Server action with RBAC explicitly checking if they are ADMIN
    const result = await saveCustomAssessment(testName, description, questions, ACTIVE_ORG_ID);
    
    if (result.success) {
      setSuccessLink(`/test/${result.slug}`);
    } else {
      alert(result.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 text-slate-200">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Custom Assessment Engine</h1>
        <p className="text-slate-400">Powered by the AI Generator Sandbox</p>
      </div>

      {successLink ? (
        <div className="bg-emerald-900/30 border border-emerald-500/50 p-8 rounded-xl text-center space-y-4">
          <h2 className="text-2xl font-bold text-emerald-400">Test Created Successfully!</h2>
          <p>Your custom assessment is now live.</p>
          <a href={successLink} className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold">
            Try the Dynamic Runner ➜
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: AI Generator Panel */}
          <div className="lg:col-span-1 space-y-6 bg-slate-900 border border-slate-700 p-6 rounded-xl h-fit sticky top-6">
            <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z"/></svg>
              AI Generator
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Topic Prompt</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Next.js Routing, Customer Service"
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Difficulty</label>
                  <select 
                     value={difficulty}
                     onChange={(e) => setDifficulty(e.target.value)}
                     className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 mt-1"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Count</label>
                  <input 
                    type="number" 
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    min={1} max={20}
                    className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 mt-1"
                  />
                </div>
              </div>
              
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating || !topic}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-2 rounded-lg transition-colors border border-indigo-500"
              >
                {isGenerating ? "Generating Data..." : "Generate JSON Questions"}
              </button>
            </div>
          </div>

          {/* RIGHT: Test Details & Question Preview */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4 bg-slate-900 border border-slate-700 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white">Test Settings</h3>
              <div>
                <label className="text-sm text-slate-400">Assessment Name</label>
                <input 
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-lg font-semibold mt-1"
                  placeholder="Marketing Executive Evaluation"
                  value={testName} onChange={(e) => setTestName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Description</label>
                <textarea 
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-sm mt-1"
                  placeholder="Instructions for the candidate..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex justify-between items-center">
                Generated Questions <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-normal text-slate-400">{questions.length} total</span>
              </h3>
              
              {questions.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-xl p-12 text-center text-slate-500">
                  Use the AI Generator on the left to add questions to this test.
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
                      <div className="font-semibold mb-3">
                        <span className="text-slate-500 mr-2">Q{idx + 1}.</span>{q.text}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-2 rounded text-sm flex items-center gap-2 border ${opt.isCorrect ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-400'}`}>
                            <div className={`w-3 h-3 rounded-full ${opt.isCorrect ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                            {opt.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800">
               <button 
                onClick={handleSaveAssessment}
                disabled={questions.length === 0 || !testName || isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-emerald-500/20"
               >
                 {isSaving ? "Saving to Database..." : "Save Custom Assessment (Admin Only)"}
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
