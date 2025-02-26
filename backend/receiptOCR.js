import { createWorker } from 'tesseract.js';

export function scanReceipt(url)
{
(async () => {
  const worker = await createWorker('eng');
  const ret = await worker.recognize(url);
  await worker.terminate();
  return ret.data.text;
})();
}
