import { analyzeSkillGap, summarizeSkillGap } from '@/lib/nlp';
import type { ParsedJobDescription, UserSkill } from '@/types';
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
    
    const { parsed_job, user_skills } = body as {
      parsed_job: ParsedJobDescription;
      user_skills: UserSkill[];
    };

    if (!parsed_job) {
      return NextResponse.json(
        { error: 'Job description data is required' },
        { status: 400 }
      );
    }

    if (!user_skills || !Array.isArray(user_skills)) {
      return NextResponse.json(
        { error: 'Skills data is required' },
        { status: 400 }
      );
    }

    // Perform skill gap analysis
    const skillGap = analyzeSkillGap(parsed_job, user_skills);
    
    // Generate summary
    const summary = summarizeSkillGap(skillGap);

    return NextResponse.json({
      success: true,
      data: {
        skill_gap: skillGap,
        summary,
      },
    });
  } catch (error) {
    console.error('Error analyzing skill gap:', error);
    return NextResponse.json(
      { error: 'Skill analysis could not be completed. Please try again.' },
      { status: 500 }
    );
  }
}
