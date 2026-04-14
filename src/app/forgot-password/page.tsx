import Logo from '@/components/Logo';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Recovery Protocol | Identity Access",
  description: "Initiate the secure handshake to restore access to your Evalous professional profile.",
}

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
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-10 shadow-2xl sm:rounded-3xl border border-white/5">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
