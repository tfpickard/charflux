'use client';

import { useEffect, useRef } from 'react';

/**
 * Simulation configuration constants
 * Adjust these to tweak the visual behavior of the particle system
 */
const CONFIG = {
  FONT_SIZE: 16,
  FONT_FAMILY: "'Courier New', monospace",
  MAX_VELOCITY: 3,
  FRICTION: 0.98,
  INTERACTION_RADIUS: 100,
  NEIGHBORS_TO_CHECK: 5,
  ATTRACTION_STRENGTH: 0.01,
  REPULSION_STRENGTH: 0.02,
  BOUNDARY_MODE: 'wrap' as 'wrap' | 'bounce',
  FPS_TARGET: 60,
};

const GRAVITY_CONFIG = {
  GRAVITY: 0.3,
  BOUNCE_DAMPING: 0.7,
  GROUND_FRICTION: 0.99,
  AIR_RESISTANCE: 0.995,
  FLOOR_OFFSET: 10,
};

const CHAOS_CONFIG = {
  RANDOM_FORCE_STRENGTH: 0.15,
  CENTER_ATTRACTION: 0.005,
  WALL_BOUNCE_ENERGY: 1.05,
  FRICTION: 0.996,
  MAX_VELOCITY: 5,
  TURBULENCE_FREQUENCY: 0.3,
};

const WEATHER_CONFIG = {
  NUM_VORTICES: 3,
  VORTEX_STRENGTH: 0.08,
  VORTEX_RADIUS: 150,
  VORTEX_MOVE_SPEED: 0.5,
  WIND_STRENGTH: 0.02,
  FRICTION: 0.99,
  MAX_VELOCITY: 4,
};

const SWARM_CONFIG = {
  SEPARATION_RADIUS: 30,
  ALIGNMENT_RADIUS: 60,
  COHESION_RADIUS: 80,
  SEPARATION_STRENGTH: 0.05,
  ALIGNMENT_STRENGTH: 0.03,
  COHESION_STRENGTH: 0.01,
  RANDOM_NOISE: 0.05,
  FRICTION: 0.995,
  MAX_VELOCITY: 3.5,
  NEIGHBORS_TO_CHECK: 8,
};

interface Particle {
  ch: string;
  code: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  norm: number; // Normalized ASCII value (0-1)
  mass: number; // Mass affects inertia
  hue: number; // Color hue based on ASCII
}

type SimulationMode = 'fluid' | 'gravity' | 'chaos' | 'weather' | 'swarm';

interface SimulationCanvasProps {
  text: string;
  mode?: SimulationMode;
  onParticleCount?: (count: number) => void;
}

