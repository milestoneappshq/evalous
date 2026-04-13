"use client";

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { processBulkCandidates } from '@/actions/bulkUpload';
import { getAvailableTests } from '@/actions/getTests';
import { SessionProvider, useSession } from 'next-auth/react';

function UploadCandidatesInner() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');

  const activeOrgId = (session?.user as any)?.activeOrgId;

  useEffect(() => {
    if (activeOrgId) {
      getAvailableTests(activeOrgId).then(setAvailableTests);
    }
  }, [activeOrgId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file || !activeOrgId) return;
    setLoading(true);
    setStatus("Parsing CSV...");
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (resultsRaw) => {
        setStatus(`Parsed ${resultsRaw.data.length} rows. Uploading to database and sending invites...`);
        
        const mappedData = resultsRaw.data.map((row: any) => ({
          email: row.Email || row.email,
          name: row.Name || row.name || '',
        }));

        const res = await processBulkCandidates(mappedData, activeOrgId, selectedTestId);
        
        if (res.success) {
          setStatus("Upload & Invite Blast Complete!");
          setResults(res.results);
        } else {
          setStatus(`Error: ${res.error}`);
        }
        setLoading(false);
      },
      error: (error) => {
        setStatus(`Parse Error: ${error.message}`);
        setLoading(false);
      }
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Bulk Candidate Upload</h1>
        <p className="text-slate-400 text-lg">Quickly enroll candidates or clients into your organization via CSV.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-700 shadow-2xl">
        
        {/* Step 0: Test Selection */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">1</span>
            Select Assessment to Assign
          </h3>
          <select 
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="w-full bg-slate-800 border-slate-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            <option value="">No Test (Upload Users Only)</option>
            {availableTests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.isCustom ? "(Custom)" : "(Global)"}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 italic">Choosing a test will automatically email a secure invitation link to every candidate in the CSV.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">2</span>
              Download Template
            </h3>
            <p className="text-slate-400">Standard format: <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400 font-mono">Email, Name</code></p>
            <a href="/api/csv-template" className="inline-block bg-slate-800 hover:bg-slate-700 transition mt-2 text-white px-6 py-2.5 rounded-xl font-bold border border-slate-700 shadow-lg">
              Download Template
            </a>
          </div>
          
          <div className="h-px md:h-32 w-full md:w-px bg-slate-800"></div>

          <div className="flex-1 space-y-4 w-full">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">3</span>
              Upload & Blast
            </h3>
            
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400
                file:mr-4 file:py-2.5 file:px-6
                file:rounded-xl file:border-0
                file:text-sm file:font-bold
                file:bg-indigo-600 file:text-white
                hover:file:bg-indigo-700 cursor-pointer transition-all"
            />
            
            <button 
              onClick={handleUpload}
              disabled={!file || loading || !activeOrgId}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black tracking-widest uppercase text-sm transition-all shadow-xl shadow-emerald-500/10"
            >
              {loading ? "Processing Pipeline..." : "Start Import & Invite Blast"}
            </button>
          </div>
        </div>
      </div>

      {status && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="font-bold text-white">{status}</p>
          </div>
          
          {results && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                 <div className="text-3xl font-black text-emerald-400">{results.created}</div>
                 <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter mt-1">New Users</div>
               </div>
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                 <div className="text-3xl font-black text-indigo-400">{results.existEnrolled}</div>
                 <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter mt-1">Existing</div>
               </div>
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                 <div className="text-3xl font-black text-teal-400">{results.invitesSent}</div>
                 <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter mt-1">Invites Sent</div>
               </div>
               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                 <div className="text-3xl font-black text-red-500">{results.errors}</div>
                 <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter mt-1">Errors</div>
               </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UploadCandidates() {
  return (
    <SessionProvider>
      <UploadCandidatesInner />
    </SessionProvider>
  );
}
