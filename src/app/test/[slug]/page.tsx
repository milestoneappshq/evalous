import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import DynamicRunner from '@/components/DynamicRunner';
import { TEST_METADATA } from './metadata';



// Dynamically import benchmark components to keep the main bundle light
const SequenceMemory = dynamic(() => import('@/components/benchmarks/SequenceMemory'));
const AimTrainer = dynamic(() => import('@/components/benchmarks/AimTrainer'));
const ChimpTest = dynamic(() => import('@/components/benchmarks/ChimpTest'));
const VisualMemory = dynamic(() => import('@/components/benchmarks/VisualMemory'));
const TypingTest = dynamic(() => import('@/components/benchmarks/TypingTest'));
const VerbalMemory = dynamic(() => import('@/components/benchmarks/VerbalMemory'));
const NumberMemory = dynamic(() => import('@/components/benchmarks/NumberMemory'));
const MensaIQ = dynamic(() => import('@/components/MensaIQ'));
const EQTest = dynamic(() => import('@/components/EQTest'));
const ReactionTime = dynamic(() => import('@/components/ReactionTime'));

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = TEST_METADATA[params.slug];
  if (meta) {
    return {
      title: meta.title,
      description: meta.description,
    };
  }
  return {
    title: "Evalous Assessment",
    description: "Proctored cognitive evaluation room.",
  };
}

export default async function CustomTestPage({ params }: Props) {
  const slug = params.slug;

  // 1. Handle Standalone/Benchmark Tests first
  const benchmarkMeta = TEST_METADATA[slug];
  if (benchmarkMeta) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 md:p-12 lg:p-24 flex flex-col items-center">
        <div className="w-full max-w-6xl flex items-center justify-between mb-12 opacity-80">
          <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-400 to-emerald-400 tracking-tighter">
            Evalous
          </h1>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Institutional Benchmark Module
          </div>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 w-full">
             {slug === 'sequence-memory' && <SequenceMemory />}
             {slug === 'aim-trainer' && <AimTrainer />}
             {slug === 'chimp-test' && <ChimpTest />}
             {slug === 'visual-memory' && <VisualMemory />}
             {slug === 'typing-test' && <TypingTest />}
             {slug === 'verbal-memory' && <VerbalMemory />}
             {slug === 'number-memory' && <NumberMemory />}
             {slug === 'mensa-iq' && <MensaIQ />}
             {slug === 'eq-assessment' && <EQTest />}
             {slug === 'reaction-time' && <ReactionTime />}
          </div>

          {/* SEO Content / Knowledge Card */}
          <aside className="w-full lg:w-80 space-y-8 h-full">
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-6">
               <div className="space-y-2">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">The Science</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                     "{benchmarkMeta.longDesc}"
                  </p>
               </div>
               <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Optimization Strategy</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                     {benchmarkMeta.strategy}
                  </p>
               </div>
               <div className="pt-4 border-t border-white/5">
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Metrics Tracked</div>
                  <div className="flex flex-wrap gap-2">
                     <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-white/5">LATENCY</span>
                     <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-white/5">PRECISION</span>
                     <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-white/5">NEURAL LOAD</span>
                  </div>
               </div>
            </div>

            <a href="/" className="flex items-center justify-center p-4 w-full border border-white/10 rounded-2xl text-xs font-bold text-slate-500 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest">
               Exit to Lab Index
            </a>
          </aside>
        </div>
      </main>
    );
  }

  // 2. Query the test deeply with all questions and options for custom tests
  const test = await prisma.test.findUnique({
    where: { slug: slug },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          options: true
        }
      }
    }
  });

  if (!test) {
    return notFound();
  }

  const safeQuestions = test.questions.map(q => ({
    id: q.id,
    text: q.text,
    options: q.options.map(opt => ({
      id: opt.id,
      text: opt.text
    }))
  }));

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 lg:p-24 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 opacity-80">
        <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-400 to-emerald-400 tracking-tighter">
          Evalous
        </h1>
        <div className="text-sm font-medium text-slate-400">
          Proctored Assessment Room
        </div>
      </div>
      
      <DynamicRunner 
        testId={test.id}
        slug={test.slug}
        name={test.name}
        description={test.description || ""}
        orgId={test.orgId}
        questions={safeQuestions}
      />
    </main>
  );
}
