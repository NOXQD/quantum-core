import { Color } from "three";

/**
 * Centralized cinematic palette. Use these constants in materials/lights so
 * every section shares the same color language.
 */
export const PALETTE = {
  void: new Color("#03020a"),
  abyss: new Color("#0a0820"),
  violet: new Color("#8a5cff"),
  violetDeep: new Color("#4a1fb8"),
  cyan: new Color("#36e8ff"),
  azure: new Color("#2a6bff"),
  gold: new Color("#f5d27c"),
  white: new Color("#ffffff"),
} as const;

export type PaletteKey = keyof typeof PALETTE;
