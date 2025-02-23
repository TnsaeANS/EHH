export interface Position {
    id: number;
    name: string;
    parent_id: number | null;
  }
  
  export interface PositionNode extends Position {
    children?: PositionNode[];
  }