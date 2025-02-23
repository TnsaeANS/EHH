import { Hono } from 'hono';
import postgres from 'postgres';
import "dotenv/config";

const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

try {
  const result = await sql`SELECT * FROM employee_positions`;
  console.log('Database connection test successful:', result);
} catch (error) {
  console.error('Database connection test failed:', error);
}

const positions = new Hono();


positions.get('/', async (c) => {
  try {
    const positions = await sql`
      WITH RECURSIVE position_hierarchy AS (
        SELECT id, name, parent_id, 1 AS level
        FROM employee_positions
        WHERE parent_id IS NULL
        UNION ALL
        SELECT ep.id, ep.name, ep.parent_id, ph.level + 1
        FROM employee_positions ep
        INNER JOIN position_hierarchy ph ON ph.id = ep.parent_id
        WHERE ph.level < 10 -- Limit recursion to 10 levels
      )
      SELECT * FROM position_hierarchy;
    `;
    return c.json(positions);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Error fetching positions' }, 500);
  }
});

positions.post('/', async (c) => {
  const { name, parent_id } = await c.req.json();

  if (!name) {
    return c.json({ error: 'Position name is required' }, 400);
  }

  try {
    const result = await sql`
      INSERT INTO employee_positions (name, parent_id) 
      VALUES (${name}, ${parent_id || null})
      RETURNING id, name, parent_id;
    `;
    return c.json(result[0], 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Error creating position' }, 500);
  }
});

positions.put('/:id', async (c) => {
  const id = c.req.param("id");
  const { name, parent_id } = await c.req.json();

  try {
    const result = await sql`
      UPDATE employee_positions
      SET name = ${name}, parent_id = ${parent_id || null}
      WHERE id = ${id}
      RETURNING id, name, parent_id;
    `;

    if (result.length === 0) {
      return c.json({ error: 'Position not found' }, 404);
    }

    return c.json(result[0]);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Error updating position' }, 500);
  }
});


positions.delete('/:id', async (c) => {
  const id = c.req.param("id");

  try {
    const result = await sql`
      DELETE FROM employee_positions WHERE id = ${id}
      RETURNING id;
    `;

    if (result.length === 0) {
      return c.json({ error: 'Position not found' }, 404);
    }

    return c.json({ message: 'Position deleted successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Error deleting position' }, 500);
  }
});

export default positions;
