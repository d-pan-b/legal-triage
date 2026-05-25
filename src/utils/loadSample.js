import { extractTextFromPdfBuffer } from './extractText';

const sampleUrls = import.meta.glob('../samples/*.pdf', {
  query: '?url',
  import: 'default',
  eager: true,
});

export async function loadSamplePdf(fileName) {
  const url = sampleUrls[`../samples/${fileName}`];
  if (!url) {
    throw new Error('Sample document not found');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load sample document');
  }

  const arrayBuffer = await response.arrayBuffer();
  const text = await extractTextFromPdfBuffer(arrayBuffer);
  const cleaned = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { text: cleaned };
}
