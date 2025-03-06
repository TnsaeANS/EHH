import { Hono } from 'hono';
import { PositionService } from '../services/positionService.js';
import { buildHierarchy } from '../utils/hierarchyUtils.js';

const positions = new Hono();
const positionService = new PositionService();

positions.get('/', async (c) => {
  try {
    // Fetch all positions
    const positions = await positionService.getAllPositions();
    console.log('Positions from database:', positions); // Debug log

    // Build the hierarchy
    const hierarchy = buildHierarchy(positions);

    // Return the hierarchical data
    return c.json({ hierarchy });
  } catch (error) {
    console.error('Error in GET /positions:', error);
    return c.json({ error: 'Error fetching positions' }, 500);
  }
});

positions.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const position = await positionService.getPositionById(id);

    return c.json(position);
  } catch (error) {
    console.error('Error in GET /positions/:id:', error);
    return c.json({ error: 'Error fetching position' }, 500);
  }
});

positions.post('/', async (c) => {
  const { name, parent_id } = await c.req.json();

  if (!name) {
    return c.json({ error: 'Position name is required' }, 400);
  }

  try {
    const result = await positionService.createPosition(name, parent_id || null);
    return c.json(result, 201);
  } catch (error) {
    console.error('Error in POST /positions:', error);
    return c.json({ error: 'Error creating position' }, 500);
  }
});

positions.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { name, parent_id } = await c.req.json();

  try {
    const result = await positionService.updatePosition(id, name, parent_id || null);
    if (!result) {
      return c.json({ error: 'Position not found' }, 404);
    }
    return c.json(result);
  } catch (error) {
    console.error('Error in PUT /positions/:id:', error);
    return c.json({ error: 'Error updating position' }, 500);
  }
});

// Delete the parent and its children
positions.delete('/:id/delete-all', async (c) => {
  const id = parseInt(c.req.param('id'), 10);

  try {
    await positionService.deleteAllPositions(id);
    return c.json({ message: 'Parent and all its children deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /positions/:id/delete-all:', error);
    return c.json({ error: 'Error deleting parent and children' }, 500);
  }
});

// Delete the parent only and make its children fathers
positions.patch('/:id/make-fathers', async (c) => {
  const id = parseInt(c.req.param('id'), 10);

  try {
    await positionService.makeChildrenFathers(id);
    return c.json({ message: 'Parent deleted and children are now null' });
  } catch (error) {
    console.error('Error in PATCH /positions/:id/make-fathers:', error);
    return c.json({ error: 'Error making children parents' }, 500);
  }
});

positions.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);

  try {
    const success = await positionService.deletePosition(id);
    if (!success) {
      return c.json({ error: 'Position not found' }, 404);
    }
    return c.json({ message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /positions/:id:', error);
    return c.json({ error: 'Error deleting position' }, 500);
  }
});

export default positions;