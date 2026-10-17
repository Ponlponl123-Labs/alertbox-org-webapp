import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    Color,
    Mesh,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    ShaderMaterial,
    Vector2,
    Vector3,
    WebGLRenderer
} from 'three';

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uFlakeSize;
uniform float uMinFlakeSize;
uniform float uSpeed;
uniform float uDepthFade;
uniform float uFarPlane;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGamma;
uniform float uDensity;
uniform float uVariant;
uniform float uDirection;

#define PI 3.14159265
#define PI_OVER_6 0.5235988
#define PI_OVER_3 1.0471976
#define M1 1597334677U
#define M2 3812015801U
#define M3 3299493293U
#define F0 2.3283064e-10

#define hash(n) (n * (n ^ (n >> 15)))
#define coord3(p) (uvec3(p).x * M1 ^ uvec3(p).y * M2 ^ uvec3(p).z * M3)

const vec3 camK = vec3(0.57735027, 0.57735027, 0.57735027);
const vec3 camI = vec3(0.70710678, 0.0, -0.70710678);
const vec3 camJ = vec3(-0.40824829, 0.81649658, -0.40824829);
const vec2 b1d = vec2(0.574, 0.819);

vec3 hash3(uint n) {
  uvec3 hashed = hash(n) * uvec3(1U, 511U, 262143U);
  return vec3(hashed) * F0;
}

float snowflakeDist(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x);
  a = abs(mod(a + PI_OVER_6, PI_OVER_3) - PI_OVER_6);
  vec2 q = r * vec2(cos(a), sin(a));
  float dMain = max(abs(q.y), max(-q.x, q.x - 1.0));
  float b1t = clamp(dot(q - vec2(0.4, 0.0), b1d), 0.0, 0.4);
  float dB1 = length(q - vec2(0.4, 0.0) - b1t * b1d);
  float b2t = clamp(dot(q - vec2(0.7, 0.0), b1d), 0.0, 0.25);
  float dB2 = length(q - vec2(0.7, 0.0) - b2t * b1d);
  return min(dMain, min(dB1, dB2)) * 10.0;
}

