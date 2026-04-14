import Link from 'next/link';
import Logo from '@/components/Logo';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo className="mb-8" />
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Initialize Access
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Evaluations and Benchmarks for Professionals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl py-12 px-10 shadow-2xl sm:rounded-3xl border border-white/5 text-center space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Institutional Registration</h3>
            <p className="text-slate-400 leading-relaxed">
              Evalous is currently in **Phase 2 (Invite-Only)**. Organization access is granted via direct sponsorship.
            </p>
          </div>

          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
             <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest leading-loose">
               Candidate? Check your email for an invitation code from your recruiter.
             </p>
          </div>

          <div className="pt-4">
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
