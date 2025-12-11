import { JSDOM } from 'jsdom';

/**
 * Extracts visible text from HTML content.
 * Removes script tags, style tags, and other non-visible elements.
 * Returns the text content from the body element.
 *
 * @param html - The HTML string to parse
 * @returns The extracted visible text
 */
export function extractTextFromHtml(html: string): string {
  try {
    // Parse the HTML using JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove script, style, noscript, and other non-visible elements
    const elementsToRemove = document.querySelectorAll(
      'script, style, noscript, iframe, svg, canvas'
    );
    elementsToRemove.forEach((el) => el.remove());

    // Get text from body
    const body = document.querySelector('body');
    if (!body) {
      throw new Error('No body element found in HTML');
    }

    // Extract text content
    const text = body.textContent || '';

    // Clean up whitespace
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Normalize newlines
      .trim();
  } catch (error) {
    throw new Error(
      `Failed to extract text from HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validates that a URL is well-formed and uses HTTP/HTTPS protocol
 */
export function validateUrl(urlString: string): URL {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('URL must use HTTP or HTTPS protocol');
    }
    return url;
  } catch (error) {
    throw new Error(
      `Invalid URL: ${error instanceof Error ? error.message : 'Malformed URL'}`
    );
  }
}
