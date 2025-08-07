import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  ArcRotateCamera,
  Mesh,
  PointerEventTypes,
  PickingInfo,
  Animation,
  EasingFunction,
  CircleEase
} from '@babylonjs/core';
import { Pathfinding } from '../utils/pathfinding';
import { entityData } from '../data/entities';
import type { PlayerState, CameraState, GameSettings, ModalData, InteractionTarget } from '../types/game';
import ContextMenu from './ContextMenu';
import GameUI from './GameUI';
import LinkModal from './LinkModal';
import './PlayScene.css';

const PlayScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  
  // Game state
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: new Vector3(5, 0.5, 5),
    targetPosition: null,
    isMoving: false,
    gridPosition: [5, 5]
  });
  
  const [cameraState, setCameraState] = useState<CameraState>({
    alpha: Math.PI / 4,
    beta: Math.PI / 3,
    radius: 15,
    target: new Vector3(5, 0, 5)
  });
  
  const [settings, setSettings] = useState<GameSettings>({
    audioEnabled: false,
    quality: 'medium',
    invertCamera: false
  });
  
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    target: InteractionTarget | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    target: null
  });
  
  const [modalData, setModalData] = useState<ModalData>({
    title: '',
    description: '',
    linkUrl: '',
    isOpen: false
  });
  
  const [hintText, setHintText] = useState('Left-click to move. Right-click for options.');
  
  // Refs
  const sceneRef = useRef<Scene | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const playerMeshRef = useRef<Mesh | null>(null);
  const pathfindingRef = useRef<Pathfinding | null>(null);
  const entitiesRef = useRef<Map<string, { mesh: Mesh; entity: unknown }>>(new Map());
  const clickMarkersRef = useRef<Mesh[]>([]);

  // Initialize the 3D scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create engine and scene
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    
    engineRef.current = engine;
    sceneRef.current = scene;

    // Create camera
    const camera = new ArcRotateCamera(
      'camera',
      cameraState.alpha,
      cameraState.beta,
      cameraState.radius,
      cameraState.target,
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 25;
    camera.wheelDeltaPercentage = 0.1;

    // Create lighting
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create ground
    const ground = MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, scene);
    const groundMaterial = new StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new Color3(0.3, 0.5, 0.3);
    ground.material = groundMaterial;

    // Create player
    const playerMesh = MeshBuilder.CreateBox('player', { size: 1 }, scene);
    const playerMaterial = new StandardMaterial('playerMaterial', scene);
    playerMaterial.diffuseColor = new Color3(0.2, 0.6, 0.8);
    playerMesh.material = playerMaterial;
    playerMesh.position = playerState.position;
    playerMeshRef.current = playerMesh;

    // Initialize pathfinding
    const pathfinding = new Pathfinding(10);
    pathfindingRef.current = pathfinding;

    // Create entities
    createEntities(scene, pathfinding);

    // Set up input handling
    setupInputHandling(scene, camera, pathfinding);

    // Start render loop
    engine.runRenderLoop(() => {
      scene.render();
      updatePlayerMovement();
      updateCamera();
      updateClickMarkers();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('homescape-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn('Failed to load settings:', e);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('homescape-settings', JSON.stringify(settings));
  }, [settings]);

  const createEntities = (scene: Scene, pathfinding: Pathfinding) => {
    entityData.forEach(entity => {
      const [x, z] = entity.gridPosition;
      const position = new Vector3(x, 0.5, z);
      
      let mesh: Mesh;
      
      if (entity.type === 'npc') {
        // Create NPC (cylinder for now)
        mesh = MeshBuilder.CreateCylinder(entity.id, { height: 1.5, diameter: 0.8 }, scene);
        const material = new StandardMaterial(`${entity.id}Material`, scene);
        material.diffuseColor = new Color3(0.8, 0.6, 0.4);
        mesh.material = material;
      } else {
        // Create object (box for now)
        mesh = MeshBuilder.CreateBox(entity.id, { size: 1 }, scene);
        const material = new StandardMaterial(`${entity.id}Material`, scene);
        material.diffuseColor = new Color3(0.6, 0.4, 0.2);
        mesh.material = material;
      }
      
      mesh.position = position;
      entitiesRef.current.set(entity.id, { mesh, entity });
      
      // Mark position as occupied in pathfinding
      pathfinding.setOccupied(x, z, true);
    });
  };

  const setupInputHandling = (scene: Scene, camera: ArcRotateCamera, pathfinding: Pathfinding) => {
    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        const pickResult = scene.pick(pointerInfo.event.x, pointerInfo.event.y);
        
        if (pickResult?.hit) {
          if (pointerInfo.event.button === 0) { // Left click
            handleLeftClick(pickResult, pathfinding);
          } else if (pointerInfo.event.button === 2) { // Right click
            handleRightClick(pickResult, pointerInfo.event.x, pointerInfo.event.y);
          }
        }
      }
    });

    // Handle keyboard input
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === 1) { // KEYDOWN
        handleKeyDown(kbInfo.event.code, camera);
      }
    });
  };

  const handleLeftClick = (pickResult: PickingInfo, pathfinding: Pathfinding) => {
    if (pickResult.pickedMesh?.name === 'ground') {
      const hitPoint = pickResult.pickedPoint;
      if (hitPoint) {
        // Convert world position to grid position
        const gridX = Math.round(hitPoint.x);
        const gridZ = Math.round(hitPoint.z);
        
        // Find path to target
        const path = pathfinding.findPath(
          playerState.gridPosition[0],
          playerState.gridPosition[1],
          gridX,
          gridZ
        );
        
        if (path.length > 0) {
          const targetPos = new Vector3(gridX, 0.5, gridZ);
          setPlayerState(prev => ({
            ...prev,
            targetPosition: targetPos,
            isMoving: true
          }));
          
          // Create click marker
          createClickMarker(targetPos);
        }
      }
    }
  };

  const handleRightClick = (pickResult: PickingInfo, x: number, y: number) => {
    const mesh = pickResult.pickedMesh;
    if (mesh && mesh.name !== 'ground' && mesh.name !== 'player') {
      // Find entity
      for (const [id, { mesh: entityMesh, entity }] of entitiesRef.current) {
        if (entityMesh === mesh) {
          const entityData = entity as { type: 'npc' | 'object' };
          setContextMenu({
            isOpen: true,
            x,
            y,
            target: {
              id,
              type: entityData.type,
              position: mesh.position,
              mesh
            }
          });
          break;
        }
      }
    }
  };

  const handleKeyDown = (code: string, camera: ArcRotateCamera) => {
    const rotationSpeed = 0.1;
    const zoomSpeed = 1;
    
    switch (code) {
      case 'ArrowLeft':
        camera.alpha += rotationSpeed;
        break;
      case 'ArrowRight':
        camera.alpha -= rotationSpeed;
        break;
      case 'ArrowUp':
        camera.radius -= zoomSpeed;
        break;
      case 'ArrowDown':
        camera.radius += zoomSpeed;
        break;
      case 'Escape':
        setContextMenu({ isOpen: false, x: 0, y: 0, target: null });
        setModalData(prev => ({ ...prev, isOpen: false }));
        break;
    }
  };

  const createClickMarker = (position: Vector3) => {
    if (!sceneRef.current) return;
    
    const marker = MeshBuilder.CreateSphere('clickMarker', { diameter: 0.3 }, sceneRef.current);
    const material = new StandardMaterial('markerMaterial', sceneRef.current);
    material.diffuseColor = new Color3(1, 1, 0);
    material.alpha = 0.7;
    marker.material = material;
    marker.position = position;
    
    // Animate marker
    const animation = new Animation('markerAnimation', 'scaling', 30, Animation.ANIMATIONTYPE_VECTOR3);
    const keys = [
      { frame: 0, value: new Vector3(0, 0, 0) },
      { frame: 15, value: new Vector3(1, 1, 1) },
      { frame: 30, value: new Vector3(0, 0, 0) }
    ];
    animation.setKeys(keys);
    
    const easingFunction = new CircleEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    animation.setEasingFunction(easingFunction);
    
    marker.animations = [animation];
    sceneRef.current.beginAnimation(marker, 0, 30, false, 1, () => {
      marker.dispose();
    });
    
    clickMarkersRef.current.push(marker);
  };

  const updatePlayerMovement = () => {
    if (!playerMeshRef.current || !playerState.isMoving || !playerState.targetPosition) return;
    
    const player = playerMeshRef.current;
    const target = playerState.targetPosition;
    const distance = Vector3.Distance(player.position, target);
    
    if (distance < 0.1) {
      // Reached target
      const gridPos: [number, number] = [Math.round(target.x), Math.round(target.z)];
      setPlayerState(prev => ({
        ...prev,
        position: target,
        targetPosition: null,
        isMoving: false,
        gridPosition: gridPos
      }));
    } else {
      // Move towards target
      const direction = target.subtract(player.position).normalize();
      const moveSpeed = 0.1;
      player.position.addInPlace(direction.scale(moveSpeed));
    }
  };

  const updateCamera = () => {
    if (!sceneRef.current) return;
    
    const camera = sceneRef.current.activeCamera as ArcRotateCamera;
    if (camera) {
      setCameraState({
        alpha: camera.alpha,
        beta: camera.beta,
        radius: camera.radius,
        target: camera.target
      });
    }
  };

  const updateClickMarkers = () => {
    // Clean up expired markers
    clickMarkersRef.current = clickMarkersRef.current.filter(marker => {
      if (marker.isDisposed()) {
        return false;
      }
      return true;
    });
  };

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu.target) return;
    
    const entity = entityData.find(e => e.id === contextMenu.target!.id);
    if (!entity) return;
    
    switch (action) {
              case 'move': {
          // Move to adjacent tile
          const [x, z] = entity.gridPosition;
          const adjacentPositions = [
            [x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1]
          ];
          
          for (const [adjX, adjZ] of adjacentPositions) {
            const path = pathfindingRef.current?.findPath(playerState.gridPosition[0], playerState.gridPosition[1], adjX, adjZ);
            if (path && path.length > 0) {
              const targetPos = new Vector3(adjX, 0.5, adjZ);
              setPlayerState(prev => ({
                ...prev,
                targetPosition: targetPos,
                isMoving: true
              }));
              break;
            }
          }
          break;
        }
        
      case 'examine':
        setHintText(entity.examineText);
        setTimeout(() => setHintText('Left-click to move. Right-click for options.'), 3000);
        break;
        
      case 'talk':
        setModalData({
          title: entity.title,
          description: entity.description,
          linkUrl: entity.linkUrl,
          isOpen: true
        });
        break;
    }
    
    setContextMenu({ isOpen: false, x: 0, y: 0, target: null });
  };

  const handleModalClose = () => {
    setModalData(prev => ({ ...prev, isOpen: false }));
  };

  const handleModalOpenLink = () => {
    window.open(modalData.linkUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="play-scene">
      <canvas ref={canvasRef} className="game-canvas" />
      
      <GameUI
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onBackToLanding={handleBackToLanding}
        hintText={hintText}
      />
      
      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu({ isOpen: false, x: 0, y: 0, target: null })}
        />
      )}
      
      {modalData.isOpen && (
        <LinkModal
          title={modalData.title}
          description={modalData.description}
          linkUrl={modalData.linkUrl}
          onClose={handleModalClose}
          onOpenLink={handleModalOpenLink}
        />
      )}
    </div>
  );
};

export default PlayScene;