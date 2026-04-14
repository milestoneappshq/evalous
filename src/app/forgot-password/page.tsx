import Link from 'next/link';
import Logo from '@/components/Logo';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo className="mb-8" />
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Recovery Protocol
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Restore Access to your Profile
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-10 shadow-2xl sm:rounded-3xl border border-white/5 space-y-8">
          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Registered Email Address</label>
            <input 
              type="email" 
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
              placeholder="operator@protocol.com"
            />
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-500/10 transition-all uppercase tracking-widest text-xs">
            Begin Recovery Handshake
          </button>

          <div className="pt-4 border-t border-white/5 flex justify-center">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-white transition-colors">
              Return to Authentication Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
