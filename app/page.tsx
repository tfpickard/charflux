'use client';

import { useState, useCallback } from 'react';
import SimulationCanvas from '@/components/SimulationCanvas';
import Controls from '@/components/Controls';
import { getDefaultText } from '@/lib/text';
import styles from './page.module.css';

type SimulationMode = 'fluid' | 'gravity' | 'chaos';

export default function Home() {
  const [text, setText] = useState(getDefaultText());
  const [isLoading, setIsLoading] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const [mode, setMode] = useState<SimulationMode>('fluid');

  const handleLoadUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/fetch-text?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch text');
      }

      setText(data.text);
      setRestartKey((prev) => prev + 1);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUseDefault = useCallback(() => {
    setText(getDefaultText());
    setRestartKey((prev) => prev + 1);
  }, []);

  const handleRestart = useCallback(() => {
    setRestartKey((prev) => prev + 1);
  }, []);

  const handleModeChange = useCallback((newMode: SimulationMode) => {
    setMode(newMode);
    setRestartKey((prev) => prev + 1);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>ASCII Fluid Lab</h1>
        <p className={styles.subtitle}>
          Text-driven particle simulation where characters flow like fluid
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.controlsSection}>
          <Controls
            onLoadUrl={handleLoadUrl}
            onUseDefault={handleUseDefault}
            onRestart={handleRestart}
            isLoading={isLoading}
            mode={mode}
            onModeChange={handleModeChange}
          />

          <div className={styles.info}>
            <h3 className={styles.infoTitle}>How it works</h3>
            <p className={styles.infoText}>
              Each character becomes a particle in a 2D simulation. Choose between
              Fluid Dynamics (ASCII-based attraction/repulsion), Gravity (physics-based
              falling and bouncing), or Chaos (perpetual turbulent motion that never settles).
              Watch the text come alive with mesmerizing patterns.
            </p>
            <div className={styles.stats}>
              <span className={styles.statLabel}>Particles:</span>
              <span className={styles.statValue}>{particleCount}</span>
            </div>
          </div>

          <div className={styles.preview}>
            <h3 className={styles.previewTitle}>Current Text (first 200 chars)</h3>
            <pre className={styles.previewText}>{text.slice(0, 200)}...</pre>
          </div>
        </div>

        <div className={styles.canvasSection}>
          <SimulationCanvas
            key={restartKey}
            text={text}
            mode={mode}
            onParticleCount={setParticleCount}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Built with Next.js • React • TypeScript • Deployed on Vercel
        </p>
      </footer>
    </div>
  );
}
