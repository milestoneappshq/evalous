import React from 'react';
import Logo from '../Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-white/5 bg-slate-950 py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <Logo className="opacity-80 scale-90 -ml-2" />
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            High-integrity psychometric engine for institutional cognitive benchmarking and recruitment.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</h4>
             <ul className="space-y-2 text-sm text-slate-400 font-medium">
               <li><a href="/login" className="hover:text-emerald-400 transition-colors">Org Dashboard</a></li>
               <li><a href="/login" className="hover:text-emerald-400 transition-colors">Candidate Access</a></li>
               <li><a href="/gcat" className="hover:text-emerald-400 transition-colors">Psychometric Suite</a></li>
             </ul>
          </div>
          
          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal</h4>
             <ul className="space-y-2 text-sm text-slate-400 font-medium">
               <li><a href="#" className="hover:text-indigo-400 transition-colors">Data Integrity</a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors">GDPR Notice</a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Lab</a></li>
             </ul>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          © {currentYear} Evalous. All rights reserved. Precision Benchmarking Protocol v2.5
        </p>
        <div className="flex gap-6">
          <div className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 animate-pulse"></div>
          <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">System Operational</span>
        </div>
      </div>
    </footer>
  );
}

