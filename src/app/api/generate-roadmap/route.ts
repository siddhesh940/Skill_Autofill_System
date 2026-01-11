import { generateRoadmap } from '@/lib/nlp';
import type { MissingSkill } from '@/types';
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
    
    const { missing_skills, available_hours_per_week } = body as {
      missing_skills: MissingSkill[];
      available_hours_per_week?: number;
    };

    if (!missing_skills || !Array.isArray(missing_skills)) {
      return NextResponse.json(
        { error: 'Skills data is required' },
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
      { error: 'Roadmap generation could not be completed. Please try again.' },
      { status: 500 }
    );
  }
}
