declare module 'canvas-confetti' {
  /**
   * The main confetti function fires confetti from the default canvas.
   * It also serves as a namespace for types and the `create` factory function.
   */
  function confetti(options?: confetti.Options): Promise<null> | null;

  namespace confetti {
    /**
     * Options for a single confetti burst.
     */
    export interface Options {
      particleCount?: number;
      angle?: number;
      spread?: number;
      startVelocity?: number;
      decay?: number;
      gravity?: number;
      drift?: number;
      ticks?: number;
      origin?: {
        x?: number;
        y?: number;
      };
      colors?: string[];
      shapes?: ('square' | 'circle' | 'star')[];
      zIndex?: number;
      disableForReducedMotion?: boolean;
      scalar?: number;
    }

    /**
     * Options for creating a confetti instance with `confetti.create`.
     */
    export interface CreateOptions {
      resize?: boolean;
      useWorker?: boolean;
      disableForReducedMotion?: boolean;
    }

    /**
     * A confetti instance is a function that fires confetti on its own canvas.
     */
    export type ConfettiInstance = (options?: Options) => Promise<null> | null;

    /**
     * Creates a new confetti instance that is bound to a specific canvas.
     * This is useful for firing confetti from different locations on the screen.
     * @param canvas The canvas element to which the confetti instance will be bound.
     * @param options The options for creating the instance.
     */
    export function create(canvas: HTMLCanvasElement, options?: CreateOptions): ConfettiInstance;
  }

  export default confetti;
}
