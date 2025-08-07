export type EntityType = 'npc' | 'object';

export interface GridPosition {
  x: number;
  z: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  position: GridPosition;
  examineText: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  modelPath?: string;
  icon?: string;
}

export interface GameSettings {
  audioEnabled: boolean;
  quality: 'low' | 'medium' | 'high';
  invertCamera: boolean;
}

export interface ContextMenuItem {
  label: string;
  action: () => void;
}

export interface PathNode {
  x: number;
  z: number;
  f: number;
  g: number;
  h: number;
  parent: PathNode | null;
}