import GCAT from '@/components/GCAT';
import Logo from '@/components/Logo';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "GCAT | Professional Psychometric Assessment",
  description: "Advanced matrix reasoning, numerical, and spatial cognitive evaluation suite.",
};

export default function GCATPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 lg:p-24 flex flex-col items-center">
      
      {/* Mini Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 opacity-80">
        <Logo />
        <h1 className="sr-only">GCAT Professional Psychometric Suite</h1>
        <a href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
          Exit to Dashboard
        </a>
      </div>

      <GCAT />
      
    </main>
  );
}
