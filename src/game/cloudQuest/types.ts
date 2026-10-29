/**
 * Mission to Cloud Kingdom — shared types.
 *
 * World units: the visible viewport is 100 units wide and 100 units tall
 * (16:9 is not enforced; the scene keeps a 100 x 100 unit camera window and is
 * stretched to its container). Levels can be wider than the viewport; the
 * camera follows Wally.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Vec {
  x: number;
  y: number;
}

export type PlatformKind = 'cloud' | 'rock' | 'castle';

export interface PlatformDef extends Rect {
  id: string;
  kind?: PlatformKind;
}

export interface CollectibleDef {
  id: string;
  x: number;
  y: number;
  /** Radius in world units (drawn as a glowing vapour marker). */
  r: number;
}

export interface HazardDef extends Rect {
  id: string;
  /** Direction of the oscillation. */
  axis: 'x' | 'y';
  /** Maximum offset from the base position, in world units. */
  range: number;
  /** Oscillation speed (radians per second). */
  speed: number;
  /** Start phase so hazards are not synchronised. */
  phase?: number;
}

export type LevelId = 'vapour-voyage' | 'cooling-passage' | 'cloud-bridge';

/** Which door illustration introduces a parkour level. */
export type LevelDoorArt = 'masuk' | 'keluar';

export interface LevelDef {
  id: LevelId;
  title: string;
  subtitle: string;
  /** World width in units (>= 100). */
  width: number;
  spawn: Vec;
  platforms: PlatformDef[];
  collectibles: CollectibleDef[];
  hazards: HazardDef[];
  /** How many vapour markers must be collected before the exit opens. */
  requiredCollectibles: number;
  exit: Rect;
  /** Door artwork for this level: the first parkour level uses "masuk", the second "keluar". */
  doorArt: LevelDoorArt;
  /** Optional castle target (level 3 only). */
  castle?: Rect;
  /** Short science tip shown in the HUD for this level. */
  scienceTip: string;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
}

export interface WorldState {
  player: PlayerState;
  collectedIds: string[];
  respawns: number;
  reachedExit: boolean;
}

/** Wally's drawn pose; each pose has its own illustration. */
export type WallyPose = 'stand' | 'walk' | 'jump';
