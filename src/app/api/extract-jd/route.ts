import { extractJobDescription, scrapeJobUrl } from '@/lib/nlp';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, url } = body;

    if (!text && !url) {
      return NextResponse.json(
        { error: 'Either text or url is required' },
        { status: 400 }
      );
    }

    let rawText = text;

    // If URL provided, scrape it first
    if (url && !text) {
      try {
        rawText = await scrapeJobUrl(url);
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${error}` },
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
