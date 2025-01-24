import { Rustify } from './index';

const app = new Rustify(3000);

app.get('/hello', async (req) => {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: { message: 'Hello from ts-rustify!' }
  };
});

app.start().catch(console.error); 