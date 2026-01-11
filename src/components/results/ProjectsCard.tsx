'use client';

import type { FullAnalysisResponse } from '@/types';

interface ProjectsCardProps {
  projects: FullAnalysisResponse['recommended_projects'];
  skillGap: FullAnalysisResponse['skill_gap'];
}

// Helper: Calculate resume impact from project
function calculateResumeImpact(
  project: FullAnalysisResponse['recommended_projects']['projects'][0],
  skillGap: FullAnalysisResponse['skill_gap']
) {
  // Count how many missing skills this project addresses
  const missingSkillNames = skillGap.missing_skills.map(s => s.skill.toLowerCase());
  const addressedSkills = project.skills_demonstrated.filter(skill =>
    missingSkillNames.includes(skill.toLowerCase())
  );
  
  // Count ATS keywords (tech stack + skills that match job requirements)
  const atsKeywords = [...new Set([...project.tech_stack, ...project.skills_demonstrated])].length;
  
  // Determine profile type based on tech stack
  const frontendIndicators = ['react', 'vue', 'angular', 'css', 'tailwind', 'ui', 'ux', 'frontend', 'next.js'];
  const backendIndicators = ['node', 'express', 'api', 'database', 'postgresql', 'mongodb', 'redis', 'graphql', 'rest'];
  const devopsIndicators = ['docker', 'kubernetes', 'ci/cd', 'aws', 'azure', 'devops'];
  
  const techLower = [...project.tech_stack, ...project.skills_demonstrated].map(t => t.toLowerCase());
  const frontendScore = techLower.filter(t => frontendIndicators.some(i => t.includes(i))).length;
  const backendScore = techLower.filter(t => backendIndicators.some(i => t.includes(i))).length;
  const devopsScore = techLower.filter(t => devopsIndicators.some(i => t.includes(i))).length;
  
  let profileType = 'Full-Stack';
  if (frontendScore > backendScore + 2) profileType = 'Frontend';
  else if (backendScore > frontendScore + 2) profileType = 'Backend';
  else if (devopsScore > 2) profileType = 'DevOps';
  
  return {
    atsKeywords,
    addressedSkillCount: addressedSkills.length,
    profileType,
  };
}

// Helper: Generate "Why this project?" explanation
function getWhyThisProject(
  project: FullAnalysisResponse['recommended_projects']['projects'][0],
  skillGap: FullAnalysisResponse['skill_gap']
): string {
  // Use existing why_recommended if meaningful
  if (project.why_recommended && project.why_recommended.length > 10) {
    return project.why_recommended;
  }
  
  // Otherwise, derive from skill gap
  const missingSkillNames = skillGap.missing_skills.map(s => s.skill.toLowerCase());
  const addressed = project.skills_demonstrated.filter(skill =>
    missingSkillNames.includes(skill.toLowerCase())
  ).slice(0, 3);
  
  if (addressed.length > 0) {
    return `Helps cover missing skills: ${addressed.join(', ')}.`;
  }
  
  return `Demonstrates ${project.skills_demonstrated.slice(0, 3).join(', ')} for your target role.`;
}

export default function ProjectsCard({ projects, skillGap }: ProjectsCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const projectList = projects.projects || [];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-orange-500/20 text-orange-400">
            💡
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Recommended Projects
            </h3>
            <p className="text-sm text-slate-400">
              Build these to close your skill gaps
            </p>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-4">
        {projectList.map((project, index) => {
          const impact = calculateResumeImpact(project, skillGap);
          const whyProject = getWhyThisProject(project, skillGap);
          
          return (
          <div key={index} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {project.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`badge border ${
                        difficultyColors[project.difficulty] || difficultyColors.intermediate
                      }`}
                    >
                      {project.difficulty}
                    </span>
                    <span className="text-sm text-slate-400">
                      ~{project.estimated_hours} hours
                    </span>
                  </div>
                </div>
              </div>
              {/* GitHub-Readiness Hint */}
              <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-400 rounded border border-slate-600/50">
                📋 GitHub-ready
              </span>
            </div>

            <p className="text-slate-300 mb-4">{project.description}</p>
            
            {/* Why This Project? - NEW */}
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-blue-400">💡</span>
                <div>
                  <p className="text-sm font-medium text-blue-300">Why this project?</p>
                  <p className="text-sm text-slate-300">{whyProject}</p>
                </div>
              </div>
            </div>
            
            {/* Resume Impact - NEW */}
            <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
              <p className="text-xs text-slate-400 mb-2 font-medium">Resume Impact:</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="text-green-400">
                  +{impact.atsKeywords} ATS keywords
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">
                  Strengthens <span className="text-purple-400 font-medium">{impact.profileType}</span> profile
                </span>
                {impact.addressedSkillCount > 0 && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-orange-400">
                      Closes {impact.addressedSkillCount} skill gap{impact.addressedSkillCount > 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Tech Stack:</p>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => {
                  const isMatchingSkill = skillGap.matching_skills.some(
                    (s) => s.toLowerCase() === tech.toLowerCase()
                  );
                  const isMissingSkill = skillGap.missing_skills.some(
                    (s) => s.skill.toLowerCase() === tech.toLowerCase()
                  );
                  return (
                    <span
                      key={tech}
                      className={`skill-tag ${
                        isMatchingSkill
                          ? 'border-green-500/50 text-green-400'
                          : isMissingSkill
                          ? 'border-red-500/50 text-red-400'
                          : ''
                      }`}
                    >
                      {tech}
                      {isMatchingSkill && ' ✓'}
                      {isMissingSkill && ' (learn)'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Skills Demonstrated */}
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">
                Skills Demonstrated:
              </p>
              <div className="flex flex-wrap gap-2">
                {project.skills_demonstrated.map((skill) => (
                  <span key={skill} className="badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Key Features:</p>
              <div className="grid md:grid-cols-2 gap-2">
                {project.features.slice(0, 6).map((feature, fIndex) => (
                  <div
                    key={fIndex}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <span className="text-green-400">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        })}

        {projectList.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-slate-500">No projects recommended yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
