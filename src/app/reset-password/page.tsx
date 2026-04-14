import Logo from '@/components/Logo';
import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Commit New Credentials | Identity Access",
  description: "Securely establish your new access credentials.",
}

// In Next.js App Router, searchParams are passed as a prop
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const token = typeof resolvedParams.token === 'string' ? resolvedParams.token : null;
  const email = typeof resolvedParams.email === 'string' ? resolvedParams.email : null;

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 items-center">
         <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">Invalid Handshake</h2>
            <p className="text-slate-400 text-sm mb-6">The recovery URL is missing encryption parameters (token/email). Please request a new recovery link.</p>
            <Link href="/forgot-password" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-sm">
              Restart Recovery
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo className="mb-8" />
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Update Credentials
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Establish a new secure pass-key for {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-10 shadow-2xl sm:rounded-3xl border border-white/5">
          <ResetPasswordForm token={token} email={email} />
        </div>
      </div>
    </div>
  );
}
