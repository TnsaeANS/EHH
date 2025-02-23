import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import positions from './routes/positions.js';

const app = new Hono();

app.route('/positions', positions);

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
