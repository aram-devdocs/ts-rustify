import { Rustify } from './index';

async function main() {
  const app = new Rustify(3000);

  // Test basic GET endpoint
  app.get('/hello', async (req) => {
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: { message: 'Hello from ts-rustify!' }
    };
  });

  // Test POST endpoint with body parsing
  app.post('/echo', async (req) => {
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: req.body
    };
  });

  console.log('Starting server...');
  await app.start();
}

main().catch(console.error); 