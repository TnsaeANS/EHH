export interface Position {
    id: number;
    name: string;
    parent_id: number | null;
    parent_name?: string;
  }
  
  export interface PositionNode extends Position {
    children?: PositionNode[];
  }