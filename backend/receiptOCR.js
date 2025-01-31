import { createWorker } from 'tesseract.js';

(async () => {
  const worker = await createWorker('eng');
  const ret = await worker.recognize('C:/Users/harvey/Desktop/201Project/PlateFul/assets/images/users/receiptTest.jpeg');
  console.log(ret.data.text);
  await worker.terminate();
})();