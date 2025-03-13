// src/services/positionService.ts

import { db } from '../db/index.js'; // Adjust the import to reference the index file
import { positionSchema } from '../db/schema.js';
import type { Position } from '../types/positionTypes.js'; // Adjust the import path as necessary
import { eq } from "drizzle-orm";

export class PositionService {
  // Fetch all positions from the database
  async getAllPositions(): Promise<Position[]> {
    const positions = await db.select().from(positionSchema).execute();
    return positions;
  }

  // Fetch a position by ID
  async getPositionById(id: number): Promise<Position | null> {
    const positions = await db
      .select()
      .from(positionSchema)
      .where(eq(positionSchema.id, id))
      .execute();
    return positions.length > 0 ? positions[0] : null;
  }

  // Insert a new position
  async createPosition(name: string, parent_id: number | null): Promise<Position> {
    const result = await db
      .insert(positionSchema)
      .values({ name, parent_id })
      .returning({
        id: positionSchema.id,
        name: positionSchema.name,
        parent_id: positionSchema.parent_id
      })
      .execute();
    return result[0];
  }

  // Update an existing position
  async updatePosition(id: number, name: string, parent_id: number | null): Promise<Position | null> {
    const [result] = await db
      .update(positionSchema)
      .set({ name, parent_id })
      .where(eq(positionSchema.id, id))
      .returning({
        id: positionSchema.id,
        name: positionSchema.name,
        parent_id: positionSchema.parent_id
      })
      .execute();
    return result || null;
  }
  // Delete a position
  async deletePosition(id: number): Promise<boolean> {
    const result = await db
      .delete(positionSchema)
      .where(eq(positionSchema.id, id))
      .returning({ id: positionSchema.id},)
      .execute();
    return result.length > 0;
  }

  async deleteAllPositions(id: number): Promise<void> {
    // Fetch all children of the parent recursively
    const children = await this.getAllChildren(id);
  
    // Delete all children first
    for (const child of children) {
      await this.deleteAllPositions(child.id);
    }
  
    // Delete the parent
    await db
      .delete(positionSchema)
      .where(eq(positionSchema.id, id))
      .execute();
await this.getHierarchy();
  }
  
  private async getAllChildren(parentId: number): Promise<any[]> {
    return await db
      .select()
      .from(positionSchema)
      .where(eq(positionSchema.parent_id, parentId))
      .execute();
  }

  async makeChildrenFathers(parentId: number): Promise<any> {
    // Update children to have no parent
    await db
      .update(positionSchema)
      .set({ parent_id: null })
      .where(eq(positionSchema.parent_id, parentId))
      .execute();
  
    // Delete the parent
    await db
      .delete(positionSchema)
      .where(eq(positionSchema.id, parentId))
      .execute();
  
    // Fetch and return the updated hierarchy
    const updatedHierarchy = await this.getHierarchy();
    return updatedHierarchy;
  }
  
  private async getHierarchy(): Promise<any[]> {
    // Fetch the entire hierarchy from the database
    return await db
      .select()
      .from(positionSchema)
      .execute();
  }
}
