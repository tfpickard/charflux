import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromHtml, validateUrl } from '@/lib/htmlExtract';
import { sanitizeText } from '@/lib/text';

/**
 * API Route: Fetch and extract text from a URL
 *
 * This route runs on the Node.js runtime (not Edge) because we use JSDOM for HTML parsing.
 * JSDOM requires Node.js APIs and is not compatible with the Edge runtime.
 *
 * Usage: GET /api/fetch-text?url=https://example.com
 */
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get URL from query parameters
    const searchParams = request.nextUrl.searchParams;
    const urlParam = searchParams.get('url');

    if (!urlParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: url' },
        { status: 400 }
      );
    }

    // Validate URL
    let validatedUrl: URL;
    try {
      validatedUrl = validateUrl(urlParam);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid URL' },
        { status: 400 }
      );
    }

    // Fetch the HTML content
    let html: string;
    try {
      const response = await fetch(validatedUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ASCIIFluidBot/1.0)',
        },
        // Set a reasonable timeout
        signal: AbortSignal.timeout(10000), // 10 seconds
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      html = await response.text();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout: The URL took too long to respond' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        {
          error: `Failed to fetch URL: ${error instanceof Error ? error.message : 'Network error'}`,
        },
        { status: 502 }
      );
    }

    // Extract text from HTML
    let extractedText: string;
    try {
      extractedText = extractTextFromHtml(html);
    } catch (error) {
      return NextResponse.json(
        {
          error: `Failed to parse HTML: ${error instanceof Error ? error.message : 'Parsing error'}`,
        },
        { status: 422 }
      );
    }

    // Sanitize and limit text
    const sanitizedText = sanitizeText(extractedText);

    if (!sanitizedText || sanitizedText.length === 0) {
      return NextResponse.json(
        { error: 'No text content found at the provided URL' },
        { status: 422 }
      );
    }

    // Return the extracted text
    return NextResponse.json({ text: sanitizedText });
  } catch (error) {
    console.error('Unexpected error in fetch-text API:', error);
    return NextResponse.json(
      {
        error: `Unexpected server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
