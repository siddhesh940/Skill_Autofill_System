import Header from '@/components/Header';
import { Badge, Card } from '@/components/ui';

export default function APIDocsPage() {
  const endpoints = [
    {
      method: 'POST',
      path: '/api/extract-jd',
      description: 'Extract structured data from a job description',
      input: `{
  "jd_text": "Full job description text...",
  "jd_url": "https://linkedin.com/jobs/..." // optional
}`,
      output: `{
  "success": true,
  "data": {
    "job_title": "Senior Software Engineer",
    "company": "Tech Corp",
    "experience_level": "senior",
    "core_skills": ["React", "Node.js", "TypeScript"],
    "tools": ["Git", "Docker", "AWS"],
    "responsibilities": [...],
    "ats_keywords": [...]
  }
}`
    },
    {
      method: 'POST',
      path: '/api/analyze-profile',
      description: 'Analyze resume text and GitHub profile',
      input: `{
  "resume_text": "Resume content...",
  "github_username": "johndoe" // optional
}`,
      output: `{
  "success": true,
  "data": {
    "skills": [
      { "name": "JavaScript", "category": "language", "confidence": 0.95 }
    ],
    "experience_years": 5,
    "github_languages": ["TypeScript", "Python"]
  }
}`
    },
    {
      method: 'POST',
      path: '/api/skill-gap',
      description: 'Compare user skills against job requirements',
      input: `{
  "job_data": { ... }, // from extract-jd
  "user_skills": ["React", "JavaScript", "CSS"]
}`,
      output: `{
  "success": true,
  "data": {
    "match_percentage": 75,
    "matching_skills": ["React", "JavaScript"],
    "missing_skills": [
      { "skill": "TypeScript", "priority": "high", "estimated_hours": 20 }
    ]
  }
}`
    },
    {
      method: 'POST',
      path: '/api/generate-roadmap',
      description: 'Generate a learning roadmap for missing skills',
      input: `{
  "missing_skills": [
    { "skill": "TypeScript", "priority": "high" }
  ],
  "available_hours_per_week": 10
}`,
      output: `{
  "success": true,
  "data": {
    "total_weeks": 4,
    "hours_per_week": 10,
    "weekly_plan": [
      {
        "week": 1,
        "focus_skill": "TypeScript",
        "tasks": [...]
      }
    ]
  }
}`
    },
    {
      method: 'POST',
      path: '/api/generate-all',
      description: 'Run complete analysis pipeline',
      input: `{
  "jd_text": "Job description...",
  "resume_text": "Resume content...",
  "github_username": "johndoe",
  "available_hours_per_week": 10
}`,
      output: `{
  "success": true,
  "data": {
    "job_analysis": { ... },
    "skill_gap": { ... },
    "roadmap": { ... },
    "resume_suggestions": { ... },
    "recommended_projects": { ... },
    "github_tasks": { ... },
    "portfolio_updates": { ... }
  }
}`
    },
    {
      method: 'POST',
      path: '/api/apply-updates',
      description: 'Apply changes to GitHub and portfolio',
      input: `{
  "analysis_id": "uuid",
  "apply_to_github": true,
  "github_repo_name": "owner/repo",
  "apply_to_portfolio": true
}`,
      output: `{
  "success": true,
  "data": {
    "github_issues_created": 5,
    "portfolio_updated": true,
    "errors": []
  }
}`
    }
  ];

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-white mb-2">API Documentation</h1>
        <p className="text-slate-400 mb-8">REST API endpoints for the Skill Autofill System</p>

        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <div className="flex items-center gap-3 mb-4">
                <Badge 
                  variant={endpoint.method === 'POST' ? 'success' : 'info'}
                  size="md"
                >
                  {endpoint.method}
                </Badge>
                <code className="text-lg font-mono text-white">{endpoint.path}</code>
              </div>
              
              <p className="text-slate-300 mb-4">{endpoint.description}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Request Body</h4>
                  <pre className="p-3 bg-slate-900 rounded-lg overflow-x-auto text-sm">
                    <code className="text-green-400">{endpoint.input}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Response</h4>
                  <pre className="p-3 bg-slate-900 rounded-lg overflow-x-auto text-sm">
                    <code className="text-blue-400">{endpoint.output}</code>
                  </pre>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Error Handling</h2>
          <p className="text-slate-300 mb-4">All endpoints return errors in this format:</p>
          <pre className="p-3 bg-slate-900 rounded-lg overflow-x-auto text-sm">
            <code className="text-red-400">{`{
  "success": false,
  "error": "Error message here",
  "code": "VALIDATION_ERROR" // optional error code
}`}</code>
          </pre>
        </Card>

        <Card className="mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Rate Limiting</h2>
          <ul className="space-y-2 text-slate-300">
            <li>• API calls are rate-limited to 100 requests per minute per IP</li>
            <li>• GitHub API calls follow GitHub&apos;s rate limits (60/hour unauthenticated)</li>
            <li>• Large job descriptions may take up to 5 seconds to process</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
