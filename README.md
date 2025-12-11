# ASCII Fluid Lab

A visually stunning web application that transforms text into mesmerizing 2D fluid-like simulations. Each character becomes a particle in an interactive canvas, driven by its ASCII value to create beautiful, emergent patterns.

## Features

- **ASCII-Driven Physics**: Character ASCII values determine particle behavior (velocity, mass, interaction strength)
- **Fluid Dynamics**: Similar characters attract, different ones repel, creating swarm-like fluid motion
- **Default Text**: Ships with engaging default text demonstrating the simulation
- **External URL Loading**: Fetch and parse text from any URL server-side to avoid CORS issues
- **Responsive Design**: Modern, polished UI with dark theme and smooth animations
- **60 FPS Performance**: Optimized rendering with efficient neighbor sampling (O(N) complexity)
- **TypeScript**: Fully typed codebase for reliability and maintainability

## Tech Stack

- **Next.js 15** - App Router with server and client components
- **React 19** - Latest React features
- **TypeScript** - Strict typing throughout
- **JSDOM** - Server-side HTML parsing
- **Canvas API** - High-performance 2D rendering
- **Vercel-Ready** - Optimized for deployment

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
charflux/
├── app/
│   ├── api/
│   │   └── fetch-text/
│   │       └── route.ts       # API endpoint for fetching external URLs
│   ├── layout.tsx             # Root layout with metadata
│   ├── page.tsx               # Main page component
│   ├── page.module.css        # Page styles
│   └── globals.css            # Global styles
├── components/
│   ├── SimulationCanvas.tsx   # Core simulation component
│   ├── Controls.tsx           # UI controls
│   └── Controls.module.css    # Controls styles
├── lib/
│   ├── text.ts                # Default text and utilities
│   └── htmlExtract.ts         # HTML parsing utilities
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## How It Works

### Simulation Algorithm

1. **Particle Initialization**: Each non-whitespace character becomes a particle with:
   - Position (x, y)
   - Velocity (vx, vy)
   - ASCII code
   - Normalized value (0-1 based on printable ASCII range)
   - Mass (derived from ASCII value)
   - Hue (for color variation)

2. **Force Calculation**: Each frame, particles interact with random neighbors:
   - ASCII difference determines force type:
     - Similar characters (diff < 10): Attraction
     - Different characters: Repulsion
   - Forces decay with distance
   - Mass affects acceleration

3. **Physics Integration**:
   - Velocity updated by forces
   - Friction applied (0.98 damping)
   - Position updated by velocity
   - Boundaries handled (wrap-around or bounce)

4. **Rendering**: Canvas cleared with slight trail effect, particles rendered as colored text characters

### Customization

Edit `/lib/text.ts` to:
- Change default text (DEFAULT_TEXT constant)
- Adjust max characters (MAX_CHARS constant)

Edit `/components/SimulationCanvas.tsx` CONFIG object to tweak:
- Font size and family
- Max velocity
- Friction
- Interaction radius
- Number of neighbors checked per frame
- Attraction/repulsion strength
- Boundary mode (wrap or bounce)

## API Routes

### GET /api/fetch-text?url={url}

Fetches and extracts text from an external URL.

**Parameters:**
- `url` (required): The URL to fetch

**Response:**
```json
{
  "text": "Extracted visible text content..."
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Deployment on Vercel

This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy - no configuration needed!

The app uses:
- Node.js runtime for the `/api/fetch-text` route (required for JSDOM)
- Edge runtime compatible for static pages
- Proper metadata for SEO

## Performance Notes

- Simulation complexity: O(N) where N = number of particles
- Uses neighbor sampling instead of N² full interactions
- Target 60 FPS with frame throttling
- Text limited to MAX_CHARS (default: 3000) for performance
- Canvas trails create smooth visual effect

## Browser Compatibility

Works in all modern browsers supporting:
- Canvas 2D context
- ES2020+
- RequestAnimationFrame

## License

See LICENSE file for details.

## Contributing

Contributions welcome! Please ensure:
- TypeScript strict mode compliance
- Consistent code style
- Test builds pass (`npm run build`)

---

Built with Next.js • React • TypeScript
