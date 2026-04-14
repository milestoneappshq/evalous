"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Logo({ className = "" }: { className?: string }) {
  const { data: session } = useSession();
  const href = session ? "/dashboard" : "/";

  return (
    <Link href={href} className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${className}`}>
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Abstract double-diamond logo representing benchmarks/precision */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-teal-400 rotate-45 rounded-sm opacity-20 animate-pulse"></div>
        <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-emerald-400 rotate-45 rounded-sm shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
        <div className="absolute w-2 h-2 bg-white rotate-45 rounded-full scale-50"></div>
      </div>
      <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter">
        Evalous
      </span>
    </div>
  );
}
