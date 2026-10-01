"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Shared, mutable state written by the page (scroll + pointer) and read every frame. */
export type SceneState = { progress: number; mouse: { x: number; y: number }; active: number; level: number };

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Two images blended with a noisy dissolve (scroll), a ripple + RGB split
// around the pointer (hover), and faint scanlines.
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform float uMix;
  uniform float uTime;
  uniform float uHover;
  uniform float uLevel;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec2 uCover;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  vec3 rgb(sampler2D t, vec2 uv, vec2 off) {
    return vec3(texture2D(t, uv + off).r, texture2D(t, uv).g, texture2D(t, uv - off).b);
  }

  void main() {
    vec2 p = vUv;
    vec2 d = p - uMouse;
    d.x *= uAspect;
    float dist = length(d);
    float ripple = sin(dist * 38.0 - uTime * 7.0) * exp(-dist * 5.0) * uHover;
    vec2 dir = normalize(d + 1e-5);
    p += vec2(dir.x / uAspect, dir.y) * ripple * 0.03;

    float n = noise(vUv * vec2(6.0, 3.0) + uTime * 0.15);
    float bend = sin(uMix * 3.14159);
    float m = smoothstep(0.0, 1.0, clamp(uMix * 1.6 - 0.3 + (n - 0.5) * 0.6, 0.0, 1.0));
    // The music: the rings pulse outwards and the colour channels split with the beat.
    p = (p - 0.5) * (1.0 - 0.035 * uLevel) + 0.5;
    vec2 base = (p - 0.5) * uCover + 0.5;
    vec2 uvA = base + vec2(0.0, bend * 0.08 * n);
    vec2 uvB = base - vec2(0.0, bend * 0.08 * (1.0 - n));
    vec2 off = vec2(0.003 + 0.018 * uHover * exp(-dist * 3.0) + 0.012 * bend + 0.012 * uLevel, 0.0);

    vec3 col = mix(rgb(tA, uvA, off), rgb(tB, uvB, off), m);
    col *= (0.94 + 0.06 * sin(vUv.y * 900.0)) * (1.0 + 0.35 * uLevel);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Screen({ srcs, state: stateRef }: { srcs: string[]; state: RefObject<SceneState> }) {
  const { viewport, size } = useThree();

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return srcs.map((s) => {
      const t = loader.load(s);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    });
  }, [srcs]);

  const uniforms = useMemo(
    () => ({
      tA: { value: textures[0] },
      tB: { value: textures[1] ?? textures[0] },
      uMix: { value: 0 },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uLevel: { value: 0 },
      uAspect: { value: 1 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uCover: { value: new THREE.Vector2(1, 1) },
    }),
    [textures],
  );

  const material = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, dt) => {
    if (!material.current) return;
    const state = stateRef.current;
    const u = material.current.uniforms as typeof uniforms;
    u.uTime.value += dt;
    // Scroll progress picks the pair of images and how far between them we are.
    const t = state.progress * (textures.length - 1);
    const i = Math.min(textures.length - 2, Math.max(0, Math.floor(t)));
    u.tA.value = textures[i];
    u.tB.value = textures[i + 1] ?? textures[i];
    u.uMix.value = Math.min(1, Math.max(0, t - i));
    // Ease the pointer and hover strength so the ripple trails the cursor.
    const k = 1 - Math.pow(0.001, dt);
    u.uMouse.value.x += (state.mouse.x - u.uMouse.value.x) * k;
    u.uMouse.value.y += (state.mouse.y - u.uMouse.value.y) * k;
    u.uHover.value += (state.active - u.uHover.value) * k * 0.6;
    u.uLevel.value += (state.level - u.uLevel.value) * Math.min(1, dt * 8);
    // object-fit: cover for the texture inside the screen.
    const aspect = size.width / size.height;
    const img = u.tA.value.image as HTMLImageElement | undefined;
    const tex = img?.width ? img.width / img.height : 0.75;
    u.uAspect.value = aspect;
    if (aspect > tex) u.uCover.value.set(1, tex / aspect);
    else u.uCover.value.set(aspect / tex, 1);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}

export default function CorsaScene({ srcs, state, paused, mobile }: { srcs: string[]; state: RefObject<SceneState>; paused: boolean; mobile: boolean }) {
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <Screen srcs={srcs} state={state} />
    </Canvas>
  );
}
