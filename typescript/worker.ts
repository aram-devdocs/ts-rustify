import { parentPort } from 'worker_threads';
import type { Request, Response } from './index';

if (!parentPort) {
  throw new Error('This module must be run as a worker thread');
}

parentPort.on('message', async ({ req, handler }: { req: Request; handler: string }) => {
  try {
    // eslint-disable-next-line no-eval
    const handlerFn = eval(`(${handler})`);
    const response = await handlerFn(req);
    parentPort?.postMessage(response);
  } catch (error) {
    parentPort?.postMessage({
      status: 500,
      headers: {},
      body: 'Internal Server Error'
    });
  }
}); 