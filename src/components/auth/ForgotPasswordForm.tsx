"use client";

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/actions/auth';

export default function ForgotPasswordForm() {
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("LOADING");
    const result = await requestPasswordReset(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setStatus("ERROR");
    } else {
      setStatus("SUCCESS");
    }
  }

  if (status === "SUCCESS") {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>
        </div>
        <h3 className="text-xl font-bold text-white">Recovery Handshake Initiated</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          If that email is registered within the Evalous framework, you will receive a secure link to reset your access credentials.
        </p>
        <div className="pt-6">
          <Link href="/login" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Return to Authentication Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Registered Email Address</label>
        <input 
          type="email" 
          name="email"
          required
          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
          placeholder="operator@protocol.com"
        />
      </div>

      {status === "ERROR" && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm font-bold text-red-400 text-center">{errorMsg}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={status === "LOADING"}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400/50 text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-500/10 transition-all uppercase tracking-widest text-xs"
      >
        {status === "LOADING" ? "Connecting..." : "Begin Recovery Handshake"}
      </button>

      <div className="pt-4 border-t border-white/5 flex justify-center">
        <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-white transition-colors">
          Return to Authentication Portal
        </Link>
      </div>
    </form>
  );
}
