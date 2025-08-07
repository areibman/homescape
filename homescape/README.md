# Homescape

A RuneScape-inspired personal landing page featuring an interactive 3D town square where visitors can explore and discover links to your personal content through NPCs and objects.

## Features

- **Nostalgic Landing Page**: Choose between "Play Now" for the 3D experience or "Boring" for a simple text version
- **Interactive 3D Scene**: Explore a small town square with grid-based movement
- **Classic Controls**: 
  - Left-click to move
  - Right-click for context menu
  - Arrow keys to rotate camera
  - Mouse wheel to zoom
- **Mobile Support**: Touch controls with tap to move and long-press for context menu
- **NPCs & Objects**: Interactive entities that link to your personal content
- **Settings Panel**: Adjust graphics quality, audio, and camera controls
- **Accessibility**: Fully accessible "Boring" page alternative

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd homescape

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview  # Test production build locally
```

## Customization

### Update Links and Content

Edit `src/data/entities.json` to customize the NPCs and objects in your scene:

```json
{
  "id": "your-entity-id",
  "type": "npc",  // or "object"
  "name": "Display Name",
  "position": { "x": 5, "z": 3 },  // Grid position (0-11)
  "examineText": "Description when examined",
  "linkUrl": "https://your-link.com",
  "linkTitle": "Link Title",
  "linkDescription": "What this link is about"
}
```

### Styling

- Landing page styles: `src/pages/Landing.css`
- Game UI styles: `src/pages/GameScene.css`
- Color scheme uses a fantasy-inspired palette

## Technical Stack

- **React** + **TypeScript**: UI framework and type safety
- **Vite**: Fast build tooling
- **Babylon.js**: 3D graphics engine
- **React Router**: Client-side routing

## Architecture

- **GameEngine**: Main game controller managing the 3D scene
- **SceneBuilder**: Constructs the 3D environment
- **InputController**: Handles all user inputs (mouse, keyboard, touch)
- **Player**: Manages player character movement and pathfinding
- **EntityManager**: Manages NPCs and interactive objects
- **Pathfinding**: A* algorithm for grid-based movement

## Performance

- Three quality tiers (Low/Medium/High) for different devices
- Lazy loading of 3D assets
- Target 60fps on desktop, 30-60fps on mobile
- WebGL fallback to "Boring" page if unsupported

## Legal Note

This project is inspired by classic MMORPGs but uses no copyrighted assets, names, or branding from any existing games. All visuals and code are original.

## License

MIT License - feel free to use this as a template for your own personal landing page!
