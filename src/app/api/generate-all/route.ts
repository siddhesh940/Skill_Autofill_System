import {
  analyzeGitHubData,
  analyzeSkillGap,
  combineSkills,
  extractJobDescription,
  generateGitHubTasks,
  generatePortfolioUpdates,
  generateRoadmap,
  improveResume,
  parseResumeText,
  recommendProjects,
} from '@/lib/nlp';
import { fetchCompleteGitHubProfile } from '@/services/github';
import { NextRequest, NextResponse } from 'next/server';

// Vercel serverless configuration
export const maxDuration = 60; // 60 seconds max execution time

// Helper to safely execute a step with timeout
async function safeExecute<T>(
  fn: () => Promise<T> | T,
  fallback: T,
  timeoutMs: number = 10000
): Promise<T> {
  try {
    const result = await Promise.race([
      Promise.resolve(fn()),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Step timeout')), timeoutMs)
      )
    ]);
    return result;
  } catch (error) {
    console.warn('Step failed, using fallback:', error);
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request format', type: 'validation' },
        { status: 400 }
      );
    }

    const {
      jd_text,
      jd_url,
      resume_text,
      github_username,
      available_hours_per_week = 10,
      original_bullets = [],
    } = body as {
      jd_text?: string;
      jd_url?: string;
      resume_text?: string;
      github_username?: string;
      available_hours_per_week?: number;
      original_bullets?: string[];
    };

    // Enhanced input validation - be lenient but require basics
    const jdTrimmed = (jd_text || '').trim();
    const resumeTrimmed = (resume_text || '').trim();
    const githubTrimmed = (github_username || '').trim();

    // Validate job description - more flexible
    if (!jdTrimmed && !jd_url) {
      return NextResponse.json(
        { error: 'Please provide a job description', type: 'validation' },
        { status: 400 }
      );
    }

    if (jdTrimmed && jdTrimmed.length < 30) {
      return NextResponse.json(
        { error: 'Job description is too short. Please add more details.', type: 'validation' },
        { status: 400 }
      );
    }

    // Validate profile input - more flexible
    if (!resumeTrimmed && !githubTrimmed) {
      return NextResponse.json(
        { error: 'Please provide your resume or GitHub username', type: 'validation' },
        { status: 400 }
      );
    }

    // Lower minimum for resume text
    if (resumeTrimmed && resumeTrimmed.length < 50 && !githubTrimmed) {
      return NextResponse.json(
        { error: 'Please add more resume details or a GitHub username', type: 'validation' },
        { status: 400 }
      );
    }

    // Step 1: Extract Job Description (with fallback)
    let rawJdText = jd_text || '';
    if (jd_url && !jd_text) {
      try {
        const { scrapeJobUrl } = await import('@/lib/nlp/jd-extractor');
        rawJdText = await safeExecute(() => scrapeJobUrl(jd_url), '', 15000);
      } catch {
        // Continue with empty if scraping fails
        console.warn('Job URL scraping failed, using provided text');
      }
    }
    
    const parsedJob = extractJobDescription(rawJdText);

    // Step 2: Analyze Profile (with resilient GitHub fetching)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userSkills: any[] = [];
    let githubData = null;

    // Parse resume if provided
    if (resume_text) {
      try {
        const resumeSkills = parseResumeText(resume_text);
        // Transform to UserSkill-compatible format
        userSkills = resumeSkills.map(s => ({
          id: '',
          user_id: 'anonymous',
          skill_name: s.canonical || s.skill,
          skill_category: s.category,
          proficiency_level: s.proficiency || 'intermediate',
          years_experience: s.yearsExperience || null,
          source: 'resume',
          confidence_score: s.confidence,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      } catch (error) {
        console.warn('Resume parsing error:', error);
        // Continue without resume skills
      }
    }

    // Fetch GitHub data if provided (with timeout protection)
    if (github_username) {
      try {
        const githubProfile = await safeExecute(
          () => fetchCompleteGitHubProfile(github_username),
          null,
          15000 // 15 second timeout for GitHub
        );
        
        if (githubProfile) {
          // Transform to GitHubData format expected by analyzeGitHubData
          const gitHubDataForAnalysis = {
            user: {
              login: githubProfile.user.login,
              name: githubProfile.user.name || githubProfile.user.login,
              avatar_url: githubProfile.user.avatar_url,
              bio: githubProfile.user.bio,
              public_repos: githubProfile.user.public_repos,
              followers: githubProfile.user.followers,
            },
            repos: githubProfile.repos.map(repo => ({
              name: repo.name,
              description: repo.description || '',
              language: repo.language || '',
              languages: {}, // Will be populated below
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              is_fork: repo.fork,
              topics: repo.topics || [],
              created_at: repo.created_at,
              updated_at: repo.updated_at,
            })),
            contribution_count: githubProfile.repos.length,
          };
          
          // Analyze the GitHub data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          githubData = analyzeGitHubData(gitHubDataForAnalysis as any);
          
          if (githubData && githubData.skills) {
            // Transform GitHub skills to UserSkill-compatible format
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ghSkills = githubData.skills.map((s: any) => ({
              id: '',
              user_id: 'anonymous',
              skill_name: s.skill_name || s.name || s.canonical || s.skill,
              skill_category: s.category || s.skill_category || 'tool',
              proficiency_level: s.proficiency_level || s.proficiency || 'intermediate',
              years_experience: null,
              source: 'github',
              confidence_score: s.confidence_score || s.confidence || 0.8,
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            userSkills = combineSkills(userSkills as any, ghSkills as any, 'anonymous');
          }
        }
      } catch (error) {
        // GitHub failures should not block analysis
        console.warn('GitHub analysis skipped:', error);
      }
    }

    // Step 3: Skill Gap Analysis (always succeeds with defaults)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skillGapResult = await safeExecute(
      () => analyzeSkillGap(parsedJob, userSkills as any),
      { match_percentage: 0, matching_skills: [], missing_skills: [], required_skills: [], user_skills: [] } as any,
      5000
    );

    // Step 4: Generate Learning Roadmap (with fallback)
    const roadmapResult = await safeExecute(
      () => generateRoadmap(skillGapResult.missing_skills || [], available_hours_per_week),
      { phases: [], total_weeks: 0, weekly_hours: 0, milestones: [] } as any,
      5000
    );

    // Step 5: Improve Resume (with fallback)
    // Transform original_bullets to experience format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const experienceData: any[] = original_bullets.length > 0 
      ? [{ 
          title: 'Experience', 
          company: '', 
          location: '',
          start_date: '',
          end_date: '',
          is_current: false,
          bullets: original_bullets 
        }]
      : [];
    
    const resumeResult = await safeExecute(
      () => improveResume(
        experienceData,
        parsedJob,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userSkills.map((s: any) => s.skill_name || s.name || s.canonical || s),
        resume_text || ''
      ),
      { improved_bullets: [], new_bullets: [], keywords_to_add: [], ats_score: 0, resume_gaps: [], bullet_improvements: [], ats_analysis: { present_keywords: [], missing_keywords: [], keyword_density_score: 0 }, readiness_score: { overall_score: 0, breakdown: { metrics_score: 0, action_verbs_score: 0, keywords_score: 0, format_score: 0 }, improvement_potential: [] } } as any,
      5000
    );

    // Step 6: Recommend Projects (with fallback)
    const projectsResult = await safeExecute(
      () => recommendProjects(skillGapResult.missing_skills || [], parsedJob, 3),
      { projects: [], strategy: '' } as any,
      5000
    );

    // Step 7: Generate GitHub Tasks (with fallback)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let githubTasksResult: any = { issues: [], repo_name: '', repo_description: '', labels: [], milestones: [] };
    if (projectsResult.projects && projectsResult.projects.length > 0) {
      githubTasksResult = await safeExecute(
        () => generateGitHubTasks(projectsResult.projects[0]) || githubTasksResult,
        githubTasksResult,
        5000
      );
    }

    // Step 8: Generate Portfolio Updates (with fallback)
    const portfolioResult = await safeExecute(
      () => generatePortfolioUpdates(skillGapResult as any, userSkills, parsedJob),
      { skills_to_add: [], skills_to_highlight: [], bio_update: null, headline_update: null, projects_to_feature: [] } as any,
      5000
    );

    // Build response - use flexible approach to handle varying internal types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coreSkills = (parsedJob as any).core_skills || (parsedJob as any).required_skills || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const niceToHaveSkills = (parsedJob as any).nice_to_have_skills || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobTitle = (parsedJob as any).job_title || (parsedJob as any).title || 'Software Developer';

    // Await remaining results (these are already resolved)
    const finalRoadmap = roadmapResult;
    const finalResume = resumeResult;
    const finalProjects = projectsResult;
    const finalPortfolio = portfolioResult;
    const finalSkillGap = skillGapResult;
    
    const response = {
      // Include parsed JD data for reference
      jd_analysis: {
        job_title: jobTitle,
        company: parsedJob.company || '',
        location: parsedJob.location || null,
        experience_level: parsedJob.experience_level || 'mid',
        experience_years_min: parsedJob.experience_years_min || 0,
      },
      job_analysis: {
        job_title: jobTitle,
        company: parsedJob.company || '',
        experience_level: parsedJob.experience_level || 'mid',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        core_skills: coreSkills.map((s: any) => typeof s === 'string' ? s : (s.skill_name || s.canonical_name || s.name || s)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nice_to_have_skills: niceToHaveSkills.map((s: any) => typeof s === 'string' ? s : (s.skill_name || s.canonical_name || s.name || s)),
        tools: parsedJob.tools || [],
        responsibilities: parsedJob.responsibilities || [],
        ats_keywords: parsedJob.ats_keywords || [],
      },
      skill_gap: {
        match_percentage: finalSkillGap.match_percentage || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        matching_skills: (finalSkillGap.matching_skills || []).map((s: any) => 
          typeof s === 'string' ? s : (s.skill_name || s.name || s)
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        missing_skills: (finalSkillGap.missing_skills || []).map((s: any) => ({
          skill: typeof s === 'string' ? s : (s.skill_name || s.name || s),
          priority: (typeof s === 'object' ? s.priority : 'medium') || 'medium',
          estimated_hours: (typeof s === 'object' ? s.estimated_hours : 10) || 10,
        })),
      },
      roadmap: (() => {
        // Build weekly_plan first to derive accurate stats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const weeklyPlan = ((finalRoadmap as any).weekly_plan || finalRoadmap.phases || []).map((item: any, index: number) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tasks = (item.tasks || []).map((t: any) => ({
            title: t.title,
            description: t.description || '',
            hours: t.hours || t.duration_hours || t.estimated_hours || 2,
          }));
          return {
            week: item.week || item.phase_number || item.week_start || index + 1,
            focus_skill: item.focus_skill || item.title || 'General Learning',
            tasks,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resources: (item.resources || []).map((r: any) => ({
              title: r.title,
              url: r.url,
              type: r.type || 'documentation',
            })),
          };
        });
        
        // Calculate total hours from actual tasks
        const totalHours = weeklyPlan.reduce(
          (sum: number, week: { tasks: Array<{ hours: number }> }) => 
            sum + week.tasks.reduce((wSum: number, t: { hours: number }) => wSum + t.hours, 0),
          0
        );
        
        // Derive total_weeks from actual weekly_plan length
        const actualWeeks = weeklyPlan.length;
        
        return {
          total_weeks: actualWeeks,
          total_hours: totalHours,
          hours_per_week: actualWeeks > 0 ? Math.round(totalHours / actualWeeks) : available_hours_per_week,
          weekly_plan: weeklyPlan,
        };
      })(),
      resume_suggestions: {
        // New enhanced fields for redesigned Resume tab
        resume_gaps: finalResume.resume_gaps || [],
        bullet_improvements: finalResume.bullet_improvements || [],
        ats_analysis: finalResume.ats_analysis || {
          present_keywords: [],
          missing_keywords: parsedJob.ats_keywords || [],
          keyword_density_score: 0,
        },
        readiness_score: finalResume.readiness_score || {
          overall_score: 0,
          breakdown: {
            metrics_score: 0,
            action_verbs_score: 0,
            keywords_score: 0,
            format_score: 0,
          },
          improvement_potential: [],
        },
        // Legacy fields for backward compatibility
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        improved_bullets: (finalResume.improved_bullets || []).map((b: any) => ({
          original: b.original || '',
          improved: b.improved || b.text || '',
          keywords_added: b.keywords_added || [],
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ats_keywords: (finalResume as any).ats_keywords || parsedJob.ats_keywords || [],
      },
      recommended_projects: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        projects: (finalProjects.projects || []).map((p: any) => ({
          name: p.title || p.name,
          description: p.description || '',
          tech_stack: p.tech_stack || [],
          difficulty: p.difficulty || 'intermediate',
          estimated_hours: p.estimated_hours || 20,
          skills_demonstrated: p.skills_demonstrated || [],
          features: p.features || [],
          why_recommended: p.why_recommended || '',
          learning_outcomes: p.learning_outcomes || [],
        })),
      },
      github_tasks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        repo_name: (githubTasksResult as any).repo_name || finalProjects.projects?.[0]?.title || 'skill-building-project',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        repo_description: (githubTasksResult as any).repo_description || finalProjects.projects?.[0]?.description || 'A project to build and demonstrate skills',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        issues: (githubTasksResult.issues || []).map((i: any) => ({
          title: i.title,
          body: i.body || i.description || '',
          labels: i.labels || [],
          milestone: i.milestone || null,
          checklist: i.checklist || [],
          priority: i.priority || 'medium',
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        labels: (githubTasksResult as any).labels || [
          { name: 'enhancement', color: '84b6eb', description: 'New feature or request' },
          { name: 'learning', color: '7057ff', description: 'Learning-related task' },
          { name: 'high-priority', color: 'd73a4a', description: 'High priority item' },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        milestones: (githubTasksResult as any).milestones || [
          { title: 'MVP', description: 'Minimum Viable Product', due_on: null },
          { title: 'v1.0', description: 'First complete version', due_on: null },
        ],
      },
      portfolio_updates: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        skills_to_add: (finalPortfolio.skills_to_add || []).map((s: any) => ({
          name: s.name,
          category: s.category || 'technical',
          proficiency: s.proficiency || s.level,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bio_suggestion: (finalPortfolio as any).bio_suggestion || (finalPortfolio as any).bio_update || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        headline_suggestion: (finalPortfolio as any).headline_suggestion || (finalPortfolio as any).headline_update || null,
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    // Log for debugging but never expose details to user
    console.error('Error in generate-all:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Always return user-friendly message
    return NextResponse.json(
      { 
        error: 'Analysis could not be completed. Please try again.',
        type: 'server'
      },
      { status: 500 }
    );
  }
}
