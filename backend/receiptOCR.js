import { createWorker } from 'tesseract.js';

(async () => {
  const worker = await createWorker('eng');
  const ret = await worker.recognize('C:/Users/harvey/Desktop/201Project/PlateFul/assets/receipts/test2.jpg');
  console.log(ret.data.text);
  await worker.terminate();
})();