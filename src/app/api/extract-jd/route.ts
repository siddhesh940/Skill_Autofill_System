import { extractJobDescription, scrapeJobUrl } from '@/lib/nlp';
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
    
    const { text, url } = body as { text?: string; url?: string };

    if (!text && !url) {
      return NextResponse.json(
        { error: 'Please provide job description text or URL' },
        { status: 400 }
      );
    }

    let rawText = text || '';

    // If URL provided, scrape it first
    if (url && !text) {
      try {
        rawText = await scrapeJobUrl(url);
      } catch (error) {
        console.warn('URL scraping failed:', error);
        return NextResponse.json(
          { error: 'Could not fetch job posting from URL. Please paste the job description directly.' },
          { status: 400 }
        );
      }
    }

    // Extract structured data from JD text
    const parsedJob = extractJobDescription(rawText);

    return NextResponse.json({
      success: true,
      data: parsedJob,
    });
  } catch (error) {
    console.error('Error extracting JD:', error);
    return NextResponse.json(
      { error: 'Could not process job description. Please try again.' },
      { status: 500 }
    );
  }
}
