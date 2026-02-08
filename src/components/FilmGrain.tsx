import styles from './FilmGrain.module.css';

/**
 * Film Grain Overlay
 *
 * Site-wide animated noise texture that adds photographic depth.
 * Uses SVG feTurbulence rendered to a data URI with CSS animation
 * that shifts the position frame-by-frame for living grain.
 *
 * Opacity is nearly imperceptible (0.022) but adds subliminal texture
 * that separates premium from flat design.
 */
export const FilmGrain = () => {
  return (
    <div className={styles.grain} aria-hidden="true">
      <div className={styles.grainTexture} />
    </div>
  );
};
