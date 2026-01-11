import { analyzeGitHubData, combineSkills, parseResumeText } from '@/lib/nlp';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume_text, github_username } = body;

    if (!resume_text && !github_username) {
      return NextResponse.json(
        { error: 'Either resume_text or github_username is required' },
        { status: 400 }
      );
    }

    // Parse resume if provided
    let resumeSkills = null;
    if (resume_text) {
      resumeSkills = parseResumeText(resume_text);
    }

    // Analyze GitHub if provided
    let githubData = null;
    if (github_username) {
      try {
        githubData = await analyzeGitHubData(github_username);
      } catch (error) {
        console.warn('GitHub analysis failed:', error);
        // Continue without GitHub data
      }
    }

    // Combine skills from both sources
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let skills: any[] = [];
    if (resumeSkills && githubData) {
      skills = combineSkills(resumeSkills, githubData.skills, 'anonymous');
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
