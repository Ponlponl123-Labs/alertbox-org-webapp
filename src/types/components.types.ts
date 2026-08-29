import type { ReactNode, CSSProperties } from "react";

export interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
  className?: string;
}

export interface PrismProps {
  height?: number;
  baseWidth?: number;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  noise?: number;
  glow?: number;
  animationType?: "rotate" | "3drotate" | "hover" | "pulse";
  timeScale?: number;
  suspendWhenOffscreen?: boolean;
  className?: string;
}

export interface LightPillarProps {
  className?: string;
  color?: string;
  intensity?: number;
  glowSize?: number;
  rayCount?: number;
}

export interface LightRaysProps {
  className?: string;
  rayCount?: number;
  speed?: number;
  color?: string;
}

export interface DotFieldProps {
  className?: string;
  color?: string;
  dotSize?: number;
  spacing?: number;
}

export interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  colors?: string[];
  backgroundColor?: string;
  style?: CSSProperties;
}

export interface LogoItem {
  node: ReactNode;
  title: string;
}

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
}
