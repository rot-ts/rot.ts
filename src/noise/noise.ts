/**
 * Base noise generator
 */
export abstract class Noise {
	abstract get(x: number, y: number): number;
}
