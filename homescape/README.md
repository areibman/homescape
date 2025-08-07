# Homescape

A RuneScape-inspired personal landing page with 3D exploration. Navigate through a nostalgic town square to discover personal links and content.

## Features

### 🎮 3D Game Scene
- **Grid-based movement**: Click to move with pathfinding
- **Interactive NPCs and Objects**: Right-click for context menu options
- **Camera controls**: Arrow keys to rotate, mouse wheel to zoom
- **Settings panel**: Audio toggle, quality settings, camera inversion

### 🏠 Landing Page
- **Nostalgic design**: RuneScape-inspired login panel
- **Two options**: "Play Now" for 3D scene, "Boring" for simple view
- **Responsive design**: Works on desktop and mobile

### 📄 Boring Page
- **Accessible alternative**: Plain HTML with all the same links
- **SEO friendly**: Crawlable content for search engines
- **Fast loading**: No 3D graphics or heavy assets

### 🎯 Interactions
- **Move**: Left-click to move player character
- **Examine**: Right-click → Examine for descriptions
- **Talk/Open**: Right-click → Talk/Open to access links
- **Context menus**: Right-click on NPCs and objects

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **3D Engine**: Babylon.js
- **Routing**: React Router
- **Styling**: CSS with nostalgic RuneScape-inspired design
- **Pathfinding**: Custom A* algorithm implementation

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd homescape
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Configuration

### Personal Links

Edit `src/data/entities.ts` to customize your personal links:

```typescript
export const entityData: Entity[] = [
  {
    id: 'bard',
    type: 'npc',
    title: 'Bard of Blogs',
    description: 'A wandering storyteller who shares tales and thoughts',
    examineText: 'A friendly bard who loves to share stories and insights.',
    linkUrl: 'https://your-blog-url.com', // ← Change this
    gridPosition: [3, 2],
    icon: '🎭'
  },
  // ... more entities
];
```

### Styling

The application uses a nostalgic RuneScape-inspired color scheme:
- Primary: `#4a7c59` (green)
- Secondary: `#5a6a5a` (gray)
- Accent: `#ffd700` (gold)
- Background: `#2c5530` (dark green)

## Controls

### Desktop
- **Left Click**: Move player
- **Right Click**: Open context menu
- **Arrow Keys**: Rotate camera
- **Mouse Wheel**: Zoom in/out
- **Escape**: Close menus

### Mobile
- **Tap**: Move player
- **Long Press**: Open context menu
- **Pinch**: Zoom in/out
- **Two-finger drag**: Rotate camera

## File Structure

```
src/
├── components/          # React components
│   ├── LandingPage.tsx # Landing page with login panel
│   ├── PlayScene.tsx   # 3D game scene
│   ├── BoringPage.tsx  # Simple HTML page
│   ├── GameUI.tsx      # Game overlay UI
│   ├── ContextMenu.tsx # Right-click context menu
│   └── LinkModal.tsx   # Link opening modal
├── data/
│   └── entities.ts     # NPC and object definitions
├── types/
│   └── game.ts         # TypeScript type definitions
├── utils/
│   └── pathfinding.ts  # A* pathfinding algorithm
└── main.tsx           # Application entry point
```

## Customization

### Adding New Entities

1. Add to `src/data/entities.ts`:
```typescript
{
  id: 'new-entity',
  type: 'npc', // or 'object'
  title: 'New Entity',
  description: 'Description for boring page',
  examineText: 'Text shown when examining',
  linkUrl: 'https://your-link.com',
  gridPosition: [x, z], // Grid coordinates
  icon: '🎯'
}
```

### Changing Colors

Edit CSS variables in component files or create a theme system.

### Adding Audio

1. Add audio files to `public/audio/`
2. Implement audio system in `PlayScene.tsx`
3. Connect to settings panel

## Performance

- **Bundle size**: ~3-5MB compressed
- **Target FPS**: 60fps desktop, 30-60fps mobile
- **Quality tiers**: Low/Medium/High settings
- **Lazy loading**: 3D scene loads on demand

## Accessibility

- **Keyboard navigation**: Tab through UI elements
- **Screen reader support**: Proper ARIA labels
- **High contrast**: Readable text colors
- **Reduced motion**: Respects user preferences
- **Alternative page**: "Boring" page for accessibility

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **WebGL required**: For 3D scene
- **Fallback**: "Boring" page for unsupported browsers

## Legal Notice

This project is inspired by RuneScape but uses original assets and design. No RuneScape/Jagex logos, names, fonts, audio, or assets are used.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Homescape** - Where nostalgia meets personal branding! 🎮✨
