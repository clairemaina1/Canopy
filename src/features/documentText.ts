export async function extractDocumentText(file: File, updateStatus: (status: string) => void) {
  const fileName = file.name.toLowerCase();
  const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');
  const isText = file.type.startsWith('text/') || /\.(txt|md|csv)$/i.test(fileName);
  if (isText) return file.text();
  if (file.type.startsWith('image/')) return extractImageText(file, updateStatus);
  if (isPdf) return extractPdfText(file, updateStatus);
  throw new Error('Choose a text, PDF, or image file.');
}

async function extractPdfText(file: File, updateStatus: (status: string) => void) {
  const [pdfjs, workerUrl] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.default;
  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  const textPages = Math.min(document.numPages, 30);
  for (let pageNumber = 1; pageNumber <= textPages; pageNumber += 1) {
    updateStatus(`Reading PDF text · page ${pageNumber} of ${textPages}…`);
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => {
      if (!('str' in item) || typeof item.str !== 'string') return '';
      return `${item.str}${'hasEOL' in item && item.hasEOL ? '\n' : ' '}`;
    }).join('').trim());
  }
  const extracted = pages.join('\n').trim();
  if (extracted.length >= 30) return extracted;

  const { createWorker } = await import('tesseract.js');
  const ocrWorker = await createWorker('eng', 1, {
    logger: (message) => updateStatus(`Reading scanned PDF · ${Math.round(message.progress * 100)}%`),
  });
  const scannedPages: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= Math.min(document.numPages, 8); pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = window.document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('The browser could not create a canvas for scanned PDF text.');
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const result = await ocrWorker.recognize(canvas);
      scannedPages.push(result.data.text);
    }
  } finally {
    await ocrWorker.terminate();
  }
  return scannedPages.join('\n').trim() || extracted;
}

async function extractImageText(file: File, updateStatus: (status: string) => void) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, {
    logger: (message) => updateStatus(`Reading image · ${Math.round(message.progress * 100)}%`),
  });
  try {
    const result = await worker.recognize(file);
    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}
