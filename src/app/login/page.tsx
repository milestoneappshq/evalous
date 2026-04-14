import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LoginForm from "@/components/auth/LoginForm"
import Logo from "@/components/Logo"
import Link from "next/link"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Identity Access Portal | Evalous",
  description: "Secure institutional access to the Evalous psychometric suite and cognitive benchmarks.",
}

export default async function LoginPage() {
  const session = await auth()
  
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo className="mb-8" />
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Protocol Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter organization or candidate credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl border border-white/5 sm:px-10">
          <LoginForm />
          
          <div className="mt-6 flex flex-col gap-4 text-center">
            <Link 
              href="/forgot-password" 
              className="text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"
            >
              Forgot Identity Access?
            </Link>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-tighter">
                <span className="px-4 bg-slate-900/0 text-slate-600">Verification Boundary</span>
              </div>
            </div>

            <p className="text-sm text-slate-400">
              New to the protocol?{" "}
              <Link href="/signup" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                Initialize Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
