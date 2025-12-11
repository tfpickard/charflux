'use client';

import { useState } from 'react';
import styles from './Controls.module.css';

type SimulationMode = 'fluid' | 'gravity' | 'chaos';

interface ControlsProps {
  onLoadUrl: (url: string) => Promise<void>;
  onUseDefault: () => void;
  onRestart: () => void;
  isLoading: boolean;
  mode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
}

export default function Controls({
  onLoadUrl,
  onUseDefault,
  onRestart,
  isLoading,
  mode,
  onModeChange,
}: ControlsProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLoadUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setError(null);
    try {
      await onLoadUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load URL');
    }
  };

  const handleUseDefault = () => {
    setError(null);
    setUrl('');
    onUseDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLoadUrl();
    }
  };

  return (
    <div className={styles.controls}>
      <div className={styles.inputGroup}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a URL to fetch text from..."
          className={styles.input}
          disabled={isLoading}
        />
        <button
          onClick={handleLoadUrl}
          disabled={isLoading || !url.trim()}
          className={`${styles.button} ${styles.primary}`}
        >
          {isLoading ? 'Loading...' : 'Load from URL'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.buttonGroup}>
        <button
          onClick={handleUseDefault}
          disabled={isLoading}
          className={styles.button}
        >
          Use Default Text
        </button>
        <button
          onClick={onRestart}
          disabled={isLoading}
          className={styles.button}
        >
          Restart Simulation
        </button>
      </div>

      <div className={styles.modeSelector}>
        <label className={styles.modeLabel}>Simulation Mode:</label>
        <div className={styles.modeButtons}>
          <button
            onClick={() => onModeChange('fluid')}
            disabled={isLoading}
            className={`${styles.button} ${mode === 'fluid' ? styles.active : ''}`}
          >
            Fluid Dynamics
          </button>
          <button
            onClick={() => onModeChange('gravity')}
            disabled={isLoading}
            className={`${styles.button} ${mode === 'gravity' ? styles.active : ''}`}
          >
            Gravity
          </button>
          <button
            onClick={() => onModeChange('chaos')}
            disabled={isLoading}
            className={`${styles.button} ${mode === 'chaos' ? styles.active : ''}`}
          >
            Chaos
          </button>
        </div>
      </div>
    </div>
  );
}
