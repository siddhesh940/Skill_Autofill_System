import {
    cleanExtractedText,
    formatResumeForDisplay,
    isTextCorrupted,
    parseResumeText,
} from '@/lib/nlp/resume-parser';
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFParser = require('pdf2json');

// Vercel serverless max execution time
export const maxDuration = 60; // 60 seconds

// Maximum file size (8MB - safe for Vercel)
const MAX_FILE_SIZE = 8 * 1024 * 1024;

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
 * Extract text from PDF using pdf2json with timeout protection
 */
async function extractPdfText(buffer: Buffer): Promise<{ text: string; pages: number }> {
  return new Promise((resolve, reject) => {
    // Timeout protection - 30 seconds max for PDF parsing
    const timeout = setTimeout(() => {
      reject(new Error('PDF parsing timed out'));
    }, 30000);

    const pdfParser = new PDFParser(null, true); // true = suppress warnings
    
    pdfParser.on('pdfParser_dataError', (errData: { parserError: Error }) => {
      clearTimeout(timeout);
      console.error('PDF Parse Error:', errData.parserError);
      reject(errData.parserError);
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData: { Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }) => {
      clearTimeout(timeout);
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
    // Check content-length header first (before reading body)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File is too large. Please use a file smaller than 8MB.',
          suggestion: 'Try compressing your PDF or paste your resume text directly.',
          parseQuality: 'failed'
        },
        { status: 413 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('FormData parsing error:', formError);
      return NextResponse.json(
        { 
          error: 'Could not process the uploaded file.',
          suggestion: 'Please paste your resume text directly instead.',
          parseQuality: 'failed'
        },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { 
          error: 'No file received.',
          suggestion: 'Please select a file and try again.',
          parseQuality: 'failed'
        },
        { status: 400 }
      );
    }

    // Verify file size again (mobile browsers sometimes don't report content-length correctly)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File is too large. Please use a file smaller than 8MB.',
          suggestion: 'Try compressing your PDF or paste your resume text directly.',
          parseQuality: 'failed'
        },
        { status: 413 }
      );
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    // Be more lenient with MIME types (mobile browsers can be inconsistent)
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidExtension = fileExtension === 'pdf' || fileExtension === 'txt';
    
    if (!allowedTypes.includes(file.type) && !isValidExtension) {
      return NextResponse.json(
        { 
          error: 'Please upload a PDF or TXT file.',
          suggestion: 'Only .pdf and .txt files are supported.',
          parseQuality: 'failed'
        },
        { status: 400 }
      );
    }

    // For text files, just read the content
    if (file.type === 'text/plain' || fileExtension === 'txt') {
      let rawText: string;
      try {
        rawText = await file.text();
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Could not read the text file.',
          suggestion: 'Please paste your resume text directly.',
          parseQuality: 'failed',
        }, { status: 422 });
      }
      
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
    if (file.type === 'application/pdf' || fileExtension === 'pdf') {
      let arrayBuffer: ArrayBuffer;
      try {
        arrayBuffer = await file.arrayBuffer();
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Could not read the PDF file.',
          suggestion: 'Please paste your resume text directly.',
          parseQuality: 'failed',
        }, { status: 422 });
      }
      
      const buffer = Buffer.from(arrayBuffer);

      // Extract text from PDF
      let extractedText = '';
      let pageCount = 0;

      try {
        const result = await extractPdfText(buffer);
        extractedText = result.text;
        pageCount = result.pages;
      } catch (pdfError) {
        console.error('PDF parse error:', pdfError);
        // Don't expose internal error - provide user-friendly message
        return NextResponse.json({
          success: false,
          error: 'Could not read this PDF file.',
          suggestion: 'Please paste your resume text directly instead.',
          parseQuality: 'failed',
        }, { status: 422 });
      }

      // Check if we got any text - be more lenient (30 chars minimum)
      if (!extractedText || extractedText.trim().length < 30) {
        return NextResponse.json({
          success: false,
          error: 'This PDF appears to be image-based (scanned).',
          suggestion: 'Please paste your resume text directly instead.',
          parseQuality: 'failed',
        }, { status: 422 });
      }

      // Clean the extracted text
      const cleanedText = cleanExtractedText(extractedText);

      // Check for corruption - but be lenient for partial extractions
      if (isTextCorrupted(cleanedText)) {
        // Try to salvage what we can instead of failing completely
        const salvaged = cleanedText
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (salvaged.length > 50) {
          // Use salvaged text but warn user
          return NextResponse.json({
            success: true,
            text: salvaged,
            structured: {
              summary: '',
              skills: [],
              experience: [],
              projects: [],
              education: [],
              certifications: [],
            },
            parseQuality: 'partial',
            warnings: ['Some content may not have been extracted correctly. Please review and edit as needed.'],
            filename: file.name,
            type: file.type,
            pageCount,
          });
        }
        
        return NextResponse.json({
          success: false,
          error: 'The PDF text could not be read properly.',
          suggestion: 'Please paste your resume text directly instead.',
          parseQuality: 'failed',
        }, { status: 422 });
      }

      // Parse into structured format
      const parsed = parseResumeText(cleanedText);

      // If parsing failed completely, still return the raw text so user can edit it
      if (parsed.parseQuality === 'failed') {
        // Return partial success with raw text
        return NextResponse.json({
          success: true,
          text: cleanedText,
          structured: {
            summary: '',
            skills: [],
            experience: [],
            projects: [],
            education: [],
            certifications: [],
          },
          parseQuality: 'partial',
          warnings: ['Resume structure could not be detected. Please review the extracted text above.'],
          filename: file.name,
          type: file.type,
          pageCount,
        });
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
      { 
        error: 'Please upload a PDF or TXT file.',
        suggestion: 'Only .pdf and .txt files are supported.',
        parseQuality: 'failed'
      },
      { status: 400 }
    );

  } catch (error) {
    // Log for debugging but never expose to user
    console.error('Error parsing file:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Always return user-friendly error - never expose internal details
    return NextResponse.json(
      { 
        error: 'File processing encountered an issue.',
        suggestion: 'Please paste your resume text directly instead.',
        parseQuality: 'failed'
      },
      { status: 500 }
    );
  }
}
