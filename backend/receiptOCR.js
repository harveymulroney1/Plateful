import { createWorker } from 'tesseract.js';

export async function processReceipt(imagePath){
  const worker = await createWorker('eng');
  const ret = await worker.recognize(imagePath);
  await worker.terminate();
  return (ret.data.text);
  
};