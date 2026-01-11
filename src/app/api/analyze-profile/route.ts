import { combineSkills, parseResumeText } from '@/lib/nlp';
import { fetchCompleteGitHubProfile } from '@/services/github';
import { NextRequest, NextResponse } from 'next/server';

// Vercel serverless configuration
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { resume_text, github_username } = body as {
      resume_text?: string;
      github_username?: string;
    };

    if (!resume_text && !github_username) {
      return NextResponse.json(
        { error: 'Please provide resume text or GitHub username' },
        { status: 400 }
      );
    }

    // Parse resume if provided
    let resumeSkills = null;
    if (resume_text) {
      try {
        resumeSkills = parseResumeText(resume_text as string);
      } catch (error) {
        console.warn('Resume parsing failed:', error);
        // Continue without resume skills
      }
    }

    // Fetch and analyze GitHub if provided
    let githubData = null;
    if (github_username) {
      try {
        const profile = await fetchCompleteGitHubProfile(github_username as string);
        if (profile) {
          githubData = {
            skills: profile.skills.map(s => ({ name: s, category: 'technical', proficiency: 'intermediate' })),
            repos: profile.repos,
            languages: profile.topLanguages,
          };
        }
      } catch (error) {
        console.warn('GitHub analysis skipped:', error);
        // Continue without GitHub data
      }
    }

    // Combine skills from both sources
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let skills: any[] = [];
    if (resumeSkills && githubData) {
      // Merge skills, preferring resume skills but adding GitHub skills
      const skillNames = new Set(resumeSkills.map((s: { canonical?: string; skill?: string }) => s.canonical || s.skill));
      skills = [
        ...resumeSkills,
        ...githubData.skills.filter((s: { name: string }) => !skillNames.has(s.name))
      ];
    } else if (resumeSkills) {
      skills = resumeSkills;
    } else if (githubData) {
      skills = githubData.skills;
    }

    return NextResponse.json({
      success: true,
      data: {
        skills,
        github_data: githubData,
        source: {
          resume: !!resume_text,
          github: !!githubData,
        },
      },
    });
  } catch (error) {
    console.error('Error analyzing profile:', error);
    return NextResponse.json(
      { error: 'Profile analysis could not be completed. Please try again.' },
      { status: 500 }
    );
  }
}
