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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jd_text,
      jd_url,
      resume_text,
      github_username,
      available_hours_per_week = 10,
      original_bullets = [],
    } = body;

    // Validate required inputs
    if (!jd_text && !jd_url) {
      return NextResponse.json(
        { error: 'Either jd_text or jd_url is required' },
        { status: 400 }
      );
    }

    if (!resume_text && !github_username) {
      return NextResponse.json(
        { error: 'Either resume_text or github_username is required' },
        { status: 400 }
      );
    }

    // Step 1: Extract Job Description
    let rawJdText = jd_text;
    if (jd_url && !jd_text) {
      const { scrapeJobUrl } = await import('@/lib/nlp/jd-extractor');
      rawJdText = await scrapeJobUrl(jd_url);
    }
    const parsedJob = extractJobDescription(rawJdText);

    // Step 2: Analyze Profile  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userSkills: any[] = [];
    let githubData = null;

    if (resume_text) {
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
    }

    if (github_username) {
      try {
        // First fetch the complete GitHub profile
        const githubProfile = await fetchCompleteGitHubProfile(github_username);
        
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
        console.warn('GitHub analysis failed:', error);
      }
    }

    // Step 3: Skill Gap Analysis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skillGapResult = analyzeSkillGap(parsedJob, userSkills as any);

    // Step 4: Generate Learning Roadmap
    const roadmapResult = generateRoadmap(skillGapResult.missing_skills, available_hours_per_week);

    // Step 5: Improve Resume
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
    const resumeResult = improveResume(
      experienceData,
      parsedJob,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userSkills.map((s: any) => s.skill_name || s.name || s.canonical || s),
      resume_text // Pass the full resume text for enhanced analysis
    );

    // Step 6: Recommend Projects
    const projectsResult = recommendProjects(
      skillGapResult.missing_skills,
      parsedJob,
      3
    );

    // Step 7: Generate GitHub Tasks for top project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let githubTasksResult: { issues: any[] } = { issues: [] };
    if (projectsResult.projects && projectsResult.projects.length > 0) {
      const tasksResult = generateGitHubTasks(projectsResult.projects[0]);
      githubTasksResult = tasksResult || { issues: [] };
    }

    // Step 8: Generate Portfolio Updates
    const portfolioResult = generatePortfolioUpdates(
      skillGapResult,
      userSkills,
      parsedJob
    );

    // Build response - use flexible approach to handle varying internal types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coreSkills = (parsedJob as any).core_skills || (parsedJob as any).required_skills || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const niceToHaveSkills = (parsedJob as any).nice_to_have_skills || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobTitle = (parsedJob as any).job_title || (parsedJob as any).title || 'Software Developer';
    
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
        match_percentage: skillGapResult.match_percentage || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        matching_skills: (skillGapResult.matching_skills || []).map((s: any) => 
          typeof s === 'string' ? s : (s.skill_name || s.name || s)
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        missing_skills: (skillGapResult.missing_skills || []).map((s: any) => ({
          skill: typeof s === 'string' ? s : (s.skill_name || s.name || s),
          priority: (typeof s === 'object' ? s.priority : 'medium') || 'medium',
          estimated_hours: (typeof s === 'object' ? s.estimated_hours : 10) || 10,
        })),
      },
      roadmap: (() => {
        // Build weekly_plan first to derive accurate stats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const weeklyPlan = ((roadmapResult as any).weekly_plan || roadmapResult.phases || []).map((item: any, index: number) => {
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
        resume_gaps: resumeResult.resume_gaps || [],
        bullet_improvements: resumeResult.bullet_improvements || [],
        ats_analysis: resumeResult.ats_analysis || {
          present_keywords: [],
          missing_keywords: parsedJob.ats_keywords || [],
          keyword_density_score: 0,
        },
        readiness_score: resumeResult.readiness_score || {
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
        improved_bullets: (resumeResult.improved_bullets || []).map((b: any) => ({
          original: b.original || '',
          improved: b.improved || b.text || '',
          keywords_added: b.keywords_added || [],
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ats_keywords: (resumeResult as any).ats_keywords || parsedJob.ats_keywords || [],
      },
      recommended_projects: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        projects: (projectsResult.projects || []).map((p: any) => ({
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
        repo_name: (githubTasksResult as any).repo_name || projectsResult.projects?.[0]?.title || 'skill-building-project',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        repo_description: (githubTasksResult as any).repo_description || projectsResult.projects?.[0]?.description || 'A project to build and demonstrate skills',
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
        skills_to_add: (portfolioResult.skills_to_add || []).map((s: any) => ({
          name: s.name,
          category: s.category || 'technical',
          proficiency: s.proficiency || s.level,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bio_suggestion: (portfolioResult as any).bio_suggestion || (portfolioResult as any).bio_update || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        headline_suggestion: (portfolioResult as any).headline_suggestion || (portfolioResult as any).headline_update || null,
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error in generate-all:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
