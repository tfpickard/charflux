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

interface SimulationCanvasProps {
  text: string;
  onParticleCount?: (count: number) => void;
}

export default function SimulationCanvas({
  text,
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
  }, [text, onParticleCount]);

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
