import type { Position, PositionNode } from '../types/positionTypes.js';

export function buildHierarchy(positions: Position[]): PositionNode[] {
  const positionMap: Record<number, PositionNode> = {};

  // Create a map of positions
  positions.forEach((position) => {
    positionMap[position.id] = { ...position, children: [] };
  });

  // Build the hierarchy
  const hierarchy: PositionNode[] = [];
  positions.forEach((position) => {
    if (position.parent_id === null) {
      hierarchy.push(positionMap[position.id]);
    } else {
      // Ensure the parent exists in the map
      if (positionMap[position.parent_id]) {
        positionMap[position.parent_id].children?.push(positionMap[position.id]);
      }
    }
  });

  console.log('Hierarchy:', JSON.stringify(hierarchy, null, 2)); // Debug log
  return hierarchy;
}