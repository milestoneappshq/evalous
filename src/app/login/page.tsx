import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LoginForm from "@/components/auth/LoginForm"

export default async function LoginPage() {
  const session = await auth()
  
  // If already logged in, redirect to the dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Use your Organization or Candidate credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow-2xl sm:rounded-2xl border border-slate-800 sm:px-10">
          <LoginForm />
          
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">MVP Testing Emails</span>
              </div>
            </div>
            <div className="mt-6 text-sm text-center text-slate-400">
              <p>Super Admin: <span className="text-emerald-400">superadmin@platform.com</span></p>
              <p>Org Admin: <span className="text-emerald-400">admin@any.com</span></p>
              <p>Candidate: <span className="text-emerald-400">test@candidate.com</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
