/* Reading a CV file in the browser, ported from the prototype.
   .docx is a zip holding word/document.xml; DecompressionStream is native in
   current browsers, so no library is needed. .txt/.md are plain. PDFs go to
   the API (pdf-parse) and are rejected here. */

const xmlToText = (xml: string) => xml
  .replace(/<w:p[ >][^]*?(?=<w:p[ >]|$)|<w:p\/>/g, (m) => m.replace(/<[^>]+>/g, '') + '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\n{3,}/g, '\n\n');

interface ZipEntry { method: number; csize: number; lho: number }

function zipEntry(buf: ArrayBuffer, want: string): ZipEntry {
  const dv = new DataView(buf), n = buf.byteLength, dec = new TextDecoder();
  let eocd = -1;
  for (let i = n - 22; i >= Math.max(0, n - 66000); i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
  if (eocd < 0) throw new Error('bad-docx');
  const count = dv.getUint16(eocd + 10, true);
  let off = dv.getUint32(eocd + 16, true);
  if (off === 0xffffffff) throw new Error('bad-docx');
  for (let i = 0; i < count; i++) {
    if (off + 46 > n || dv.getUint32(off, true) !== 0x02014b50) throw new Error('bad-docx');
    const method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true);
    const nameLen = dv.getUint16(off + 28, true), extraLen = dv.getUint16(off + 30, true), cmtLen = dv.getUint16(off + 32, true);
    const lho = dv.getUint32(off + 42, true);
    if (dec.decode(new Uint8Array(buf, off + 46, nameLen)) === want) return { method, csize, lho };
    off += 46 + nameLen + extraLen + cmtLen;
  }
  throw new Error('bad-docx');
}

function zipRead(buf: ArrayBuffer, e: ZipEntry): Promise<string> {
  const dv = new DataView(buf);
  if (dv.getUint32(e.lho, true) !== 0x04034b50) throw new Error('bad-docx');
  const start = e.lho + 30 + dv.getUint16(e.lho + 26, true) + dv.getUint16(e.lho + 28, true);
  const bytes = buf.slice(start, start + e.csize);
  if (e.method === 0) return Promise.resolve(new TextDecoder().decode(bytes));
  if (e.method !== 8 || typeof DecompressionStream === 'undefined') throw new Error('bad-docx');
  return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
}

export const readDocx = (file: File) =>
  file.arrayBuffer().then((buf) => zipRead(buf, zipEntry(buf, 'word/document.xml')).then(xmlToText));

export const readTxt = (file: File) => file.text();

export type CvSource = 'docx' | 'txt';

export function readCV(file: File): Promise<{ text: string; src: CvSource }> {
  const n = (file.name || '').toLowerCase();
  if (n.endsWith('.docx')) return readDocx(file).then((text) => ({ text, src: 'docx' as const }));
  if (n.endsWith('.txt') || n.endsWith('.md')) return readTxt(file).then((text) => ({ text, src: 'txt' as const }));
  if (n.endsWith('.pdf')) return Promise.reject(new Error('pdf'));
  if (n.endsWith('.doc')) return Promise.reject(new Error('old-doc'));
  return Promise.reject(new Error('type'));
}

export const READ_ERRORS: Record<string, string> = {
  pdf: 'PDFs are analysed by the AI reader. Upload it in the box above.',
  'old-doc': 'That’s an old .doc file. Save it as .docx in Word, or paste the text below.',
  'bad-docx': 'That file didn’t open as a Word document. Try saving it again as .docx, or paste the text below.',
  type: 'Use a PDF, .docx or .txt file, or paste your CV text below.',
  unknown: 'That file wouldn’t open. Paste your CV text into the box below instead.',
  slow: 'Reading that file is taking too long. Paste your CV text into the box below instead.',
};

export const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('slow')), ms))]);
