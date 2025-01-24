import init, { RustifyServer } from "../ts-wrapper";

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
  private readonly port: number;

  constructor(port: number = 3000) {
    this.port = port;
    this.server = new RustifyServer(port);
  }

  public async get(path: string, handler: RequestHandler) {
    await this.server.add_route(path, "GET", handler);
  }

  public async post(path: string, handler: RequestHandler) {
    await this.server.add_route(path, "POST", handler);
  }

  public async start() {
    // Initialize WebAssembly module
    await init();
    console.log(`Server running on port ${this.port}`);
  }
}
