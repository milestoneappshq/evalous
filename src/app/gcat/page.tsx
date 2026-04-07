import GCAT from '@/components/GCAT';

export default function GCATPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 lg:p-24 flex flex-col items-center">
      
      {/* Mini Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 opacity-80">
        <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-400 to-emerald-400 tracking-tighter">
          Evalous
        </h1>
        <a href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
          Exit to Dashboard
        </a>
      </div>

      <GCAT />
      
    </main>
  );
}
