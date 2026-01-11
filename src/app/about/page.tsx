import Header from '@/components/Header';
import { Card } from '@/components/ui';

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8">About Skill Autofill System</h1>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">🎯 What is this?</h2>
            <p className="text-slate-300 leading-relaxed">
              The Skill Autofill System is an AI-powered career optimization platform that helps you bridge 
              the gap between your current skills and job requirements. Paste a job description, upload your 
              resume, and get instant, actionable insights to improve your candidacy.
            </p>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">🛠️ How It Works</h2>
            <div className="space-y-4 text-slate-300">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <h3 className="font-medium text-white">Job Description Analysis</h3>
                  <p className="text-sm">Uses NLP and keyword extraction to identify required skills, tools, and experience levels.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <h3 className="font-medium text-white">Profile Analysis</h3>
                  <p className="text-sm">Parses your resume and GitHub profile to build a comprehensive skill map.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <h3 className="font-medium text-white">Skill Gap Analysis</h3>
                  <p className="text-sm">Compares your skills with job requirements and identifies gaps with priority levels.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">4</div>
                <div>
                  <h3 className="font-medium text-white">Personalized Recommendations</h3>
                  <p className="text-sm">Generates learning roadmaps, project suggestions, resume improvements, and more.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">🔒 Privacy & Security</h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>100% rule-based processing - no data sent to external AI APIs</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Your resume data is processed locally and never stored permanently</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>GitHub integration uses public API only - no write access required</span>
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">⚡ Technology Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Next.js', desc: 'React Framework' },
                { name: 'TypeScript', desc: 'Type Safety' },
                { name: 'Tailwind CSS', desc: 'Styling' },
                { name: 'Supabase', desc: 'Database & Auth' },
                { name: 'NLP', desc: 'Text Processing' },
                { name: 'GitHub API', desc: 'Integration' },
              ].map((tech) => (
                <div key={tech.name} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="font-medium text-white">{tech.name}</div>
                  <div className="text-xs text-slate-400">{tech.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">✨ Key Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: '📊', title: 'Skill Gap Analysis', desc: 'Identify missing skills with priority levels' },
                { icon: '🗺️', title: 'Learning Roadmap', desc: 'Week-by-week learning plan with resources' },
                { icon: '📄', title: 'Resume Optimization', desc: 'ATS-safe bullet point improvements' },
                { icon: '💡', title: 'Project Suggestions', desc: 'Portfolio projects aligned with JD' },
                { icon: '🐙', title: 'GitHub Integration', desc: 'Auto-generate issues for learning tasks' },
                { icon: '🎯', title: 'Portfolio Updates', desc: 'Skills and content recommendations' },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <div className="font-medium text-white">{feature.title}</div>
                    <div className="text-sm text-slate-400">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
