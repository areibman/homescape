import { Vector3 } from '@babylonjs/core';

export interface PlayerState {
  position: Vector3;
  targetPosition: Vector3 | null;
  isMoving: boolean;
  gridPosition: [number, number];
}

export interface CameraState {
  alpha: number;
  beta: number;
  radius: number;
  target: Vector3;
}

export interface InteractionTarget {
  id: string;
  type: 'npc' | 'object';
  position: Vector3;
  mesh: unknown; // Babylon.js mesh
}

export interface ContextMenuOption {
  id: string;
  label: string;
  action: () => void;
}

export interface GameSettings {
  audioEnabled: boolean;
  quality: 'low' | 'medium' | 'high';
  invertCamera: boolean;
}

export interface PathfindingNode {
  x: number;
  y: number;
  walkable: boolean;
  gCost: number;
  hCost: number;
  parent: PathfindingNode | null;
}

export interface GridCell {
  x: number;
  y: number;
  walkable: boolean;
  occupied: boolean;
}

export interface ClickMarker {
  position: Vector3;
  mesh: unknown;
  lifetime: number;
}

export interface ModalData {
  title: string;
  description: string;
  linkUrl: string;
  isOpen: boolean;
}