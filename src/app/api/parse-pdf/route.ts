import {
    cleanExtractedText,
    formatResumeForDisplay,
    isTextCorrupted,
    parseResumeText,
} from '@/lib/nlp/resume-parser';
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFParser = require('pdf2json');

/**
 * Safely decode URI-encoded text, handling malformed sequences
 */
function safeDecodeURI(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    // If decodeURIComponent fails, try to clean up the string
    // Replace common problematic sequences
    let cleaned = str
      .replace(/%(?![0-9A-Fa-f]{2})/g, '%25') // Fix standalone %
      .replace(/%[0-9A-Fa-f](?![0-9A-Fa-f])/g, (match) => '%25' + match.slice(1)); // Fix incomplete hex
    
    try {
      return decodeURIComponent(cleaned);
    } catch {
      // Last resort: just return the original string with common replacements
      return str
        .replace(/%20/g, ' ')
        .replace(/%2C/g, ',')
        .replace(/%2E/g, '.')
        .replace(/%3A/g, ':')
        .replace(/%2F/g, '/')
        .replace(/%40/g, '@')
        .replace(/%2B/g, '+')
        .replace(/%23/g, '#')
        .replace(/%26/g, '&')
        .replace(/%3D/g, '=')
        .replace(/%3F/g, '?')
        .replace(/%25/g, '%');
    }
  }
}

/**
 * Extract text from PDF using pdf2json
 */
async function extractPdfText(buffer: Buffer): Promise<{ text: string; pages: number }> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true); // true = suppress warnings
    
    pdfParser.on('pdfParser_dataError', (errData: { parserError: Error }) => {
      console.error('PDF Parse Error:', errData.parserError);
      reject(errData.parserError);
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData: { Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }) => {
      try {
        const pages = pdfData.Pages || [];
        const textParts: string[] = [];
        
        for (const page of pages) {
          const pageTexts: string[] = [];
          for (const textItem of page.Texts || []) {
            for (const run of textItem.R || []) {
              if (run.T) {
                // Safely decode URI-encoded text
                const decoded = safeDecodeURI(run.T);
                if (decoded && decoded.trim()) {
                  pageTexts.push(decoded);
                }
              }
            }
          }
          if (pageTexts.length > 0) {
            textParts.push(pageTexts.join(' '));
          }
        }
        
        const fullText = textParts.join('\n\n');
        console.log('Extracted text length:', fullText.length);
        console.log('First 500 chars:', fullText.substring(0, 500));
        
        resolve({
          text: fullText,
          pages: pages.length
        });
      } catch (err) {
        console.error('Error processing PDF data:', err);
        reject(err);
      }
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF or TXT file.' },
        { status: 400 }
      );
    }

    // For text files, just read the content
    if (file.type === 'text/plain') {
      const rawText = await file.text();
      const parsed = parseResumeText(rawText);
      const displayText = formatResumeForDisplay(parsed);

      return NextResponse.json({
        success: true,
        text: displayText || rawText,
        structured: {
          summary: parsed.summary,
          skills: parsed.skills,
          experience: parsed.experience,
          projects: parsed.projects,
          education: parsed.education,
          certifications: parsed.certifications,
        },
        parseQuality: parsed.parseQuality,
        warnings: parsed.warnings,
        filename: file.name,
        type: file.type,
      });
    }

    // For PDF files
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract text from PDF
      let extractedText = '';
      let pageCount = 0;

      try {
        const result = await extractPdfText(buffer);
        extractedText = result.text;
        pageCount = result.pages;
        
        console.log(`PDF extracted: ${pageCount} pages, ${extractedText.length} chars`);
        
        // Debug: Log first 500 chars
        console.log('First 500 chars:', extractedText.substring(0, 500));
      } catch (pdfError) {
        console.error('PDF parse error:', pdfError);
        return NextResponse.json({
          success: false,
          error: 'Failed to read PDF file. It may be corrupted or encrypted.',
          suggestion: 'Please paste your resume text manually.',
          parseQuality: 'failed',
        }, { status: 422 });
      }

      // Check if we got any text
      if (!extractedText || extractedText.trim().length < 50) {
        return NextResponse.json({
          success: false,
          error: 'Could not extract text from PDF. The PDF may be image-based (scanned).',
          suggestion: 'Please paste your resume text manually or use a text-based PDF.',
          parseQuality: 'failed',
        }, { status: 422 });
      }

      // Clean the extracted text
      const cleanedText = cleanExtractedText(extractedText);

      // Check for corruption
      if (isTextCorrupted(cleanedText)) {
        return NextResponse.json({
          success: false,
          error: 'The extracted text appears to be corrupted or unreadable.',
          suggestion: 'Please paste your resume text manually.',
          parseQuality: 'failed',
        }, { status: 422 });
      }

      // Parse into structured format
      const parsed = parseResumeText(cleanedText);

      // If parsing failed
      if (parsed.parseQuality === 'failed') {
        return NextResponse.json({
          success: false,
          error: parsed.warnings[0] || 'Failed to parse resume content.',
          suggestion: 'Please paste your resume text manually.',
          parseQuality: 'failed',
        }, { status: 422 });
      }

      // Format for display
      const displayText = formatResumeForDisplay(parsed);

      return NextResponse.json({
        success: true,
        text: displayText || parsed.rawText,
        structured: {
          summary: parsed.summary,
          skills: parsed.skills,
          experience: parsed.experience,
          projects: parsed.projects,
          education: parsed.education,
          certifications: parsed.certifications,
        },
        parseQuality: parsed.parseQuality,
        warnings: parsed.warnings,
        filename: file.name,
        type: file.type,
        pageCount,
      });
    }

    return NextResponse.json(
      { error: 'Unsupported file type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error parsing file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse file. Please paste text manually.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
