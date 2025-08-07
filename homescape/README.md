# Homescape

A RuneScape-inspired personal landing page that offers an interactive 3D world experience alongside a traditional accessible web page.

## 🎮 Features

### Interactive 3D Experience
- **Grid-based Movement**: Click-to-move with pathfinding in a 10x10 grid world
- **Isometric Camera**: Classic MMORPG-style camera with arrow key controls and mouse wheel zoom
- **NPCs & Objects**: Interactive entities that link to personal content (blog, photos, projects, etc.)
- **Context Menus**: Right-click interactions with Move, Examine, and Talk/Open options
- **Settings Panel**: Quality settings, audio toggle, and camera inversion options

### Accessibility & Performance
- **Boring Page**: Fast-loading, accessible alternative with all the same links
- **Quality Tiers**: Low/Medium/High graphics settings for different device capabilities
- **Mobile Optimized**: Touch controls and responsive design
- **WebGL Fallback**: Automatic redirection to accessible page if WebGL is unsupported

### Original Design
- **MMORPG-inspired UI**: Nostalgic styling without using any copyrighted assets
- **Custom 3D Models**: Simple geometric shapes representing characters and objects
- **Fantasy Color Palette**: Warm browns and golds reminiscent of classic RPGs

## 🛠️ Technical Stack

- **Frontend**: React 19 + TypeScript + Vite
- **3D Engine**: Babylon.js
- **Routing**: React Router
- **Styling**: CSS with custom MMORPG-inspired themes
- **Build Tool**: Vite with TypeScript compilation

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd homescape
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎯 Usage

### Navigation
- **Landing Page**: Choose between "Play Now" (3D experience) or "Boring" (accessible page)
- **3D World**: 
  - Left-click to move your character
  - Right-click on NPCs/objects for context menu
  - Use arrow keys to rotate camera
  - Mouse wheel to zoom in/out
  - Settings button (⚙️) for options

### Customizing Content

#### Entities Configuration
Edit `src/data/entities.json` to customize NPCs and objects:

```json
{
  "entities": [
    {
      "id": "unique-id",
      "type": "npc" | "object",
      "position": { "x": 3, "z": 7 },
      "name": "Display Name",
      "description": "Brief description",
      "examineText": "Detailed examination text",
      "linkUrl": "https://example.com",
      "linkTitle": "Link Title",
      "linkDescription": "Link description for modal"
    }
  ]
}
```

#### Styling
- Modify CSS files in `src/pages/` and `src/components/` for UI styling
- Update color schemes in CSS custom properties
- Adjust 3D materials in game system files

## 🏗️ Architecture

### Core Systems
- **GameScene**: Main 3D scene management and coordination
- **GridSystem**: Pathfinding and spatial logic using A* algorithm
- **PlayerController**: Character movement and animation
- **EntityManager**: NPC/object spawning and interaction
- **CameraController**: Isometric camera controls
- **InputManager**: Keyboard and mouse input handling

### UI Components
- **LandingPage**: Entry point with game/boring choice
- **PlayPage**: 3D game container with UI overlays
- **BoringPage**: Accessible alternative page
- **SettingsPanel**: Graphics and preference controls
- **ContextMenu**: Right-click interaction menu
- **LinkModal**: External link confirmation dialog

## 🎨 Design Principles

### Accessibility First
- All functionality available in both 3D and text-only modes
- Keyboard navigation support
- High contrast mode support
- Screen reader friendly markup
- Reduced motion preferences respected

### Performance Conscious
- Quality settings for different devices
- Lazy loading of 3D assets
- Efficient pathfinding algorithms
- Minimal bundle size for core functionality

### Legal Compliance
- No copyrighted assets from RuneScape or other games
- Original 3D models and textures
- Custom UI design inspired by but not copying existing games
- All external links open with proper security attributes

## 📱 Mobile Support

- Touch-to-move controls
- Long-press for context menus
- Pinch-to-zoom camera controls
- Responsive UI scaling
- Optimized performance settings

## 🔧 Configuration

### Environment Variables
- No environment variables required for basic functionality
- All configuration done through JSON files and TypeScript constants

### Browser Support
- Modern browsers with WebGL 1.0+ support
- Automatic fallback for unsupported browsers
- Progressive enhancement approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple devices/browsers
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Use semantic CSS class names
- Maintain accessibility standards
- Test both 3D and boring page functionality
- Ensure mobile compatibility

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by classic MMORPGs (without using copyrighted content)
- Babylon.js community for excellent 3D web framework
- React and TypeScript communities for robust development tools

---

**Note**: This is a personal portfolio project designed to showcase web development skills while providing an engaging user experience. All assets are original and no copyrighted material is used.
