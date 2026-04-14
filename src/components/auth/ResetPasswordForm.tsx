"use client";

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export default function ResetPasswordForm({ email, token }: { email: string, token: string }) {
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    if (formData.get("password") !== formData.get("confirmPassword")) {
      setErrorMsg("Passwords do not match");
      setStatus("ERROR");
      return;
    }

    setStatus("LOADING");
    formData.append("email", email);
    formData.append("token", token);

    const result = await resetPassword(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setStatus("ERROR");
    } else {
      setStatus("SUCCESS");
      // Auto redirect after a short delay
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 3000);
    }
  }

  if (status === "SUCCESS") {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>
        </div>
        <h3 className="text-xl font-bold text-white">Cryptographic Reset Successful</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your new secure credentials have been successfully updated in the database. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">New Password</label>
          <input 
            type="password" 
            name="password"
            required
            minLength={8}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-700"
            placeholder="Minimum 8 characters"
          />
        </div>
        
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Confirm Password</label>
          <input 
            type="password" 
            name="confirmPassword"
            required
            minLength={8}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-700"
            placeholder="Re-type password"
          />
        </div>
      </div>

      {status === "ERROR" && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm font-bold text-red-400 text-center">{errorMsg}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={status === "LOADING"}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-emerald-400/50 text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-500/10 transition-all uppercase tracking-widest text-xs"
      >
        {status === "LOADING" ? "Securing..." : "Commit New Credentials"}
      </button>
    </form>
  );
}
