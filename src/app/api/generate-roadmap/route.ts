import { generateRoadmap } from '@/lib/nlp';
import type { MissingSkill } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { missing_skills, available_hours_per_week } = body as {
      missing_skills: MissingSkill[];
      available_hours_per_week?: number;
    };

    if (!missing_skills || !Array.isArray(missing_skills)) {
      return NextResponse.json(
        { error: 'missing_skills array is required' },
        { status: 400 }
      );
    }

    // Generate learning roadmap
    const roadmap = generateRoadmap(
      missing_skills,
      available_hours_per_week || 10
    );

    return NextResponse.json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
