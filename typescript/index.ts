import { Worker } from 'worker_threads';
import { RustifyServer } from '../index';

export interface Request {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: any;
}

export interface Response {
  status: number;
  headers: Record<string, string>;
  body: any;
}

export type RequestHandler = (req: Request) => Promise<Response> | Response;

export class Rustify {
  private server: RustifyServer;
  private workers: Worker[] = [];
  private readonly port: number;

  constructor(port: number = 3000, workerCount: number = 4) {
    this.port = port;
    this.server = new RustifyServer(port);
    
    // Initialize workers
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker('./dist/worker.js');
      this.workers.push(worker);
    }
  }

  public get(path: string, handler: RequestHandler) {
    return this.addRoute('GET', path, handler);
  }

  public post(path: string, handler: RequestHandler) {
    return this.addRoute('POST', path, handler);
  }

  private async addRoute(method: string, path: string, handler: RequestHandler) {
    await this.server.addRoute(path, async (req: Request) => {
      // Distribute requests across workers
      const worker = this.workers[Math.floor(Math.random() * this.workers.length)];
      return new Promise((resolve) => {
        worker.postMessage({ req, handler: handler.toString() });
        worker.once('message', resolve);
      });
    });
  }

  public async start() {
    await this.server.start();
    console.log(`Server running on port ${this.port}`);
  }
} 