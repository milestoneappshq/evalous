"use client";

import Link from 'next/link';
import Logo from '@/components/Logo';
import { useState } from 'react';
import { registerUser } from '@/actions/auth';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // Attempt automatic login
    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (loginResult?.error) {
      router.push("/login?error=RegistrationSuccessButLoginFailed");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo className="mb-8" />
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Initialize Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Evaluations and Benchmarks for Professionals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-10 shadow-2xl sm:rounded-3xl border border-white/5 space-y-6">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-700"
                  placeholder="Jane Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Registered Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-700"
                  placeholder="operator@protocol.com"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Secure Password</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  minLength={8}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-700"
                  placeholder="Minimum 8 characters"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm font-bold text-red-400 text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-emerald-400/50 text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-500/10 transition-all uppercase tracking-widest text-xs"
            >
              {isLoading ? "Provisioning..." : "Establish Identity"}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-4">
             <p className="text-xs text-slate-400 text-center leading-relaxed">
               Candidate? Check your email for an invitation code to bypass registration.
             </p>
            <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Standard Identity Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
