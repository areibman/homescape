import * as BABYLON from 'babylonjs';
import { GameSettings } from '../types';
import { Pathfinding } from '../utils/pathfinding';

export default class SceneBuilder {
  private scene: BABYLON.Scene;
  private settings: GameSettings;
  private light: BABYLON.DirectionalLight | null = null;
  private shadowGenerator: BABYLON.ShadowGenerator | null = null;
  private pathfinding: Pathfinding | null = null;

  constructor(scene: BABYLON.Scene, settings: GameSettings) {
    this.scene = scene;
    this.settings = settings;
  }

  public setPathfinding(pathfinding: Pathfinding): void {
    this.pathfinding = pathfinding;
  }

  public async buildScene(): Promise<BABYLON.Mesh> {
    // Create lights
    this.createLights();
    
    // Create ground
    const ground = this.createGround();
    
    // Create environment
    this.createEnvironment();
    
    // Apply quality settings
    this.updateQuality(this.settings.quality);
    
    return ground;
  }

  private createLights(): void {
    // Ambient light
    const ambient = new BABYLON.HemisphericLight(
      'ambient',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    ambient.intensity = 0.6;
    ambient.diffuse = new BABYLON.Color3(0.9, 0.9, 1);
    ambient.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    
    // Directional light (sun)
    this.light = new BABYLON.DirectionalLight(
      'sun',
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    );
    this.light.position = new BABYLON.Vector3(20, 40, 20);
    this.light.intensity = 0.8;
    this.light.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
    
    // Shadow generator (only for medium/high quality)
    if (this.settings.quality !== 'low') {
      this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light);
      this.shadowGenerator.useBlurExponentialShadowMap = true;
      this.shadowGenerator.blurScale = 2;
      this.shadowGenerator.setDarkness(0.3);
    }
  }

  private createGround(): BABYLON.Mesh {
    // Create tiled ground (12x12 grid)
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 12, height: 12, subdivisions: 12 },
      this.scene
    );
    
    // Create ground material
    const groundMat = new BABYLON.StandardMaterial('groundMat', this.scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.3);
    groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
    
    // Add simple texture pattern
    const groundTexture = new BABYLON.DynamicTexture(
      'groundTexture',
      { width: 512, height: 512 },
      this.scene
    );
    
    const ctx = groundTexture.getContext();
    
    // Draw grid pattern
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add some variation
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 20 + 5;
      const brightness = Math.random() * 0.2 + 0.8;
      
      ctx.fillStyle = `rgba(74, 124, 89, ${brightness})`;
      ctx.fillRect(x, y, size, size);
    }
    
    // Grid lines
    ctx.strokeStyle = 'rgba(58, 92, 69, 0.3)';
    ctx.lineWidth = 2;
    const gridSize = 512 / 12;
    
    for (let i = 0; i <= 12; i++) {
      const pos = i * gridSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, 512);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(512, pos);
      ctx.stroke();
    }
    
    groundTexture.update();
    groundMat.diffuseTexture = groundTexture;
    ground.material = groundMat;
    
    // Enable shadows
    ground.receiveShadows = true;
    
    return ground;
  }

  private createEnvironment(): void {
    // Create town square boundaries (low walls)
    const wallMat = new BABYLON.StandardMaterial('wallMat', this.scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.6, 0.5, 0.4);
    wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    
    // North wall
    const northWall = BABYLON.MeshBuilder.CreateBox(
      'northWall',
      { width: 12, height: 1, depth: 0.5 },
      this.scene
    );
    northWall.position = new BABYLON.Vector3(0, 0.5, -6.25);
    northWall.material = wallMat;
    
    // South wall
    const southWall = northWall.clone('southWall');
    southWall.position = new BABYLON.Vector3(0, 0.5, 6.25);
    
    // East wall
    const eastWall = BABYLON.MeshBuilder.CreateBox(
      'eastWall',
      { width: 0.5, height: 1, depth: 12 },
      this.scene
    );
    eastWall.position = new BABYLON.Vector3(6.25, 0.5, 0);
    eastWall.material = wallMat;
    
    // West wall
    const westWall = eastWall.clone('westWall');
    westWall.position = new BABYLON.Vector3(-6.25, 0.5, 0);
    
    // Add some decorative elements
    this.createDecorations();
    
    // Add shadows
    if (this.shadowGenerator) {
      [northWall, southWall, eastWall, westWall].forEach(wall => {
        this.shadowGenerator!.addShadowCaster(wall);
      });
    }
  }

  private createDecorations(): void {
    // Create a simple fountain in the center
    const fountainBase = BABYLON.MeshBuilder.CreateCylinder(
      'fountainBase',
      { diameter: 2, height: 0.3 },
      this.scene
    );
    fountainBase.position = new BABYLON.Vector3(0, 0.15, 0);
    
    const fountainMat = new BABYLON.StandardMaterial('fountainMat', this.scene);
    fountainMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.8);
    fountainBase.material = fountainMat;
    
    const fountainCenter = BABYLON.MeshBuilder.CreateCylinder(
      'fountainCenter',
      { diameter: 0.5, height: 1 },
      this.scene
    );
    fountainCenter.position = new BABYLON.Vector3(0, 0.5, 0);
    fountainCenter.material = fountainMat;
    
    // Mark fountain area as blocked in pathfinding
    if (this.pathfinding) {
      // Block center tiles where fountain is located
      this.pathfinding.setBlocked(5, 5, true);
      this.pathfinding.setBlocked(5, 6, true);
      this.pathfinding.setBlocked(6, 5, true);
      this.pathfinding.setBlocked(6, 6, true);
    }
    
    // Add some trees/bushes
    const treeMat = new BABYLON.StandardMaterial('treeMat', this.scene);
    treeMat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
    
    const treePositions = [
      { x: -4, z: -4 },
      { x: 4, z: -4 },
      { x: -4, z: 4 },
      { x: 4, z: 4 }
    ];
    
    treePositions.forEach((pos, index) => {
      const tree = BABYLON.MeshBuilder.CreateSphere(
        `tree${index}`,
        { diameter: 1.5, segments: 8 },
        this.scene
      );
      tree.position = new BABYLON.Vector3(pos.x, 1, pos.z);
      tree.material = treeMat;
      
      if (this.shadowGenerator) {
        this.shadowGenerator.addShadowCaster(tree);
      }
      
      // Mark tree positions as blocked
      if (this.pathfinding) {
        const gridX = pos.x + 6;
        const gridZ = pos.z + 6;
        this.pathfinding.setBlocked(gridX, gridZ, true);
      }
    });
  }

  public updateQuality(quality: GameSettings['quality']): void {
    // Update shadow quality
    if (this.shadowGenerator) {
      switch (quality) {
        case 'low':
          this.scene.shadowsEnabled = false;
          break;
        case 'medium':
          this.scene.shadowsEnabled = true;
          this.shadowGenerator.getShadowMap()!.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
          break;
        case 'high':
          this.scene.shadowsEnabled = true;
          this.shadowGenerator.getShadowMap()!.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYFRAME;
          break;
      }
    }
    
    // Update anti-aliasing
    if (this.scene.getEngine()) {
      this.scene.getEngine().setHardwareScalingLevel(
        quality === 'low' ? 2 : 1
      );
    }
  }
}