import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase();

  let text = '';
  if (ext === 'pdf') {
    text = await extractPdf(file);
  } else if (ext === 'docx') {
    text = await extractDocx(file);
  } else if (ext === 'txt') {
    text = await extractTxt(file);
  } else {
    throw new Error('Unsupported file type. Please upload .pdf, .docx, or .txt');
  }

  return normalizeText(text);
}

export async function extractTextFromPdfBuffer(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    pages.push(pageText);
  }

  return pages.join('\n\n');
}

async function extractPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  return extractTextFromPdfBuffer(arrayBuffer);
}

async function extractDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function extractTxt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

function normalizeText(text) {
  const cleaned = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { text: cleaned };
}
