import { analyzeSkillGap, summarizeSkillGap } from '@/lib/nlp';
import type { ParsedJobDescription, UserSkill } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parsed_job, user_skills } = body as {
      parsed_job: ParsedJobDescription;
      user_skills: UserSkill[];
    };

    if (!parsed_job) {
      return NextResponse.json(
        { error: 'parsed_job is required' },
        { status: 400 }
      );
    }

    if (!user_skills || !Array.isArray(user_skills)) {
      return NextResponse.json(
        { error: 'user_skills array is required' },
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
