import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from '@/lib/prisma';
import { 
  getOrgStats, 
  getRecentActivity, 
  getScoreAverages 
} from "@/actions/dashboard"
import { StatCard, ResultsTable } from "@/components/dashboard/DashboardElements"
import { ScoreChart } from "@/components/dashboard/ScoreChart"
import Logo from "@/components/Logo"
import { Users, ClipboardCheck, BarChart3, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const user = session.user as any
  const systemRole = user.systemRole || "USER"

  // 1. Resolve Active Org Context
  // For MVP, if no activeOrgId in session, we pick the first one they belong to
  let activeOrgId = user.activeOrgId
  
  if (!activeOrgId) {
    const membership = await prisma.organizationMembership.findFirst({
      where: { userId: user.id },
      include: { organization: true }
    })
    activeOrgId = membership?.organizationId
  }

  // 2. Fetch Dashboard Data if we have an Org Context
  let stats = null
  let recentActivity: any[] = []
  let chartData: any[] = []

  if (activeOrgId) {
    try {
      [stats, recentActivity, chartData] = await Promise.all([
        getOrgStats(activeOrgId),
        getRecentActivity(activeOrgId),
        getScoreAverages(activeOrgId)
      ])
    } catch (e) {
      console.error("Dashboard data fetch error", e)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 mb-10 gap-4">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
            {systemRole === "SUPER_ADMIN" ? "Control Center // " : "Analytics Dashboard // "}
            <span className="text-emerald-400">
              {stats ? `Monitoring ${stats.totalCandidates} candidates` : `Welcome back, ${user.email}`}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <form action={async () => {
            "use server"
            await signOut()
          }}>
            <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all text-sm font-bold border border-slate-800 hover:border-slate-700 shadow-xl">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto space-y-10">
        
        {/* ORG ADMIN VIEW */}
        {activeOrgId && (
          <>
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  label="Total Candidates" 
                  value={stats.totalCandidates} 
                  icon={Users} 
                  colorClass="border-l-indigo-500"
                />
                <StatCard 
                  label="Assignments" 
                  value={stats.totalAssignments} 
                  icon={ClipboardCheck} 
                  colorClass="border-l-emerald-500"
                />
                <StatCard 
                  label="Completion Rate" 
                  value={`${stats.completionRate}%`} 
                  icon={TrendingUp} 
                  colorClass="border-l-teal-500"
                  trend="12"
                />
                <StatCard 
                  label="Average Score" 
                  value="78.4" 
                  icon={BarChart3} 
                  colorClass="border-l-cyan-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Column: Charts */}
              <div className="lg:col-span-1">
                <ScoreChart data={chartData} />
              </div>

              {/* Right Column: Table */}
              <div className="lg:col-span-2">
                <ResultsTable results={recentActivity} />
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-teal-600/20 border border-slate-700 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
               <div className="max-w-md text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to expand your team?</h3>
                  <p className="text-slate-400">Invite new candidates via bulk CSV or create a custom role assessment to get started.</p>
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                  <a href="/dashboard/upload" className="flex-1 md:flex-none px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-colors text-center">
                    Blast Invites
                  </a>
                  <a href="/dashboard/builder" className="flex-1 md:flex-none px-8 py-3 bg-slate-900 text-white font-bold border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors text-center">
                    New Test
                  </a>
               </div>
            </div>
          </>
        )}

        {!activeOrgId && systemRole !== "SUPER_ADMIN" && (
          <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
             <h2 className="text-2xl font-bold text-slate-500">No active organization found</h2>
             <p className="text-slate-600 mt-2">You must be part of an organization to see analytics.</p>
          </div>
        )}
      </main>
    </div>
  )
}