export default function SimulationCanvas({
  text,
  mode = 'fluid',
  onParticleCount,
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles from text
    const initParticles = () => {
      const particles: Particle[] = [];
      const chars = text.split('').filter((ch) => ch.trim().length > 0);

      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const code = ch.charCodeAt(0);

        // Normalize ASCII value (32-126 is printable ASCII range)
        const norm = Math.max(0, Math.min(1, (code - 32) / (126 - 32)));

        // Initial position - distribute randomly
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        // Initial velocity - derived from ASCII
        const angle = norm * Math.PI * 2;
        const speed = norm * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // Mass inversely proportional to norm (lighter chars move faster)
        const mass = 0.5 + (1 - norm) * 0.5;

        // Hue based on ASCII value
        const hue = norm * 360;

        particles.push({
          ch,
          code,
          x,
          y,
          vx,
          vy,
          norm,
          mass,
          hue,
        });
      }

      particlesRef.current = particles;
      onParticleCount?.(particles.length);
    };

    initParticles();

    // Initialize vortices for weather mode
    interface Vortex {
      x: number;
      y: number;
      vx: number;
      vy: number;
      strength: number;
      rotation: number;
    }

    const vortices: Vortex[] = [];
    if (mode === 'weather') {
      for (let i = 0; i < WEATHER_CONFIG.NUM_VORTICES; i++) {
        vortices.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * WEATHER_CONFIG.VORTEX_MOVE_SPEED,
          vy: (Math.random() - 0.5) * WEATHER_CONFIG.VORTEX_MOVE_SPEED,
          strength: WEATHER_CONFIG.VORTEX_STRENGTH * (0.8 + Math.random() * 0.4),
          rotation: Math.random() < 0.5 ? 1 : -1, // Clockwise or counter-clockwise
        });
      }
    }

    // Simulation loop
    let lastTime = performance.now();
    const frameDuration = 1000 / CONFIG.FPS_TARGET;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      // Throttle to target FPS
      if (deltaTime >= frameDuration) {
        lastTime = currentTime - (deltaTime % frameDuration);

        const particles = particlesRef.current;
        const dt = 1; // Fixed timestep for stability

        // Clear canvas with slight trail effect
        ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (mode === 'gravity') {
            // Gravity simulation mode
            // Apply gravity
            p.vy += GRAVITY_CONFIG.GRAVITY * p.mass;

            // Apply air resistance
            p.vx *= GRAVITY_CONFIG.AIR_RESISTANCE;
            p.vy *= GRAVITY_CONFIG.AIR_RESISTANCE;

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Handle ground collision
            const groundY = canvas.height - GRAVITY_CONFIG.FLOOR_OFFSET;
            if (p.y >= groundY) {
              p.y = groundY;
              p.vy *= -GRAVITY_CONFIG.BOUNCE_DAMPING;
              p.vx *= GRAVITY_CONFIG.GROUND_FRICTION;

              // Stop bouncing if velocity is very small
              if (Math.abs(p.vy) < 0.5) {
                p.vy = 0;
              }
            }

            // Handle side boundaries (wrap around)
            if (p.x < 0) p.x += canvas.width;
            if (p.x > canvas.width) p.x -= canvas.width;

            // Reset particles that go above the canvas
            if (p.y < -50) {
              p.y = -10;
              p.x = Math.random() * canvas.width;
              p.vx = (Math.random() - 0.5) * 2;
              p.vy = 0;
            }
          } else if (mode === 'chaos') {
            // Chaos simulation mode - perpetual motion without steady state
            // Apply random turbulent forces
            if (Math.random() < CHAOS_CONFIG.TURBULENCE_FREQUENCY) {
              const angle = Math.random() * Math.PI * 2;
              const force = CHAOS_CONFIG.RANDOM_FORCE_STRENGTH * (0.5 + Math.random() * 0.5);
              p.vx += Math.cos(angle) * force;
              p.vy += Math.sin(angle) * force;
            }

            // Weak attraction to center to keep particles contained
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dcx = centerX - p.x;
            const dcy = centerY - p.y;
            const centerDist = Math.sqrt(dcx * dcx + dcy * dcy);

            if (centerDist > 0) {
              const centerForce = CHAOS_CONFIG.CENTER_ATTRACTION * (centerDist / 100);
              p.vx += (dcx / centerDist) * centerForce;
              p.vy += (dcy / centerDist) * centerForce;
            }

            // Very light friction to prevent infinite acceleration
            p.vx *= CHAOS_CONFIG.FRICTION;
            p.vy *= CHAOS_CONFIG.FRICTION;

            // Limit velocity
            const speedSq = p.vx * p.vx + p.vy * p.vy;
            if (speedSq > CHAOS_CONFIG.MAX_VELOCITY * CHAOS_CONFIG.MAX_VELOCITY) {
              const speed = Math.sqrt(speedSq);
              p.vx = (p.vx / speed) * CHAOS_CONFIG.MAX_VELOCITY;
              p.vy = (p.vy / speed) * CHAOS_CONFIG.MAX_VELOCITY;
            }

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Bounce off walls with energy injection
            if (p.x < 0 || p.x > canvas.width) {
              p.vx *= -CHAOS_CONFIG.WALL_BOUNCE_ENERGY;
              p.x = Math.max(0, Math.min(canvas.width, p.x));
              // Add random vertical impulse on wall bounce
              p.vy += (Math.random() - 0.5) * 0.3;
            }
            if (p.y < 0 || p.y > canvas.height) {
              p.vy *= -CHAOS_CONFIG.WALL_BOUNCE_ENERGY;
              p.y = Math.max(0, Math.min(canvas.height, p.y));
              // Add random horizontal impulse on wall bounce
              p.vx += (Math.random() - 0.5) * 0.3;
            }
          } else if (mode === 'weather') {
            // Weather simulation mode - vortices and wind
            // Update vortex positions
            for (const vortex of vortices) {
              vortex.x += vortex.vx;
              vortex.y += vortex.vy;

              // Bounce vortices off walls
              if (vortex.x < 0 || vortex.x > canvas.width) {
                vortex.vx *= -1;
                vortex.x = Math.max(0, Math.min(canvas.width, vortex.x));
              }
              if (vortex.y < 0 || vortex.y > canvas.height) {
                vortex.vy *= -1;
                vortex.y = Math.max(0, Math.min(canvas.height, vortex.y));
              }
            }

            // Apply vortex forces to particle
            for (const vortex of vortices) {
              const dx = p.x - vortex.x;
              const dy = p.y - vortex.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < WEATHER_CONFIG.VORTEX_RADIUS && dist > 1) {
                // Calculate tangential force for rotation
                const angle = Math.atan2(dy, dx);
                const tangentAngle = angle + (Math.PI / 2) * vortex.rotation;

                // Force decreases with distance from vortex center
                const forceMagnitude = vortex.strength * (1 - dist / WEATHER_CONFIG.VORTEX_RADIUS);

                p.vx += Math.cos(tangentAngle) * forceMagnitude;
                p.vy += Math.sin(tangentAngle) * forceMagnitude;
              }
            }

            // Apply global wind force (varies over time)
            const windAngle = (currentTime / 5000) * Math.PI * 2;
            p.vx += Math.cos(windAngle) * WEATHER_CONFIG.WIND_STRENGTH;
            p.vy += Math.sin(windAngle) * WEATHER_CONFIG.WIND_STRENGTH;

            // Apply friction
            p.vx *= WEATHER_CONFIG.FRICTION;
            p.vy *= WEATHER_CONFIG.FRICTION;

            // Limit velocity
            const speedSq = p.vx * p.vx + p.vy * p.vy;
            if (speedSq > WEATHER_CONFIG.MAX_VELOCITY * WEATHER_CONFIG.MAX_VELOCITY) {
              const speed = Math.sqrt(speedSq);
              p.vx = (p.vx / speed) * WEATHER_CONFIG.MAX_VELOCITY;
              p.vy = (p.vy / speed) * WEATHER_CONFIG.MAX_VELOCITY;
            }

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Wrap around boundaries
            if (p.x < 0) p.x += canvas.width;
            if (p.x > canvas.width) p.x -= canvas.width;
            if (p.y < 0) p.y += canvas.height;
            if (p.y > canvas.height) p.y -= canvas.height;
          } else if (mode === 'swarm') {
            // Swarm simulation mode - flocking behavior (boids)
            let separationX = 0;
            let separationY = 0;
            let alignmentX = 0;
            let alignmentY = 0;
            let cohesionX = 0;
            let cohesionY = 0;
            let separationCount = 0;
            let alignmentCount = 0;
            let cohesionCount = 0;

            // Sample random neighbors for flocking behavior
            for (let j = 0; j < SWARM_CONFIG.NEIGHBORS_TO_CHECK; j++) {
              const neighborIndex = Math.floor(Math.random() * particles.length);
              if (neighborIndex === i) continue;

              const neighbor = particles[neighborIndex];
              const dx = neighbor.x - p.x;
              const dy = neighbor.y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // Separation: Steer away from nearby neighbors
              if (dist < SWARM_CONFIG.SEPARATION_RADIUS && dist > 0) {
                separationX -= dx / dist;
                separationY -= dy / dist;
                separationCount++;
              }

              // Alignment: Match velocity with neighbors
              if (dist < SWARM_CONFIG.ALIGNMENT_RADIUS) {
                alignmentX += neighbor.vx;
                alignmentY += neighbor.vy;
                alignmentCount++;
              }

              // Cohesion: Move toward average position of neighbors
              if (dist < SWARM_CONFIG.COHESION_RADIUS) {
                cohesionX += dx;
                cohesionY += dy;
                cohesionCount++;
              }
            }

            // Apply separation force
            if (separationCount > 0) {
              p.vx += (separationX / separationCount) * SWARM_CONFIG.SEPARATION_STRENGTH;
              p.vy += (separationY / separationCount) * SWARM_CONFIG.SEPARATION_STRENGTH;
            }

            // Apply alignment force
            if (alignmentCount > 0) {
              const avgVx = alignmentX / alignmentCount;
              const avgVy = alignmentY / alignmentCount;
              p.vx += (avgVx - p.vx) * SWARM_CONFIG.ALIGNMENT_STRENGTH;
              p.vy += (avgVy - p.vy) * SWARM_CONFIG.ALIGNMENT_STRENGTH;
            }

            // Apply cohesion force
            if (cohesionCount > 0) {
              const avgDx = cohesionX / cohesionCount;
              const avgDy = cohesionY / cohesionCount;
              p.vx += avgDx * SWARM_CONFIG.COHESION_STRENGTH;
              p.vy += avgDy * SWARM_CONFIG.COHESION_STRENGTH;
            }

            // Add random noise to prevent perfect alignment
            const noiseAngle = Math.random() * Math.PI * 2;
            p.vx += Math.cos(noiseAngle) * SWARM_CONFIG.RANDOM_NOISE;
            p.vy += Math.sin(noiseAngle) * SWARM_CONFIG.RANDOM_NOISE;

            // Apply friction
            p.vx *= SWARM_CONFIG.FRICTION;
            p.vy *= SWARM_CONFIG.FRICTION;

            // Limit velocity
            const speedSq = p.vx * p.vx + p.vy * p.vy;
            if (speedSq > SWARM_CONFIG.MAX_VELOCITY * SWARM_CONFIG.MAX_VELOCITY) {
              const speed = Math.sqrt(speedSq);
              p.vx = (p.vx / speed) * SWARM_CONFIG.MAX_VELOCITY;
              p.vy = (p.vy / speed) * SWARM_CONFIG.MAX_VELOCITY;
            }

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Wrap around boundaries
            if (p.x < 0) p.x += canvas.width;
            if (p.x > canvas.width) p.x -= canvas.width;
            if (p.y < 0) p.y += canvas.height;
            if (p.y > canvas.height) p.y -= canvas.height;
          } else {
            // Fluid simulation mode
            // Sample a few random neighbors for interaction
            for (let j = 0; j < CONFIG.NEIGHBORS_TO_CHECK; j++) {
              const neighborIndex = Math.floor(Math.random() * particles.length);
              if (neighborIndex === i) continue;

              const neighbor = particles[neighborIndex];

              // Calculate distance
              const dx = neighbor.x - p.x;
              const dy = neighbor.y - p.y;
              const distSq = dx * dx + dy * dy;
              const dist = Math.sqrt(distSq);

              if (dist < CONFIG.INTERACTION_RADIUS && dist > 0) {
                // Calculate ASCII difference
                const codeDiff = neighbor.code - p.code;
                const absDiff = Math.abs(codeDiff);

                // Similar characters attract, different ones repel
                let force = 0;
                if (absDiff < 10) {
                  // Attraction
                  force = CONFIG.ATTRACTION_STRENGTH;
                } else {
                  // Repulsion
                  force = -CONFIG.REPULSION_STRENGTH * (absDiff / 50);
                }

                // Apply force inversely proportional to distance
                const strength = (force / (dist + 1)) / p.mass;
                p.vx += (dx / dist) * strength;
                p.vy += (dy / dist) * strength;
              }
            }

            // Apply friction
            p.vx *= CONFIG.FRICTION;
            p.vy *= CONFIG.FRICTION;

            // Limit velocity
            const speedSq = p.vx * p.vx + p.vy * p.vy;
            if (speedSq > CONFIG.MAX_VELOCITY * CONFIG.MAX_VELOCITY) {
              const speed = Math.sqrt(speedSq);
              p.vx = (p.vx / speed) * CONFIG.MAX_VELOCITY;
              p.vy = (p.vy / speed) * CONFIG.MAX_VELOCITY;
            }

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Handle boundaries
            if (CONFIG.BOUNDARY_MODE === 'wrap') {
              if (p.x < 0) p.x += canvas.width;
              if (p.x > canvas.width) p.x -= canvas.width;
              if (p.y < 0) p.y += canvas.height;
              if (p.y > canvas.height) p.y -= canvas.height;
            } else {
              // Bounce
              if (p.x < 0 || p.x > canvas.width) {
                p.vx *= -1;
                p.x = Math.max(0, Math.min(canvas.width, p.x));
              }
              if (p.y < 0 || p.y > canvas.height) {
                p.vy *= -1;
                p.y = Math.max(0, Math.min(canvas.height, p.y));
              }
            }
          }

          // Render particle
          const alpha = 0.7 + p.norm * 0.3;
          ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${alpha})`;
          ctx.font = `${CONFIG.FONT_SIZE}px ${CONFIG.FONT_FAMILY}`;
          ctx.fillText(p.ch, p.x, p.y);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [text, mode, onParticleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="simulation-canvas"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        borderRadius: '8px',
        backgroundColor: '#0f172a',
      }}
    />
  );
}