void main() {
  vec2 res = uResolution;
  float invResX = 1.0 / res.x;

  vec3 ray = normalize(vec3((gl_FragCoord.xy - res * 0.5) * invResX, 1.0));
  ray = ray.x * camI + ray.y * camJ + ray.z * camK;

  float timeSpeed = uTime * uSpeed;
  float windX = cos(uDirection) * 0.4;
  float windY = sin(uDirection) * 0.4;
  vec3 camPos = (windX * camI + windY * camJ + 0.1 * camK) * timeSpeed;
  vec3 pos = camPos;

  vec3 absRay = max(abs(ray), vec3(0.001));
  vec3 strides = 1.0 / absRay;
  vec3 raySign = step(ray, vec3(0.0));
  vec3 phase = fract(pos) * strides;
  phase = mix(strides - phase, phase, raySign);

  float invRayDotCamK = 1.0 / dot(ray, camK);
  float invDepthFade = 1.0 / uDepthFade;
  float halfInvResX = 0.5 * invResX;
  vec3 timeAnim = timeSpeed * 0.1 * vec3(7.0, 8.0, 5.0);

  float t = 0.0;
  for (int i = 0; i < 48; i++) {
    if (t >= uFarPlane) break;
    
    vec3 fpos = floor(pos);
    uint cellCoord = coord3(fpos);
    float cellHash = hash3(cellCoord).x;

    if (cellHash < uDensity) {
      vec3 h = hash3(cellCoord);
      
      vec3 sinArg1 = fpos.yzx * 0.073;
      vec3 sinArg2 = fpos.zxy * 0.27;
      vec3 flakePos = 0.5 - 0.5 * cos(4.0 * sin(sinArg1) + 4.0 * sin(sinArg2) + 2.0 * h + timeAnim);
      flakePos = flakePos * 0.8 + 0.1 + fpos;

      float toIntersection = dot(flakePos - pos, camK) * invRayDotCamK;
      
      if (toIntersection > 0.0) {
        vec3 testPos = pos + ray * toIntersection - flakePos;
        float testX = dot(testPos, camI);
        float testY = dot(testPos, camJ);
        vec2 testUV = abs(vec2(testX, testY));
        
        float depth = dot(flakePos - camPos, camK);
        float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * halfInvResX);
        
        float dist;
        if (uVariant < 0.5) {
          dist = max(testUV.x, testUV.y);
        } else if (uVariant < 1.5) {
          dist = length(testUV);
        } else {
          float invFlakeSize = 1.0 / flakeSize;
          dist = snowflakeDist(vec2(testX, testY) * invFlakeSize) * flakeSize;
        }

        if (dist < flakeSize) {
          float flakeSizeRatio = uFlakeSize / flakeSize;
          float intensity = exp2(-(t + toIntersection) * invDepthFade) *
                           min(1.0, flakeSizeRatio * flakeSizeRatio) * uBrightness;
          gl_FragColor = vec4(uColor * pow(vec3(intensity), vec3(uGamma)), 1.0);
          return;
        }
      }
    }

    float nextStep = min(min(phase.x, phase.y), phase.z);
    vec3 sel = step(phase, vec3(nextStep));
    phase = phase - nextStep + strides * sel;
    t += nextStep;
    pos = mix(pos + ray * nextStep, floor(pos + ray * nextStep + 0.5), sel);
  }

  gl_FragColor = vec4(0.0);
}
`;

interface PixelSnowProps {
    color?: string;
    flakeSize?: number;
    minFlakeSize?: number;
    pixelResolution?: number;
    speed?: number;
    depthFade?: number;
    farPlane?: number;
    brightness?: number;
    gamma?: number;
    density?: number;
    variant?: 'square' | 'round' | 'snowflake';
    direction?: number;
    fps?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function PixelSnow({
    color = '#ffffff',
    flakeSize = 0.01,
    minFlakeSize = 1.25,
    pixelResolution = 180,
    speed = 1.25,
    depthFade = 8,
    farPlane = 20,
    brightness = 1,
    gamma = 0.4545,
    density = 0.3,
    variant = 'square',
    direction = 125,
    fps = 30,
    className = '',
    style = {}
}: PixelSnowProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const isVisibleRef = useRef(true);
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const materialRef = useRef<ShaderMaterial | null>(null);
    const resizeTimeoutRef = useRef<number | null>(null);

    const propsRef = useRef({
        flakeSize,
        minFlakeSize,
        speed,
        depthFade,
        farPlane,
        brightness,
        gamma,
        density,
        direction,
        pixelResolution
    });

    useEffect(() => {
        propsRef.current = {
            flakeSize,
            minFlakeSize,
            speed,
            depthFade,
            farPlane,
            brightness,
            gamma,
            density,
            direction,
            pixelResolution
        };
    }, [
        flakeSize,
        minFlakeSize,
        speed,
        depthFade,
        farPlane,
        brightness,
        gamma,
        density,
        direction,
        pixelResolution
    ]);

    const variantValue = useMemo(() => {
        return variant === 'round' ? 1.0 : variant === 'snowflake' ? 2.0 : 0.0;
    }, [variant]);

    const colorVector = useMemo(() => {
        const threeColor = new Color(color);
        return new Vector3(threeColor.r, threeColor.g, threeColor.b);
    }, [color]);

    const handleResize = useCallback(() => {
        if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = window.setTimeout(() => {
            const container = containerRef.current;
            const renderer = rendererRef.current;
            const material = materialRef.current;
            if (!container || !renderer || !material) return;

            const cw = container.offsetWidth || 1;
            const ch = container.offsetHeight || 1;
            const aspect = cw / ch;

            const w = Math.min(propsRef.current.pixelResolution, Math.max(80, Math.round(cw)));
            const h = Math.max(60, Math.round(w / aspect));

            renderer.setSize(w, h, false);
            material.uniforms.uResolution.value.set(w, h);
        }, 100);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisibleRef.current = entry.isIntersecting;
            },
            { threshold: 0 }
        );

        observer.observe(container);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                isVisibleRef.current = false;
            } else if (container) {
                const rect = container.getBoundingClientRect();
                isVisibleRef.current = rect.bottom > 0 && rect.top < window.innerHeight;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new Scene();
        const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new WebGLRenderer({
            antialias: false,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: 'low-power',
            stencil: false,
            depth: false
        });

        const initialProps = propsRef.current;
        const cw = container.offsetWidth || 1;
        const ch = container.offsetHeight || 1;
        const aspect = cw / ch;
        const w = Math.min(initialProps.pixelResolution, Math.max(80, Math.round(cw)));
        const h = Math.max(60, Math.round(w / aspect));

        renderer.setPixelRatio(1);
        renderer.setSize(w, h, false);
        renderer.setClearColor(0x000000, 0);

        const canvas = renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.imageRendering = 'pixelated';

        container.appendChild(canvas);
        rendererRef.current = renderer;

        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new Vector2(w, h) },
                uFlakeSize: { value: initialProps.flakeSize },
                uMinFlakeSize: { value: initialProps.minFlakeSize },
                uSpeed: { value: initialProps.speed },
                uDepthFade: { value: initialProps.depthFade },
                uFarPlane: { value: initialProps.farPlane },
                uColor: { value: colorVector.clone() },
                uBrightness: { value: initialProps.brightness },
                uGamma: { value: initialProps.gamma },
                uDensity: { value: initialProps.density },
                uVariant: { value: variantValue },
                uDirection: { value: (initialProps.direction * Math.PI) / 180 }
            },
            transparent: true
        });
        materialRef.current = material;

        const geometry = new PlaneGeometry(2, 2);
        scene.add(new Mesh(geometry, material));

        window.addEventListener('resize', handleResize);

        const frameInterval = 1000 / Math.max(15, Math.min(60, fps));
        let lastFrameTime = performance.now();
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            animationRef.current = requestAnimationFrame(animate);

            if (!isVisibleRef.current) return;

            const elapsed = currentTime - lastFrameTime;
            if (elapsed < frameInterval) return;

            lastFrameTime = currentTime - (elapsed % frameInterval);
            material.uniforms.uTime.value = (currentTime - startTime) * 0.001;
            renderer.render(scene, camera);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', handleResize);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
            renderer.forceContextLoss();
            geometry.dispose();
            material.dispose();
            rendererRef.current = null;
            materialRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleResize, fps]);

    useEffect(() => {
        const material = materialRef.current;
        if (!material) return;

        material.uniforms.uFlakeSize.value = flakeSize;
        material.uniforms.uMinFlakeSize.value = minFlakeSize;
        material.uniforms.uSpeed.value = speed;
        material.uniforms.uDepthFade.value = depthFade;
        material.uniforms.uFarPlane.value = farPlane;
        material.uniforms.uBrightness.value = brightness;
        material.uniforms.uGamma.value = gamma;
        material.uniforms.uDensity.value = density;
        material.uniforms.uVariant.value = variantValue;
        material.uniforms.uDirection.value = (direction * Math.PI) / 180;
        material.uniforms.uColor.value.copy(colorVector);
    }, [
        flakeSize,
        minFlakeSize,
        speed,
        depthFade,
        farPlane,
        brightness,
        gamma,
        density,
        variantValue,
        direction,
        colorVector
    ]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 w-full h-full pointer-events-none transform-gpu will-change-transform backface-hidden overflow-hidden ${className}`}
            style={{
                imageRendering: 'pixelated',
                ...style
            }}
        />
    );
}
