const SYSTEM_PROMPT = `The document provided may be truncated or have middle sections omitted due to length. Base your analysis on the sections provided. If critical information such as the issuing authority, legal basis, or data scope appears incomplete or missing, add an entry to the red_flags array stating: 'Document truncated — full scope review recommended before compliance action.'

The document provided may be a full legal filing including headers, footers, signature blocks, and boilerplate language. Focus on the operative sections — the request, the legal basis, the scope, and the deadline. Ignore cover pages and standard legal disclaimers.

You are a legal request triage assistant for a compliance operations company that processes high-volume legal requests on behalf of major technology platforms.

Your job is to analyse legal request documents and extract structured triage information to help analysts prioritise and route requests correctly.

Analyse the document provided and return a JSON object with exactly these fields:

{
  "request_type": "One of: Criminal | Civil | DMCA | FISA/NSL | Emergency | Unknown",
  "legal_framework": "The specific legal instrument e.g. ECPA Subpoena, Search Warrant, Court Order, DMCA Subpoena, NSL, FISA Order",
  "issuing_authority": "Name of the issuing agency, court, or party",
  "jurisdiction": "State and/or federal district if identifiable",
  "data_scope": "Summary of what data is being requested",
  "response_deadline": "Deadline stated or implied. Note if California 72-hour law applies.",
  "urgency_level": "One of: Routine | Priority | Emergency",
  "recommended_routing": "One of: Junior Analyst | Senior Analyst | Counsel Only",
  "red_flags": ["Array of specific concerns, or empty array if none"],
  "routing_rationale": "One sentence explaining the routing recommendation"
}

Routing rules you must follow:
- FISA orders and NSLs → always "Counsel Only", urgency "Priority" minimum
- Emergency disclosure requests → always "Emergency" urgency, "Senior Analyst" minimum
- Requests missing legal basis or issuing authority → flag as red flag
- Requests seeking content of communications without a warrant → flag as red flag
- Overbroad requests (no specificity on data scope) → flag as red flag
- DMCA requests → "Junior Analyst" unless complexity warrants escalation

Return ONLY the JSON object. No preamble, no explanation, no markdown.`;

const TRUNCATE_THRESHOLD = 25000;
const MAX_DOCUMENT_LENGTH = 100000;
const MIN_DOCUMENT_LENGTH = 50;
const FETCH_TIMEOUT_MS = 25000;
const MODEL = 'claude-sonnet-4-6';

function truncateDocument(documentText) {
  const start = documentText.slice(0, 20000);
  const end = documentText.slice(-5000);
  const truncated =
    documentText.length > TRUNCATE_THRESHOLD
      ? start + '\n\n[...middle sections omitted for length...]\n\n' + end
      : documentText;
  return { truncated, wasTruncated: documentText.length > TRUNCATE_THRESHOLD };
}

function parseJsonFromResponse(text) {
  const trimmed = (text || '').trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const extracted = trimmed.match(/\{[\s\S]*\}/)?.[0];
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch {
        // fall through to structured error
      }
    }
    return {
      error: true,
      message: 'AI response could not be parsed',
      raw: text,
    };
  }
}

function validateDocumentText(documentText) {
  if (!documentText || typeof documentText !== 'string') {
    return 'documentText is required and must be a string';
  }
  if (documentText.trim().length <= MIN_DOCUMENT_LENGTH) {
    return 'Document text is too short to analyse. Ensure the file contains readable content.';
  }
  if (documentText.length > MAX_DOCUMENT_LENGTH) {
    return `Document exceeds maximum length (${MAX_DOCUMENT_LENGTH.toLocaleString()} characters).`;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
    }

    const { documentText } = req.body || {};
    const validationError = validateDocumentText(documentText);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { truncated: truncatedText } = truncateDocument(documentText);

    let response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Analyse the following legal request document:\n\n${truncatedText}`,
            },
          ],
        }),
      });
    } catch (fetchErr) {
      if (fetchErr.name === 'AbortError') {
        return res.status(504).json({
          error:
            'Analysis timed out — document may be too long. Try uploading fewer pages.',
        });
      }
      throw fetchErr;
    }

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(500).json({ error: 'Failed to analyse document with AI service' });
    }

    const data = await response.json();
    const content = data.content?.find((block) => block.type === 'text')?.text;

    if (!content) {
      return res.status(500).json({ error: 'Empty response from AI service' });
    }

    const triage = parseJsonFromResponse(content);

    if (triage.error === true) {
      return res.status(500).json(triage);
    }

    if (documentText.length > TRUNCATE_THRESHOLD) {
      triage.truncated = true;
    }
    return res.status(200).json(triage);
  } catch (err) {
    console.error('Analyse error:', err);
    return res.status(500).json({
      error: err.message || 'An unexpected error occurred during analysis',
    });
  } finally {
    clearTimeout(timeout);
  }
}
