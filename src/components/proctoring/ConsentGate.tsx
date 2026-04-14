"use client";

import React, { useState } from 'react';
import { ShieldAlert, Video, Eye, CheckCircle2 } from 'lucide-react';

interface ConsentGateProps {
  onAccept: () => void;
  orgName: string;
}

export function ConsentGate({ onAccept, orgName }: ConsentGateProps) {
  const [agreed, setAgreed] = useState(false);
  const [askingCam, setAskingCam] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleConsent = async () => {
    if (!agreed) return;
    
    setAskingCam(true);
    try {
      // Prompt for camera access explicitly here
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      
      // We got permission. Stop the tracks immediately because ProctorCamera will re-request it.
      // We just need the browser permission permanently granted.
      stream.getTracks().forEach(track => track.stop());
      
      onAccept();
    } catch (err) {
      console.error(err);
      setErrorStatus("Camera access is required to proceed. Please allow access in your browser and try again.");
      setAskingCam(false);
    }
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-32 bg-indigo-500/20 blur-[100px] pointer-events-none"></div>

        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl">
             <ShieldAlert className="text-indigo-400 w-10 h-10" />
          </div>
          
          <div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Security Check</h1>
            <p className="text-slate-400 text-lg">
              {orgName} requires this assessment to be proctored.
            </p>
          </div>

          <div className="w-full bg-slate-950 rounded-2xl p-6 border border-slate-800 text-left space-y-6 my-4">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs mb-4 text-center text-slate-400">Proctoring Rules</h3>
            
            <div className="flex gap-4">
              <div className="shrink-0 mt-1">
                <Video className="text-emerald-400 w-6 h-6" />
              </div>
              <div>
                <h4 className="text-slate-200 font-bold">AI Webcam Monitoring</h4>
                <p className="text-sm text-slate-400 mt-1">Your webcam will monitor you during the test to ensure no unauthorized devices (like phones) or secondary persons are present in the room.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0 mt-1">
                <Eye className="text-emerald-400 w-6 h-6" />
              </div>
              <div>
                <h4 className="text-slate-200 font-bold">Browser Tab Tracking</h4>
                <p className="text-sm text-slate-400 mt-1">You must remain on this tab. Leaving this tab or minimizing the browser will issue a strike. <strong>3 strikes will auto-submit your test.</strong></p>
              </div>
            </div>
          </div>

          {errorStatus && (
            <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
              {errorStatus}
            </div>
          )}

          <div className="w-full pt-4">
             <label className="flex items-start gap-3 cursor-pointer group mb-8">
               <div className="relative flex items-center justify-center mt-1">
                 <input 
                   type="checkbox" 
                   className="peer sr-only" 
                   checked={agreed} 
                   onChange={(e) => setAgreed(e.target.checked)}
                 />
                 <div className="w-6 h-6 rounded border-2 border-slate-700 bg-slate-800 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors"></div>
                 {agreed && <CheckCircle2 className="absolute text-white w-4 h-4" />}
               </div>
               <span className="text-sm text-slate-400 text-left leading-relaxed">
                 I understand the rules and consent to automated webcam monitoring and focus tracking for the duration of this assessment.
               </span>
             </label>

             <button 
               onClick={handleConsent}
               disabled={!agreed || askingCam}
               className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black tracking-widest uppercase text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
             >
               {askingCam ? "Requesting Camera Access..." : "Accept & Proceed"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

