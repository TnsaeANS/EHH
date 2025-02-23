// src/services/positionService.ts

import postgres from 'postgres';
import type { Position, PositionNode } from '../types/positionTypes.js';
import 'dotenv/config';


const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export class PositionService {
  // Fetch all positions from the database
  async getAllPositions(): Promise<Position[]> {
    const positions = await sql<Position[]>`
      SELECT id, name, parent_id
      FROM employee_positions
      ORDER BY parent_id NULLS FIRST; -- Ensure parents are processed first
    `;
    return positions;
  }

  // Fetch positions with a recursive hierarchy
  async getPositionHierarchy(): Promise<Position[]> {
    const positions = await sql<Position[]>`
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
    return positions;
  }

  // Insert a new position
  async createPosition(name: string, parent_id: number | null): Promise<Position> {
    const result = await sql<Position[]>`
      INSERT INTO employee_positions (name, parent_id) 
      VALUES (${name}, ${parent_id || null})
      RETURNING id, name, parent_id;
    `;
    return result[0];
  }

  // Update an existing position
  async updatePosition(id: number, name: string, parent_id: number | null): Promise<Position | null> {
    const result = await sql<Position[]>`
      UPDATE employee_positions
      SET name = ${name}, parent_id = ${parent_id || null}
      WHERE id = ${id}
      RETURNING id, name, parent_id;
    `;
    return result.length > 0 ? result[0] : null;
  }

  // Delete a position
  async deletePosition(id: number): Promise<boolean> {
    const result = await sql`
      DELETE FROM employee_positions WHERE id = ${id}
      RETURNING id;
    `;
    return result.length > 0;
  }
}